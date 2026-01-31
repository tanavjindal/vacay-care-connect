import Header from "@/components/layout/Header";
import HeroSection from "@/components/home/HeroSection";
import HowItWorks from "@/components/home/HowItWorks";
import LanguageSupport from "@/components/home/LanguageSupport";
import CTASection from "@/components/home/CTASection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <HowItWorks />
        <LanguageSupport />
        <CTASection />
      </main>
      
      {/* Footer */}
      <footer className="py-8 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 MediBridge. Breaking language barriers to save lives.
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span>Made with ❤️ for tourists visiting India</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
