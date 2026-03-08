import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { QrCode, Camera, AlertCircle, Loader2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Html5Qrcode } from "html5-qrcode";

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

interface QRScannerProps {
  hospitalId: string;
  onPatientFound: (patient: Patient) => void;
}

const QRScanner = ({ hospitalId, onPatientFound }: QRScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const startScanner = async () => {
    setIsScanning(true);
    setError(null);

    try {
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        onScanSuccess,
        () => {} // Ignore failures during scanning
      );
    } catch (err: any) {
      setError(err.message || "Could not start camera");
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
      } catch (err) {
        // Ignore errors when stopping
      }
    }
    setIsScanning(false);
  };

  const onScanSuccess = async (decodedText: string) => {
    // Stop scanner immediately
    await stopScanner();
    setIsLoading(true);

    try {
      // Parse QR code - expected format: translatical:patient:{qr_code_token}
      let token = decodedText;
      if (decodedText.startsWith("translatical:patient:")) {
        token = decodedText.replace("translatical:patient:", "");
      }

      // Look up patient by QR token
      const { data: patient, error: patientError } = await supabase
        .from("patients")
        .select("*")
        .eq("qr_code_token", token)
        .maybeSingle();

      if (patientError) throw patientError;

      if (!patient) {
        setError("Invalid QR code. Patient not found.");
        return;
      }

      // Log access for audit
      const session = await supabase.auth.getSession();
      if (session.data.session) {
        await supabase.from("hospital_patient_access_logs").insert({
          hospital_id: hospitalId,
          patient_id: patient.id,
          accessed_by: session.data.session.user.id,
          access_method: "qr_scan",
        });
      }

      toast({
        title: "Patient found!",
        description: `Loading records for ${patient.full_name}`,
      });

      onPatientFound(patient);
    } catch (err: any) {
      setError(err.message || "Failed to look up patient");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <QrCode className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Scan Patient QR Code</h2>
          <p className="text-sm text-muted-foreground">
            Scan the patient's Translatical QR code for instant access to their medical records
          </p>
        </div>

        {/* Scanner Container */}
        <div className="relative">
          {!isScanning && !isLoading && (
            <div className="aspect-square max-w-sm mx-auto bg-muted/50 rounded-2xl flex flex-col items-center justify-center p-8">
              <Camera className="w-16 h-16 text-muted-foreground/50 mb-4" />
              <Button onClick={startScanner} className="gap-2">
                <QrCode className="w-4 h-4" />
                Start Camera
              </Button>
            </div>
          )}

          {isScanning && (
            <div className="relative">
              <div 
                id="qr-reader" 
                className="aspect-square max-w-sm mx-auto rounded-2xl overflow-hidden"
              />
              <Button 
                variant="secondary" 
                size="sm" 
                className="absolute top-2 right-2 gap-1"
                onClick={stopScanner}
              >
                <X className="w-4 h-4" />
                Stop
              </Button>
            </div>
          )}

          {isLoading && (
            <div className="aspect-square max-w-sm mx-auto bg-muted/50 rounded-2xl flex flex-col items-center justify-center p-8">
              <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
              <p className="text-muted-foreground">Looking up patient...</p>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-destructive/10 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-destructive">Scan failed</p>
              <p className="text-sm text-destructive/80">{error}</p>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 space-y-2">
          <h4 className="font-medium text-foreground text-sm">How it works:</h4>
          <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Ask the patient to show their Translatical QR code from their phone</li>
            <li>Point your camera at the QR code</li>
            <li>Patient records will load automatically</li>
          </ol>
        </div>
      </Card>

      {/* Privacy Notice */}
      <p className="text-xs text-muted-foreground text-center mt-4">
        QR scans are logged for audit purposes. Patient data is encrypted and secure.
      </p>
    </div>
  );
};

export default QRScanner;
