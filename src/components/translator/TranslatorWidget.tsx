import { useState } from "react";
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
  MicOff,
  Volume2,
  Copy,
  Check,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "./useTranslation";
import { useSpeech } from "./useSpeech";
import { languages } from "./languages";

interface TranslatorWidgetProps {
  compact?: boolean;
}

const TranslatorWidget = ({ compact = false }: TranslatorWidgetProps) => {
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("hi");
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { translate, isTranslating } = useTranslation();
  const { isListening, isSpeaking, startListening, stopListening, speak } = useSpeech();

  const swapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setInputText(translatedText);
    setTranslatedText(inputText);
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      toast({ title: "Enter some text", description: "Please enter text to translate.", variant: "destructive" });
      return;
    }
    try {
      const sourceName = languages.find(l => l.code === sourceLang)?.name || sourceLang;
      const targetName = languages.find(l => l.code === targetLang)?.name || targetLang;
      const result = await translate(inputText, sourceName, targetName);
      setTranslatedText(result);
    } catch {
      toast({ title: "Translation failed", description: "Please try again.", variant: "destructive" });
    }
  };

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening(sourceLang, (transcript) => {
        setInputText(prev => prev ? prev + " " + transcript : transcript);
      });
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied!", description: "Translation copied to clipboard." });
  };

  const minH = compact ? "min-h-[120px]" : "min-h-[200px]";

  return (
    <div className="w-full">
      {/* Language Selectors */}
      <div className="flex items-center justify-center gap-3 mb-4">
        <Select value={sourceLang} onValueChange={setSourceLang}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-60">
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

        <Button variant="ghost" size="icon" onClick={swapLanguages} className="rounded-full hover:bg-primary/10">
          <ArrowLeftRight className="w-5 h-5 text-primary" />
        </Button>

        <Select value={targetLang} onValueChange={setTargetLang}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-60">
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
      <div className="grid md:grid-cols-2 gap-4">
        {/* Input */}
        <Card className="p-4 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              {languages.find(l => l.code === sourceLang)?.flag}{" "}
              {languages.find(l => l.code === sourceLang)?.name}
            </span>
            <Button
              variant={isListening ? "destructive" : "ghost"}
              size="icon"
              onClick={handleMicClick}
              className={isListening ? "" : "text-muted-foreground"}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
          </div>

          <Textarea
            placeholder="Type or speak to translate..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className={`${minH} resize-none border-0 p-0 focus-visible:ring-0 text-base`}
          />

          <div className="flex items-center justify-between mt-3 pt-3 border-t">
            <span className="text-xs text-muted-foreground">{inputText.length} chars</span>
            <Button variant="hero" size="sm" onClick={handleTranslate} disabled={isTranslating || !inputText.trim()}>
              {isTranslating ? (
                <><Sparkles className="w-4 h-4 animate-spin" /> Translating...</>
              ) : (
                <>Translate <ArrowRight className="w-4 h-4" /></>
              )}
            </Button>
          </div>
        </Card>

        {/* Output */}
        <Card className="p-4 shadow-card bg-muted/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              {languages.find(l => l.code === targetLang)?.flag}{" "}
              {languages.find(l => l.code === targetLang)?.name}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground"
                disabled={!translatedText || isSpeaking}
                onClick={() => speak(translatedText, targetLang)}
              >
                <Volume2 className={`w-4 h-4 ${isSpeaking ? "animate-pulse text-primary" : ""}`} />
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

          <div className={`${minH} text-base text-foreground`}>
            {translatedText || (
              <span className="text-muted-foreground">Translation will appear here...</span>
            )}
          </div>

          {translatedText && (
            <div className="mt-3 pt-3 border-t">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> AI-powered medical translation
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Quick Phrases */}
      {!compact && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-3 text-center">
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
              "I feel dizzy",
              "I have chest pain",
            ].map((phrase) => (
              <Button key={phrase} variant="outline" size="sm" onClick={() => setInputText(phrase)} className="text-sm">
                {phrase}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TranslatorWidget;
