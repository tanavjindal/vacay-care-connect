import { useState } from "react";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ArrowRight, 
  ArrowLeftRight, 
  Mic, 
  Volume2, 
  Copy, 
  Check,
  Sparkles,
  FileText
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const languages = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "hi", name: "Hindi", flag: "🇮🇳" },
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "de", name: "German", flag: "🇩🇪" },
  { code: "zh", name: "Chinese", flag: "🇨🇳" },
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
  { code: "ko", name: "Korean", flag: "🇰🇷" },
  { code: "ar", name: "Arabic", flag: "🇸🇦" },
  { code: "ru", name: "Russian", flag: "🇷🇺" },
];

const Translate = () => {
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("hi");
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const swapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setInputText(translatedText);
    setTranslatedText(inputText);
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      toast({
        title: "Enter some text",
        description: "Please enter the text you want to translate.",
        variant: "destructive",
      });
      return;
    }

    setIsTranslating(true);
    
    // Simulated translation - in production, this would call the AI backend
    setTimeout(() => {
      // Demo translation with medical context
      const demoTranslations: Record<string, string> = {
        "I have a headache": "मुझे सिरदर्द है (Mujhe sirdard hai)",
        "I have diabetes": "मुझे मधुमेह है (Mujhe madhumeh hai) - Note: Based on your medical records, patient has Type 2 Diabetes",
        "I need my prescription": "मुझे अपनी दवाई की पर्ची चाहिए (Mujhe apni dawai ki parchi chahiye)",
      };
      
      setTranslatedText(
        demoTranslations[inputText] || 
        `[Translation to ${languages.find(l => l.code === targetLang)?.name}]: ${inputText}\n\n(Connect to AI for real translations)`
      );
      setIsTranslating(false);
    }, 1000);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied!",
      description: "Translation copied to clipboard.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="max-w-3xl mx-auto text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Medical <span className="gradient-text">Translation</span>
            </h1>
            <p className="text-muted-foreground">
              Translate medical conversations with context from your medical history
            </p>
          </div>

          {/* Context Banner */}
          <Card className="max-w-4xl mx-auto mb-8 p-4 bg-primary/5 border-primary/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-grow">
                <p className="text-sm font-medium text-foreground">Medical Context Active</p>
                <p className="text-xs text-muted-foreground">
                  Your uploaded medical records will be used to provide accurate translations
                </p>
              </div>
              <Button variant="outline" size="sm">
                View Records
              </Button>
            </div>
          </Card>

          {/* Translation Interface */}
          <div className="max-w-4xl mx-auto">
            {/* Language Selectors */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <Select value={sourceLang} onValueChange={setSourceLang}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <span className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button 
                variant="ghost" 
                size="icon" 
                onClick={swapLanguages}
                className="rounded-full hover:bg-primary/10"
              >
                <ArrowLeftRight className="w-5 h-5 text-primary" />
              </Button>

              <Select value={targetLang} onValueChange={setTargetLang}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <span className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Translation Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Input Card */}
              <Card className="p-6 shadow-card">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-muted-foreground">
                    {languages.find(l => l.code === sourceLang)?.flag}{" "}
                    {languages.find(l => l.code === sourceLang)?.name}
                  </span>
                  <Button variant="ghost" size="icon" className="text-muted-foreground">
                    <Mic className="w-4 h-4" />
                  </Button>
                </div>
                
                <Textarea
                  placeholder="Enter text to translate... (Try: 'I have a headache' or 'I have diabetes')"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="min-h-[200px] resize-none border-0 p-0 focus-visible:ring-0 text-lg"
                />

                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <span className="text-xs text-muted-foreground">
                    {inputText.length} characters
                  </span>
                  <Button 
                    variant="hero" 
                    onClick={handleTranslate}
                    disabled={isTranslating || !inputText.trim()}
                  >
                    {isTranslating ? (
                      <>
                        <Sparkles className="w-4 h-4 animate-spin" />
                        Translating...
                      </>
                    ) : (
                      <>
                        Translate
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              </Card>

              {/* Output Card */}
              <Card className="p-6 shadow-card bg-muted/30">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-muted-foreground">
                    {languages.find(l => l.code === targetLang)?.flag}{" "}
                    {languages.find(l => l.code === targetLang)?.name}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="text-muted-foreground">
                      <Volume2 className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-muted-foreground"
                      onClick={copyToClipboard}
                      disabled={!translatedText}
                    >
                      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                
                <div className="min-h-[200px] text-lg text-foreground">
                  {translatedText || (
                    <span className="text-muted-foreground">
                      Translation will appear here...
                    </span>
                  )}
                </div>

                {translatedText && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Translated with medical context from your records
                    </p>
                  </div>
                )}
              </Card>
            </div>

            {/* Quick Phrases */}
            <div className="mt-8">
              <h3 className="text-sm font-medium text-muted-foreground mb-4 text-center">
                Quick Medical Phrases
              </h3>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  "I have a headache",
                  "I need a doctor",
                  "Where is the pharmacy?",
                  "I have allergies",
                  "I need my prescription",
                  "I have diabetes",
                ].map((phrase) => (
                  <Button
                    key={phrase}
                    variant="outline"
                    size="sm"
                    onClick={() => setInputText(phrase)}
                    className="text-sm"
                  >
                    {phrase}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Translate;
