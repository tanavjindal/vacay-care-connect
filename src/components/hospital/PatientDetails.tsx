import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Calendar, 
  Droplets, 
  AlertTriangle, 
  Activity,
  Phone,
  FileText,
  Loader2,
  Download,
  Languages
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

interface MedicalRecord {
  id: string;
  record_type: string;
  title: string;
  description: string | null;
  file_url: string | null;
  patient_id: string;
  original_language: string | null;
  translated_content: unknown;
  created_at: string;
  updated_at: string;
}

interface PatientDetailsProps {
  patient: Patient;
  hospitalId: string;
}

const PatientDetails = ({ patient, hospitalId }: PatientDetailsProps) => {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadMedicalRecords();
  }, [patient.id]);

  const loadMedicalRecords = async () => {
    try {
      const { data, error } = await supabase
        .from("patient_medical_records")
        .select("*")
        .eq("patient_id", patient.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error loading records",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const recordTypeColors: Record<string, string> = {
    prescription: "bg-blue-500/10 text-blue-600",
    lab_report: "bg-purple-500/10 text-purple-600",
    imaging: "bg-green-500/10 text-green-600",
    history: "bg-yellow-500/10 text-yellow-600",
    other: "bg-gray-500/10 text-gray-600",
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Patient Info Card */}
      <Card className="p-6">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <User className="w-10 h-10 text-primary" />
          </div>
          
          <div className="flex-grow">
            <h2 className="text-2xl font-bold text-foreground mb-1">{patient.full_name}</h2>
            <p className="text-muted-foreground mb-4">ID: {patient.national_id || "Not provided"}</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {patient.date_of_birth && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Age</p>
                    <p className="font-medium">{calculateAge(patient.date_of_birth)} years</p>
                  </div>
                </div>
              )}
              
              {patient.blood_type && (
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-destructive" />
                  <div>
                    <p className="text-xs text-muted-foreground">Blood Type</p>
                    <p className="font-medium text-destructive">{patient.blood_type}</p>
                  </div>
                </div>
              )}

              {patient.emergency_contact_name && (
                <div className="flex items-center gap-2 col-span-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Emergency Contact</p>
                    <p className="font-medium">{patient.emergency_contact_name}</p>
                    <p className="text-sm text-muted-foreground">{patient.emergency_contact_phone}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Critical Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Allergies */}
        <Card className="p-4 border-destructive/30 bg-destructive/5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <h3 className="font-semibold text-destructive">Allergies</h3>
          </div>
          {patient.allergies && patient.allergies.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {patient.allergies.map((allergy, index) => (
                <span 
                  key={index} 
                  className="px-3 py-1 bg-destructive/10 text-destructive rounded-full text-sm font-medium"
                >
                  {allergy}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No known allergies</p>
          )}
        </Card>

        {/* Chronic Conditions */}
        <Card className="p-4 border-yellow-500/30 bg-yellow-500/5">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-5 h-5 text-yellow-600" />
            <h3 className="font-semibold text-yellow-600">Chronic Conditions</h3>
          </div>
          {patient.chronic_conditions && patient.chronic_conditions.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {patient.chronic_conditions.map((condition, index) => (
                <span 
                  key={index} 
                  className="px-3 py-1 bg-yellow-500/10 text-yellow-600 rounded-full text-sm font-medium"
                >
                  {condition}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No chronic conditions recorded</p>
          )}
        </Card>
      </div>

      {/* Medical Records */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Medical Records</h3>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Languages className="w-4 h-4" />
            Translate All
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground">No medical records uploaded</p>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map((record) => (
              <div 
                key={record.id} 
                className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-foreground truncate">{record.title}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${recordTypeColors[record.record_type] || recordTypeColors.other}`}>
                      {record.record_type.replace("_", " ")}
                    </span>
                  </div>
                  {record.description && (
                    <p className="text-sm text-muted-foreground truncate">{record.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Uploaded {new Date(record.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {record.translated_content && (
                    <Button variant="ghost" size="sm" className="gap-1 text-primary">
                      <Languages className="w-4 h-4" />
                      View
                    </Button>
                  )}
                  {record.file_url && (
                    <Button variant="ghost" size="icon">
                      <Download className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default PatientDetails;
