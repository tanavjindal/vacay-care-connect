import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, FileText, Heart, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const CONSENT_VERSION = "1.0";

const Consent = () => {
  const [medicalDataConsent, setMedicalDataConsent] = useState(false);
  const [aadhaarConsent, setAadhaarConsent] = useState(false);
  const [thirdPartyConsent, setThirdPartyConsent] = useState(false);
  const [fullName, setFullName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const isHospital = location.state?.type === "hospital";
  const redirectTo = location.state?.redirectTo || "/";

  useEffect(() => {
    checkExistingConsent();
  }, []);

  const checkExistingConsent = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setIsChecking(false);
      return;
    }

    const consentType = isHospital ? "hospital_agreement" : "patient_agreement";
    const { data } = await supabase
      .from("user_consents")
      .select("id")
      .eq("user_id", session.user.id)
      .eq("consent_type", consentType)
      .maybeSingle();

    if (data) {
      navigate(redirectTo, { replace: true });
    } else {
      setIsChecking(false);
    }
  };

  const allChecked = medicalDataConsent && aadhaarConsent && thirdPartyConsent && fullName.trim().length >= 2;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allChecked) return;

    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("You must be logged in to provide consent.");

      const consentType = isHospital ? "hospital_agreement" : "patient_agreement";

      const { error } = await supabase.from("user_consents").insert({
        user_id: session.user.id,
        consent_type: consentType,
        consent_version: CONSENT_VERSION,
        full_name_signature: fullName.trim(),
      });

      if (error) throw error;

      toast({
        title: "Consent recorded",
        description: "Your agreement has been securely saved. Thank you.",
      });

      navigate(redirectTo, { replace: true });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-md">
              <Heart className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold gradient-text">MediBridge</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground mb-1">
            {isHospital ? "Hospital Data Agreement" : "Patient Data Consent"}
          </h1>
          <p className="text-muted-foreground text-sm">
            Please read and agree to the following terms before proceeding
          </p>
        </div>

        <Card className="p-6 shadow-card">
          {/* Legal Terms */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-foreground">Terms & Conditions</h2>
              <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">v{CONSENT_VERSION}</span>
            </div>

            <ScrollArea className="h-48 rounded-lg border border-border bg-muted/30 p-4">
              <div className="text-sm text-muted-foreground space-y-3 pr-4">
                <p className="font-medium text-foreground">1. Medical Data Sharing</p>
                <p>
                  By using MediBridge, you consent to the collection, storage, and processing of medical records
                  including but not limited to prescriptions, lab reports, imaging results, diagnoses, allergies,
                  chronic conditions, and emergency contact information. {isHospital
                    ? "As a hospital, you agree to access patient data solely for the purpose of providing medical care and only with proper authorization."
                    : "Your medical data may be shared with authorized hospitals and healthcare providers to facilitate your medical treatment."}
                </p>

                <p className="font-medium text-foreground">2. Aadhaar / National ID Usage</p>
                <p>
                  MediBridge uses national identification numbers (such as Aadhaar) solely for patient identification
                  and record matching purposes. {isHospital
                    ? "Your hospital agrees to use Aadhaar data only for verifying patient identity and accessing authorized records. You shall not store, copy, or redistribute Aadhaar numbers outside the MediBridge platform."
                    : "Your national ID will be stored securely and used only to link your medical records. It will not be shared with third parties for non-medical purposes."}
                  This usage complies with the Digital Personal Data Protection Act, 2023 (DPDP Act) and applicable UIDAI guidelines.
                </p>

                <p className="font-medium text-foreground">3. Third-Party Data Sharing</p>
                <p>
                  MediBridge will not share your personal or medical data with insurance companies, advertisers, 
                  government agencies, or any third party without your explicit written consent, except where required 
                  by law or court order. {isHospital
                    ? "Hospitals are prohibited from sharing patient data accessed through MediBridge with any third party without the patient's explicit consent."
                    : "You will be notified if any third-party access is requested and you may decline."}
                </p>

                <p className="font-medium text-foreground">4. Data Security & Audit</p>
                <p>
                  All data is encrypted in transit and at rest. Every access to patient records is logged for audit 
                  purposes. {isHospital
                    ? "Hospital staff access is tracked and audited. Unauthorized access attempts will result in immediate account suspension and may be reported to authorities."
                    : "You may request a log of who has accessed your records at any time."}
                </p>

                <p className="font-medium text-foreground">5. Right to Withdraw</p>
                <p>
                  You may withdraw your consent at any time by contacting support@medibridge.com. 
                  Upon withdrawal, your data will be deleted within 30 days unless retention is required by law.
                </p>
              </div>
            </ScrollArea>
          </div>

          {/* Checkboxes */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg border border-border bg-muted/20">
                <Checkbox
                  id="medical-data"
                  checked={medicalDataConsent}
                  onCheckedChange={(checked) => setMedicalDataConsent(checked === true)}
                  className="mt-0.5"
                />
                <Label htmlFor="medical-data" className="text-sm leading-relaxed cursor-pointer">
                  I consent to the collection, storage, and sharing of medical records as described in Section 1.
                </Label>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg border border-border bg-muted/20">
                <Checkbox
                  id="aadhaar"
                  checked={aadhaarConsent}
                  onCheckedChange={(checked) => setAadhaarConsent(checked === true)}
                  className="mt-0.5"
                />
                <Label htmlFor="aadhaar" className="text-sm leading-relaxed cursor-pointer">
                  I consent to the use of my Aadhaar / National ID for patient identification as described in Section 2.
                </Label>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg border border-border bg-muted/20">
                <Checkbox
                  id="third-party"
                  checked={thirdPartyConsent}
                  onCheckedChange={(checked) => setThirdPartyConsent(checked === true)}
                  className="mt-0.5"
                />
                <Label htmlFor="third-party" className="text-sm leading-relaxed cursor-pointer">
                  I acknowledge the third-party data sharing policy and my rights as described in Sections 3–5.
                </Label>
              </div>
            </div>

            {/* Digital Signature */}
            <div className="border-t border-border pt-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-primary" />
                <Label className="font-semibold">Digital Signature</Label>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                Type your full legal name below as your digital signature. This constitutes a legally binding agreement.
              </p>
              <Input
                placeholder={isHospital ? "Hospital Administrator Full Name" : "Your Full Legal Name"}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="font-serif italic text-lg"
              />
              {fullName.trim().length >= 2 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Signed as: <span className="font-serif italic font-medium text-foreground">{fullName}</span> on {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={!allChecked || isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Recording consent...
                </>
              ) : (
                "I Agree & Continue"
              )}
            </Button>
          </form>
        </Card>

        <p className="text-xs text-muted-foreground text-center mt-4 max-w-md mx-auto">
          This agreement is governed by the laws of India, including the Digital Personal Data Protection Act, 2023. 
          For questions, contact support@medibridge.com.
        </p>
      </div>
    </div>
  );
};

export default Consent;
