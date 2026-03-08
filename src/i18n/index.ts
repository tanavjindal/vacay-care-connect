import en from "./translations/en";
import hi from "./translations/hi";
import ta from "./translations/ta";
import es from "./translations/es";
import fr from "./translations/fr";

export type TranslationKey = keyof typeof en;

// Static translations for supported languages
const staticTranslations: Record<string, Record<string, string>> = {
  en,
  hi,
  ta,
  es,
  fr,
};

// Languages that have static translations
export const STATIC_LANGUAGES = ["en", "hi", "ta", "es", "fr"];

// All supported languages with labels
export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
  { code: "ta", label: "தமிழ்", flag: "🇮🇳" },
  { code: "te", label: "తెలుగు", flag: "🇮🇳" },
  { code: "bn", label: "বাংলা", flag: "🇮🇳" },
  { code: "mr", label: "मराठी", flag: "🇮🇳" },
  { code: "kn", label: "ಕನ್ನಡ", flag: "🇮🇳" },
  { code: "gu", label: "ગુજરાતી", flag: "🇮🇳" },
  { code: "ml", label: "മലയാളം", flag: "🇮🇳" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
  { code: "ko", label: "한국어", flag: "🇰🇷" },
];

export function getStaticTranslation(lang: string, key: string): string | null {
  return staticTranslations[lang]?.[key] ?? null;
}

export function detectBrowserLanguage(): string {
  const browserLang = navigator.language || (navigator as any).userLanguage || "en";
  // Extract base language code (e.g., "en-US" -> "en", "hi-IN" -> "hi")
  const baseLang = browserLang.split("-")[0].toLowerCase();
  
  // Check if we support this language
  const supported = SUPPORTED_LANGUAGES.find((l) => l.code === baseLang);
  return supported ? baseLang : "en";
}

export { en as defaultTranslations };
