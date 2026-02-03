import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2, 
  Search, 
  QrCode, 
  User, 
  FileText, 
  LogOut, 
  Heart,
  Calendar,
  AlertCircle,
  Clock,
  Crown
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import QRScanner from "@/components/hospital/QRScanner";
import PatientLookup from "@/components/hospital/PatientLookup";
import PatientDetails from "@/components/hospital/PatientDetails";
import SubscriptionBanner from "@/components/hospital/SubscriptionBanner";

interface Hospital {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
}

interface Subscription {
  id: string;
  plan: string;
  is_active: boolean;
  trial_ends_at: string | null;
  subscription_ends_at: string | null;
  price_rupees: number;
  duration_months: number;
}

interface Patient {
  id: string;
  full_name: string;
  national_id: string | null;
  date_of_birth: string | null;
  blood_type: string | null;
  allergies: string[] | null;
  chronic_conditions: string[] | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  qr_code_token: string;
}

const HospitalDashboard = () => {
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [activeTab, setActiveTab] = useState("lookup");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/hospital/auth");
      } else {
        setTimeout(() => {
          loadHospitalData(session.user.id);
        }, 0);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/hospital/auth");
      } else {
        loadHospitalData(session.user.id);
      }
    });

    return () => authSub.unsubscribe();
  }, []);

  const loadHospitalData = async (userId: string) => {
    try {
      // Get hospital staff association
      const { data: staffData, error: staffError } = await supabase
        .from("hospital_staff")
        .select("hospital_id")
        .eq("user_id", userId)
        .maybeSingle();

      if (staffError || !staffData) {
        toast({
          variant: "destructive",
          title: "Access denied",
          description: "You are not associated with any hospital.",
        });
        navigate("/hospital/auth");
        return;
      }

      // Get hospital details
      const { data: hospitalData, error: hospitalError } = await supabase
        .from("hospitals")
        .select("*")
        .eq("id", staffData.hospital_id)
        .single();

      if (hospitalError) throw hospitalError;
      setHospital(hospitalData);

      // Get subscription
      const { data: subData, error: subError } = await supabase
        .from("hospital_subscriptions")
        .select("*")
        .eq("hospital_id", staffData.hospital_id)
        .single();

      if (!subError && subData) {
        setSubscription(subData);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error loading data",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/hospital/auth");
  };

  const handlePatientFound = (patient: Patient) => {
    setSelectedPatient(patient);
    setActiveTab("details");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
          <p className="text-muted-foreground">Loading hospital portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-md">
                <Heart className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <span className="text-lg font-bold gradient-text">MediBridge</span>
                <span className="text-xs text-muted-foreground block -mt-1">Hospital Portal</span>
              </div>
            </Link>

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-foreground">{hospital?.name}</p>
                <p className="text-xs text-muted-foreground">{hospital?.city}, {hospital?.state}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Subscription Banner */}
        {subscription && <SubscriptionBanner subscription={subscription} />}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
            <TabsTrigger value="lookup" className="gap-2">
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Lookup</span>
            </TabsTrigger>
            <TabsTrigger value="scan" className="gap-2">
              <QrCode className="w-4 h-4" />
              <span className="hidden sm:inline">Scan QR</span>
            </TabsTrigger>
            <TabsTrigger value="details" className="gap-2" disabled={!selectedPatient}>
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Patient</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lookup">
            <PatientLookup 
              hospitalId={hospital?.id || ""} 
              onPatientFound={handlePatientFound} 
            />
          </TabsContent>

          <TabsContent value="scan">
            <QRScanner 
              hospitalId={hospital?.id || ""} 
              onPatientFound={handlePatientFound} 
            />
          </TabsContent>

          <TabsContent value="details">
            {selectedPatient ? (
              <PatientDetails 
                patient={selectedPatient} 
                hospitalId={hospital?.id || ""}
              />
            ) : (
              <Card className="p-12 text-center max-w-2xl mx-auto">
                <User className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="font-medium text-foreground mb-2">No patient selected</h3>
                <p className="text-sm text-muted-foreground">
                  Use the lookup or QR scanner to find a patient first.
                </p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default HospitalDashboard;
