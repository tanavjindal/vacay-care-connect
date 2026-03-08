import { useI18n } from "@/contexts/I18nContext";

const languages = [
  { name: "English", flag: "🇬🇧", code: "en" },
  { name: "Hindi", flag: "🇮🇳", code: "hi" },
  { name: "Spanish", flag: "🇪🇸", code: "es" },
  { name: "French", flag: "🇫🇷", code: "fr" },
  { name: "German", flag: "🇩🇪", code: "de" },
  { name: "Chinese", flag: "🇨🇳", code: "zh" },
  { name: "Japanese", flag: "🇯🇵", code: "ja" },
  { name: "Korean", flag: "🇰🇷", code: "ko" },
  { name: "Arabic", flag: "🇸🇦", code: "ar" },
  { name: "Russian", flag: "🇷🇺", code: "ru" },
  { name: "Portuguese", flag: "🇵🇹", code: "pt" },
  { name: "Italian", flag: "🇮🇹", code: "it" },
];

const LanguageSupport = () => {
  const { t } = useI18n();

  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t("langSupport.title")} <span className="gradient-text">{t("langSupport.titleHighlight")}</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("langSupport.subtitle")}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
          {languages.map((lang, index) => (
            <div
              key={lang.code}
              className="flex items-center gap-3 px-5 py-3 rounded-full bg-card shadow-sm border border-border/50 hover:shadow-card hover:border-primary/30 transition-all duration-300 cursor-default"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <span className="text-2xl">{lang.flag}</span>
              <span className="font-medium text-foreground">{lang.name}</span>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          {t("langSupport.more")}
        </p>
      </div>
    </section>
  );
};

export default LanguageSupport;
