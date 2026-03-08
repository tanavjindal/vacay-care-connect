import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, Loader2, LogIn, Download, RefreshCw } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const MyQRCode = () => {
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [patientName, setPatientName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasPatientRecord, setHasPatientRecord] = useState(false);

  // Registration form state
  const [fullName, setFullName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkSession();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkSession();
    });
    return () => subscription.unsubscribe();
  }, []);

  const checkSession = async () => {
    setIsLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setIsLoggedIn(false);
      setIsLoading(false);
      return;
    }
    setIsLoggedIn(true);
    await loadPatientRecord(session.user.id);
    setIsLoading(false);
  };

  const loadPatientRecord = async (userId: string) => {
    const { data, error } = await supabase
      .from("patients")
      .select("qr_code_token, full_name")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    if (data) {
      setQrToken(data.qr_code_token);
      setPatientName(data.full_name);
      setHasPatientRecord(true);
    } else {
      setHasPatientRecord(false);
    }
  };

  const createPatientRecord = async () => {
    if (!fullName.trim()) return;
    setIsCreating(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase.from("patients").insert({
      full_name: fullName.trim(),
      user_id: session.user.id,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setIsCreating(false);
      return;
    }

    toast({ title: "Profile created!", description: "Your QR code is ready." });
    await loadPatientRecord(session.user.id);
    setIsCreating(false);
  };

  const downloadQR = () => {
    const svg = document.getElementById("patient-qr-code");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      ctx?.drawImage(img, 0, 0, 512, 512);
      const a = document.createElement("a");
      a.download = "translatical-qr.png";
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const qrValue = qrToken ? `translatical:patient:${qrToken}` : "";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-lg">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">
              My <span className="gradient-text">QR Code</span>
            </h1>
            <p className="text-muted-foreground">
              Show this code at any hospital for instant access to your records
            </p>
          </div>

          {isLoading ? (
            <Card className="p-12 flex flex-col items-center justify-center">
              <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
              <p className="text-muted-foreground">Loading...</p>
            </Card>
          ) : !isLoggedIn ? (
            <Card className="p-8 text-center">
              <LogIn className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Sign in required</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Create an account or sign in to generate your personal QR code.
              </p>
              <Link to="/hospital/auth">
                <Button>Sign In / Sign Up</Button>
              </Link>
            </Card>
          ) : !hasPatientRecord ? (
            <Card className="p-8">
              <h3 className="font-semibold text-foreground mb-4 text-center">Create your patient profile</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
                <Button onClick={createPatientRecord} disabled={!fullName.trim() || isCreating} className="w-full">
                  {isCreating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Create Profile & Generate QR
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="p-8 flex flex-col items-center">
              <p className="text-sm text-muted-foreground mb-1">Patient</p>
              <h3 className="font-semibold text-lg text-foreground mb-6">{patientName}</h3>

              <div className="bg-white p-4 rounded-2xl shadow-md mb-6">
                <QRCodeSVG
                  id="patient-qr-code"
                  value={qrValue}
                  size={256}
                  level="H"
                  includeMargin
                />
              </div>

              <p className="text-xs text-muted-foreground text-center mb-6 max-w-xs">
                Present this QR code at any Translatical-enabled hospital. Staff will scan it to securely access your medical records.
              </p>

              <div className="flex gap-3">
                <Button variant="outline" onClick={downloadQR} className="gap-2">
                  <Download className="w-4 h-4" />
                  Save as Image
                </Button>
                <Button variant="ghost" onClick={checkSession} className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </Button>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default MyQRCode;
