import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Globe, FileText } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-pattern opacity-50" />
      
      {/* Gradient Orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 animate-fade-in">
            <Globe className="w-4 h-4" />
            <span>Designed for Tourists in India</span>
          </div>

          {/* Slogan */}
          <p className="text-lg md:text-xl font-medium text-primary mb-4 slide-up">
            Saving lives, <span className="italic">un mot à la fois</span>
          </p>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight slide-up" style={{ animationDelay: "0.1s" }}>
            Your Medical Records,{" "}
            <span className="gradient-text">Translated</span> for Care
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 slide-up" style={{ animationDelay: "0.2s" }}>
            Upload your medical history once. Get instant translations with medical context when you need care abroad.
            Breaking language barriers to save lives.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 slide-up" style={{ animationDelay: "0.3s" }}>
            <Link to="/documents">
              <Button variant="hero" size="xl" className="w-full sm:w-auto">
                Upload Your Records
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/translate">
              <Button variant="outline" size="xl" className="w-full sm:w-auto">
                Start Translating
              </Button>
            </Link>
          </div>

          {/* Features Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto slide-up" style={{ animationDelay: "0.4s" }}>
            <FeatureCard
              icon={FileText}
              title="Upload Once"
              description="Store all your medical records securely"
            />
            <FeatureCard
              icon={Globe}
              title="Translate Instantly"
              description="Get context-aware medical translations"
            />
            <FeatureCard
              icon={Shield}
              title="Stay Safe"
              description="Communicate effectively with doctors"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => (
  <div className="p-6 rounded-2xl bg-card shadow-card card-hover border border-border/50">
    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 mx-auto">
      <Icon className="w-6 h-6 text-primary" />
    </div>
    <h3 className="font-semibold text-foreground mb-2">{title}</h3>
    <p className="text-sm text-muted-foreground">{description}</p>
  </div>
);

export default HeroSection;
