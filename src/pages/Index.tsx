import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import HeroSection from "@/components/home/HeroSection";
import HowItWorks from "@/components/home/HowItWorks";
import LanguageSupport from "@/components/home/LanguageSupport";
import CTASection from "@/components/home/CTASection";
import { useI18n } from "@/contexts/I18nContext";

const Index = () => {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <HowItWorks />
        <LanguageSupport />
        <CTASection />
      </main>
      
      <footer className="py-8 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              {t("footer.copyright")}
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
              <span>{t("footer.madeWith")}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
