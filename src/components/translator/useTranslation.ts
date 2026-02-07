import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useTranslation = () => {
  const [isTranslating, setIsTranslating] = useState(false);

  const translate = useCallback(async (text: string, sourceLang: string, targetLang: string): Promise<string> => {
    setIsTranslating(true);
    try {
      const { data, error } = await supabase.functions.invoke("translate", {
        body: { text, sourceLang, targetLang },
      });

      if (error) throw error;
      return data.translation || "";
    } finally {
      setIsTranslating(false);
    }
  }, []);

  return { translate, isTranslating };
};
