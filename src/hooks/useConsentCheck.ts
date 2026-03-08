import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useConsentCheck = (consentType: "patient_agreement" | "hospital_agreement") => {
  const [hasConsented, setHasConsented] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setHasConsented(false);
        setIsLoading(false);
        return;
      }

      const { data } = await supabase
        .from("user_consents")
        .select("id")
        .eq("user_id", session.user.id)
        .eq("consent_type", consentType)
        .maybeSingle();

      setHasConsented(!!data);
      setIsLoading(false);
    };

    check();
  }, [consentType]);

  return { hasConsented, isLoading };
};
