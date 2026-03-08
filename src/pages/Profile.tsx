import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/layout/Header";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { User, Phone, MapPin, Building2, Globe, Bell, LogOut, Loader2, Save, CreditCard, Droplets, AlertTriangle, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Profile = {
  display_name: string;
  avatar_url: string;
  phone: string;
  address: string;
  city: string;
  preferred_language: string;
  notifications_enabled: boolean;
};

type PatientInfo = {
  national_id: string;
  full_name: string;
  date_of_birth: string;
  blood_type: string;
  allergies: string;
  chronic_conditions: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
};

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
  { value: "ta", label: "Tamil" },
  { value: "te", label: "Telugu" },
  { value: "bn", label: "Bengali" },
  { value: "mr", label: "Marathi" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "ja", label: "Japanese" },
];

const ProfilePage = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile>({
    display_name: "",
    avatar_url: "",
    phone: "",
    address: "",
    city: "",
    preferred_language: "en",
    notifications_enabled: true,
  });
  const [patient, setPatient] = useState<PatientInfo>({
    national_id: "",
    full_name: "",
    date_of_birth: "",
    blood_type: "",
    allergies: "",
    chronic_conditions: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
  });
  const [hasPatientRecord, setHasPatientRecord] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (profileData) {
        setProfile({
          display_name: profileData.display_name || "",
          avatar_url: profileData.avatar_url || "",
          phone: profileData.phone || "",
          address: profileData.address || "",
          city: profileData.city || "",
          preferred_language: profileData.preferred_language || "en",
          notifications_enabled: profileData.notifications_enabled ?? true,
        });
      }

      // Fetch patient record
      const { data: patientData } = await supabase
        .from("patients")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (patientData) {
        setHasPatientRecord(true);
        setPatient({
          national_id: patientData.national_id || "",
          full_name: patientData.full_name || "",
          date_of_birth: patientData.date_of_birth || "",
          blood_type: patientData.blood_type || "",
          allergies: patientData.allergies?.join(", ") || "",
          chronic_conditions: patientData.chronic_conditions?.join(", ") || "",
          emergency_contact_name: patientData.emergency_contact_name || "",
          emergency_contact_phone: patientData.emergency_contact_phone || "",
        });
      }

      setLoading(false);
    };
    fetchData();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    // Save profile
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        display_name: profile.display_name,
        avatar_url: profile.avatar_url,
        phone: profile.phone,
        address: profile.address,
        city: profile.city,
        preferred_language: profile.preferred_language,
        notifications_enabled: profile.notifications_enabled,
      })
      .eq("user_id", user.id);

    // Save patient record (upsert)
    const patientPayload = {
      user_id: user.id,
      full_name: patient.full_name || profile.display_name,
      national_id: patient.national_id || null,
      date_of_birth: patient.date_of_birth || null,
      blood_type: patient.blood_type || null,
      allergies: patient.allergies ? patient.allergies.split(",").map((s) => s.trim()).filter(Boolean) : null,
      chronic_conditions: patient.chronic_conditions ? patient.chronic_conditions.split(",").map((s) => s.trim()).filter(Boolean) : null,
      emergency_contact_name: patient.emergency_contact_name || null,
      emergency_contact_phone: patient.emergency_contact_phone || null,
    };

    let patientError: any = null;
    if (hasPatientRecord) {
      const { error } = await supabase.from("patients").update(patientPayload).eq("user_id", user.id);
      patientError = error;
    } else if (patient.national_id || patient.full_name) {
      const { error } = await supabase.from("patients").insert(patientPayload);
      patientError = error;
      if (!error) setHasPatientRecord(true);
    }

    setSaving(false);
    if (profileError || patientError) {
      toast({ title: "Error saving", description: (profileError || patientError)?.message, variant: "destructive" });
    } else {
      toast({ title: "Profile updated", description: "Your changes have been saved." });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 pt-24 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-12 max-w-lg">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
          <Button variant="outline" size="sm" onClick={handleSignOut} className="gap-2 text-destructive hover:text-destructive">
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>

        <Card className="p-6">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
              {profile.display_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "?"}
            </div>
            <div>
              <p className="font-semibold text-foreground">{profile.display_name || "No name set"}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="display_name">Display Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="display_name" className="pl-10" value={profile.display_name} onChange={(e) => setProfile({ ...profile, display_name: e.target.value })} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="phone" type="tel" className="pl-10" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="+91 98765 43210" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="address" className="pl-10" value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} placeholder="123 Main Street" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="city" className="pl-10" value={profile.city} onChange={(e) => setProfile({ ...profile, city: e.target.value })} placeholder="Mumbai" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Preferred Language</Label>
              <Select value={profile.preferred_language} onValueChange={(v) => setProfile({ ...profile, preferred_language: v })}>
                <SelectTrigger className="gap-2">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Medical Identity Section */}
            <div className="pt-4 mt-4 border-t border-border">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary" />
                Medical Identity
              </h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="national_id">Aadhaar / National ID</Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="national_id"
                      className="pl-10 tracking-widest font-mono"
                      value={patient.national_id}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, "").slice(0, 12);
                        const formatted = raw.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
                        setPatient({ ...patient, national_id: formatted });
                      }}
                      placeholder="1234 5678 9012"
                      maxLength={14}
                      inputMode="numeric"
                    />
                  </div>
                  {patient.national_id && patient.national_id.replace(/\s/g, "").length > 0 && patient.national_id.replace(/\s/g, "").length < 12 && (
                    <p className="text-xs text-destructive">Aadhaar number must be 12 digits</p>
                  )}
                  {(!patient.national_id || patient.national_id.replace(/\s/g, "").length === 0) && (
                    <p className="text-xs text-muted-foreground">Used for patient identification at hospitals</p>
                  )}
                  {patient.national_id && patient.national_id.replace(/\s/g, "").length === 12 && (
                    <p className="text-xs text-green-600">✓ Valid format</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="full_name_medical">Full Legal Name (Medical Records)</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="full_name_medical" className="pl-10" value={patient.full_name} onChange={(e) => setPatient({ ...patient, full_name: e.target.value })} placeholder="As on your ID" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input id="dob" type="date" value={patient.date_of_birth} onChange={(e) => setPatient({ ...patient, date_of_birth: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="blood_type">Blood Type</Label>
                    <div className="relative">
                      <Droplets className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="blood_type" className="pl-10" value={patient.blood_type} onChange={(e) => setPatient({ ...patient, blood_type: e.target.value })} placeholder="A+, B-, O+" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="allergies">Allergies</Label>
                  <div className="relative">
                    <AlertTriangle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="allergies" className="pl-10" value={patient.allergies} onChange={(e) => setPatient({ ...patient, allergies: e.target.value })} placeholder="Penicillin, Peanuts (comma-separated)" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="chronic">Chronic Conditions</Label>
                  <Input id="chronic" value={patient.chronic_conditions} onChange={(e) => setPatient({ ...patient, chronic_conditions: e.target.value })} placeholder="Diabetes, Asthma (comma-separated)" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergency_name">Emergency Contact</Label>
                    <Input id="emergency_name" value={patient.emergency_contact_name} onChange={(e) => setPatient({ ...patient, emergency_contact_name: e.target.value })} placeholder="Contact name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergency_phone">Emergency Phone</Label>
                    <Input id="emergency_phone" type="tel" value={patient.emergency_contact_phone} onChange={(e) => setPatient({ ...patient, emergency_contact_phone: e.target.value })} placeholder="+91 98765 43210" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-muted-foreground" />
                <Label htmlFor="notifications">Notifications</Label>
              </div>
              <Switch id="notifications" checked={profile.notifications_enabled} onCheckedChange={(v) => setProfile({ ...profile, notifications_enabled: v })} />
            </div>

            <Button type="submit" className="w-full gap-2" disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </Button>
          </form>
        </Card>
      </main>
    </div>
  );
};

export default ProfilePage;
