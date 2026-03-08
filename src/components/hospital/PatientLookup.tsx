import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Search, User, AlertCircle, Loader2 } from "lucide-react";
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

interface PatientLookupProps {
  hospitalId: string;
  onPatientFound: (patient: Patient) => void;
}

const PatientLookup = ({ hospitalId, onPatientFound }: PatientLookupProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setHasSearched(true);

    try {
      // Search by national ID or name
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .ilike("national_id", `%${searchQuery}%`)
        .limit(10);

      if (error) throw error;

      setSearchResults(data || []);

      if (data && data.length > 0) {
        // Log access for audit trail
        const session = await supabase.auth.getSession();
        if (session.data.session) {
          await supabase.from("hospital_patient_access_logs").insert({
            hospital_id: hospitalId,
            patient_id: data[0].id,
            accessed_by: session.data.session.user.id,
            access_method: "id_lookup",
          });
        }
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Search failed",
        description: error.message,
      });
    } finally {
      setIsSearching(false);
    }
  };

  const selectPatient = (patient: Patient) => {
    onPatientFound(patient);
    toast({
      title: "Patient found",
      description: `Loading records for ${patient.full_name}`,
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Patient Lookup</h2>
          <p className="text-sm text-muted-foreground">
            Search by National ID or Aadhaar number
          </p>
        </div>

        <form onSubmit={handleSearch} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="search">Aadhaar / National ID Number</Label>
            <div className="flex gap-2">
              <Input
                id="search"
                placeholder="Enter Aadhaar or National ID number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={isSearching || !searchQuery.trim()}>
                {isSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </form>

        {/* Search Results */}
        {hasSearched && (
          <div className="mt-6">
            {searchResults.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground">No patients found matching "{searchQuery}"</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Try a different ID or check the spelling
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Found {searchResults.length} result(s)
                </p>
                {searchResults.map((patient) => (
                  <Card
                    key={patient.id}
                    className="p-4 cursor-pointer hover:shadow-card transition-shadow border-border/50"
                    onClick={() => selectPatient(patient)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <User className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-grow min-w-0">
                        <h4 className="font-medium text-foreground truncate">
                          {patient.full_name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          ID: {patient.national_id || "Not provided"}
                        </p>
                        {patient.blood_type && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-destructive/10 text-destructive text-xs rounded-full">
                            Blood: {patient.blood_type}
                          </span>
                        )}
                      </div>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Privacy Notice */}
      <p className="text-xs text-muted-foreground text-center mt-4">
        All patient lookups are logged for audit purposes. Access is only permitted for 
        authorized hospital staff with active subscriptions.
      </p>
    </div>
  );
};

export default PatientLookup;
