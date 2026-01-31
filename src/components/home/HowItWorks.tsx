import { Upload, Languages, MessageSquare, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: Upload,
    step: "01",
    title: "Upload Your Records",
    description: "Before your trip, upload prescriptions, lab reports, and medical history to MediBridge.",
  },
  {
    icon: Languages,
    step: "02",
    title: "Select Languages",
    description: "Choose your native language and the language you need to communicate in (Hindi, English, etc.).",
  },
  {
    icon: MessageSquare,
    step: "03",
    title: "Communicate with Context",
    description: "When you need medical help, use our AI translator that understands your medical history.",
  },
  {
    icon: CheckCircle,
    step: "04",
    title: "Get the Care You Need",
    description: "Doctors receive accurate translations with relevant medical context for better treatment.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How <span className="gradient-text">MediBridge</span> Works
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Simple steps to ensure you get the medical care you need, anywhere in India
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((item, index) => (
            <div
              key={index}
              className="relative group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[60%] w-full h-0.5 bg-gradient-to-r from-primary/50 to-primary/10" />
              )}

              <div className="relative bg-card rounded-2xl p-6 shadow-card border border-border/50 card-hover">
                {/* Step Number */}
                <span className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center shadow-md">
                  {item.step}
                </span>

                {/* Icon */}
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                  <item.icon className="w-7 h-7 text-primary" />
                </div>

                {/* Content */}
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
