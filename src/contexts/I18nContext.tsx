import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { getStaticTranslation, detectBrowserLanguage, STATIC_LANGUAGES, type TranslationKey } from "@/i18n";
import { supabase } from "@/integrations/supabase/client";

type I18nContextType = {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: TranslationKey | string) => string;
  isTranslating: boolean;
};

const I18nContext = createContext<I18nContextType>({
  language: "en",
  setLanguage: () => {},
  t: (key) => key,
  isTranslating: false,
});

export const useI18n = () => useContext(I18nContext);

// Cache for AI-translated strings
const aiTranslationCache: Record<string, Record<string, string>> = {};

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState("en");
  const [dynamicTranslations, setDynamicTranslations] = useState<Record<string, string>>({});
  const [isTranslating, setIsTranslating] = useState(false);

  // Detect browser language on mount
  useEffect(() => {
    const saved = localStorage.getItem("translatical_language");
    if (saved) {
      setLanguageState(saved);
    } else {
      const detected = detectBrowserLanguage();
      setLanguageState(detected);
      localStorage.setItem("translatical_language", detected);
    }
  }, []);

  // When language changes to a non-static language, fetch AI translations
  useEffect(() => {
    if (language === "en" || STATIC_LANGUAGES.includes(language)) {
      setDynamicTranslations({});
      return;
    }

    // Check cache first
    if (aiTranslationCache[language]) {
      setDynamicTranslations(aiTranslationCache[language]);
      return;
    }

    // Fetch AI translations for all English keys
    const fetchAITranslations = async () => {
      setIsTranslating(true);
      try {
        const { getStaticTranslation: _, defaultTranslations } = await import("@/i18n");
        const enKeys = defaultTranslations;
        const keysToTranslate = Object.entries(enKeys);

        // Batch translate via edge function
        const textsToTranslate = keysToTranslate.map(([, value]) => value);
        
        const { data, error } = await supabase.functions.invoke("translate", {
          body: {
            texts: textsToTranslate,
            targetLanguage: language,
            context: "UI labels for a medical records app",
          },
        });

        if (!error && data?.translations) {
          const translated: Record<string, string> = {};
          keysToTranslate.forEach(([key], i) => {
            translated[key] = data.translations[i] || keysToTranslate[i][1];
          });
          aiTranslationCache[language] = translated;
          setDynamicTranslations(translated);
        }
      } catch (e) {
        console.error("AI translation failed, falling back to English:", e);
      } finally {
        setIsTranslating(false);
      }
    };

    fetchAITranslations();
  }, [language]);

  const setLanguage = useCallback((lang: string) => {
    setLanguageState(lang);
    localStorage.setItem("translatical_language", lang);
  }, []);

  const t = useCallback(
    (key: TranslationKey | string): string => {
      if (language === "en") {
        return getStaticTranslation("en", key) || key;
      }

      // Try static translations first
      const staticResult = getStaticTranslation(language, key);
      if (staticResult) return staticResult;

      // Try dynamic (AI) translations
      if (dynamicTranslations[key]) return dynamicTranslations[key];

      // Fallback to English
      return getStaticTranslation("en", key) || key;
    },
    [language, dynamicTranslations]
  );

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, isTranslating }}>
      {children}
    </I18nContext.Provider>
  );
};
