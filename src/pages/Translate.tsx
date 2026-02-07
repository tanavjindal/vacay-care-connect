import Header from "@/components/layout/Header";
import TranslatorWidget from "@/components/translator/TranslatorWidget";

const Translate = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Medical <span className="gradient-text">Translation</span>
            </h1>
            <p className="text-muted-foreground">
              Translate medical conversations with AI-powered accuracy across 40+ languages
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <TranslatorWidget />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Translate;
