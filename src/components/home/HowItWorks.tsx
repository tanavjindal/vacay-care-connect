import { Upload, Languages, MessageSquare, CheckCircle } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";

const HowItWorks = () => {
  const { t } = useI18n();

  const steps = [
    { icon: Upload, step: "01", title: t("howItWorks.step1Title"), description: t("howItWorks.step1Desc") },
    { icon: Languages, step: "02", title: t("howItWorks.step2Title"), description: t("howItWorks.step2Desc") },
    { icon: MessageSquare, step: "03", title: t("howItWorks.step3Title"), description: t("howItWorks.step3Desc") },
    { icon: CheckCircle, step: "04", title: t("howItWorks.step4Title"), description: t("howItWorks.step4Desc") },
  ];

  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t("howItWorks.title")}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("howItWorks.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((item, index) => (
            <div key={index} className="relative group" style={{ animationDelay: `${index * 0.1}s` }}>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[60%] w-full h-0.5 bg-gradient-to-r from-primary/50 to-primary/10" />
              )}
              <div className="relative bg-card rounded-2xl p-6 shadow-card border border-border/50 card-hover">
                <span className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center shadow-md">
                  {item.step}
                </span>
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                  <item.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
