import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Globe, FileText } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";

const HeroSection = () => {
  const { t } = useI18n();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      <div className="absolute inset-0 bg-pattern opacity-50" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 animate-fade-in">
            <Globe className="w-4 h-4" />
            <span>{t("hero.badge")}</span>
          </div>

          <p className="text-lg md:text-xl font-medium text-primary mb-4 slide-up">
            {t("hero.slogan")}
          </p>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight slide-up" style={{ animationDelay: "0.1s" }}>
            {t("hero.headline")}{" "}
            <span className="gradient-text">{t("hero.headlineHighlight")}</span> {t("hero.headlineSuffix")}
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 slide-up" style={{ animationDelay: "0.2s" }}>
            {t("hero.subheadline")}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 slide-up" style={{ animationDelay: "0.3s" }}>
            <Link to="/documents">
              <Button variant="hero" size="xl" className="w-full sm:w-auto">
                {t("hero.uploadBtn")}
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/translate">
              <Button variant="outline" size="xl" className="w-full sm:w-auto">
                {t("hero.translateBtn")}
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto slide-up" style={{ animationDelay: "0.4s" }}>
            <FeatureCard icon={FileText} title={t("hero.feature1Title")} description={t("hero.feature1Desc")} />
            <FeatureCard icon={Globe} title={t("hero.feature2Title")} description={t("hero.feature2Desc")} />
            <FeatureCard icon={Shield} title={t("hero.feature3Title")} description={t("hero.feature3Desc")} />
          </div>
        </div>
      </div>
    </section>
  );
};

const FeatureCard = ({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) => (
  <div className="p-6 rounded-2xl bg-card shadow-card card-hover border border-border/50">
    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 mx-auto">
      <Icon className="w-6 h-6 text-primary" />
    </div>
    <h3 className="font-semibold text-foreground mb-2">{title}</h3>
    <p className="text-sm text-muted-foreground">{description}</p>
  </div>
);

export default HeroSection;
