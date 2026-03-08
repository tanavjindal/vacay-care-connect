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

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (data) {
        setProfile({
          display_name: data.display_name || "",
          avatar_url: data.avatar_url || "",
          phone: data.phone || "",
          address: data.address || "",
          city: data.city || "",
          preferred_language: data.preferred_language || "en",
          notifications_enabled: data.notifications_enabled ?? true,
        });
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
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
    setSaving(false);
    if (error) {
      toast({ title: "Error saving", description: error.message, variant: "destructive" });
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
