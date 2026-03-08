import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Mail, Lock, Phone, MapPin, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const HospitalAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const navigate = useNavigate();
  const { toast } = useToast();

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup form state
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [hospitalName, setHospitalName] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        // Check if user is hospital staff
        setTimeout(() => {
          checkHospitalAccess(session.user.id);
        }, 0);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        checkHospitalAccess(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkHospitalAccess = async (userId: string) => {
    const { data: staffData } = await supabase
      .from("hospital_staff")
      .select("hospital_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (staffData) {
      // Check consent before going to dashboard
      const { data: consentData } = await supabase
        .from("user_consents")
        .select("id")
        .eq("user_id", userId)
        .eq("consent_type", "hospital_agreement")
        .maybeSingle();

      if (consentData) {
        navigate("/hospital/dashboard");
      } else {
        navigate("/consent", { state: { type: "hospital", redirectTo: "/hospital/dashboard" } });
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) throw error;

      toast({
        title: "Welcome back!",
        description: "Successfully logged in to hospital portal.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "Invalid credentials",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/hospital/dashboard`,
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // Generate hospital ID client-side to avoid SELECT permission issue
        const hospitalId = crypto.randomUUID();
        
        // Create hospital record (without .select() to avoid RLS SELECT issue)
        const { error: hospitalError } = await supabase
          .from("hospitals")
          .insert({
            id: hospitalId,
            name: hospitalName,
            registration_number: registrationNumber || null,
            phone,
            city,
            state,
            email: signupEmail,
          });

        if (hospitalError) throw hospitalError;

        // Link user to hospital as admin
        const { error: staffError } = await supabase.from("hospital_staff").insert({
          hospital_id: hospitalId,
          user_id: authData.user.id,
          is_admin: true,
        });

        if (staffError) throw staffError;

        // Create trial subscription (1 month free)
        const trialEnds = new Date();
        trialEnds.setMonth(trialEnds.getMonth() + 1);

        const { error: subError } = await supabase.from("hospital_subscriptions").insert({
          hospital_id: hospitalId,
          plan: "trial",
          price_rupees: 0,
          duration_months: 1,
          trial_ends_at: trialEnds.toISOString(),
          subscription_ends_at: trialEnds.toISOString(),
          is_active: true,
        });

        if (subError) throw subError;

        // Add hospital_admin role
        const { error: roleError } = await supabase.from("user_roles").insert({
          user_id: authData.user.id,
          role: "hospital_admin",
        });

        if (roleError) throw roleError;

        toast({
          title: "Registration successful!",
          description: "Please check your email to verify your account. Your 1-month free trial has started!",
        });
      }
    } catch (error: any) {
      const isAlreadyRegistered =
        error.message?.toLowerCase().includes("already") ||
        error.code === "user_already_exists";

      if (isAlreadyRegistered) {
        toast({
          title: "Account already exists",
          description: "This email is already registered. Please switch to the Login tab to sign in.",
        });
        setActiveTab("login");
        setLoginEmail(signupEmail);
      } else {
        toast({
          variant: "destructive",
          title: "Registration failed",
          description: error.message || "Could not create hospital account",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-md">
              <Heart className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold gradient-text">Translatical</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground mb-2">Hospital Portal</h1>
          <p className="text-muted-foreground">Access patient records and medical translations</p>
        </div>

        <Card className="p-6 shadow-card">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Register Hospital</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="hospital@example.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Login to Portal"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="hospital-name">Hospital Name *</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="hospital-name"
                      placeholder="City General Hospital"
                      value={hospitalName}
                      onChange={(e) => setHospitalName(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registration-number">Registration Number</Label>
                  <Input
                    id="registration-number"
                    placeholder="MH-12345"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="city"
                        placeholder="Mumbai"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      placeholder="Maharashtra"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Admin Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="admin@hospital.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      className="pl-10"
                      minLength={6}
                      required
                    />
                  </div>
                </div>

                <div className="bg-primary/10 rounded-lg p-4 text-center">
                  <p className="text-sm font-medium text-primary">🎉 1 Month Free Trial</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Get full access to all features. No credit card required.
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Register Hospital"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Not a hospital?{" "}
          <Link to="/" className="text-primary hover:underline">
            Go to patient portal
          </Link>
        </p>
      </div>
    </div>
  );
};

export default HospitalAuth;
