import { useState, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

// Map language codes to BCP-47 for Web Speech API
const speechLangMap: Record<string, string> = {
  en: "en-US", hi: "hi-IN", es: "es-ES", fr: "fr-FR", de: "de-DE",
  zh: "zh-CN", ja: "ja-JP", ko: "ko-KR", ar: "ar-SA", ru: "ru-RU",
  pt: "pt-PT", it: "it-IT", bn: "bn-IN", ta: "ta-IN", te: "te-IN",
  mr: "mr-IN", gu: "gu-IN", kn: "kn-IN", ml: "ml-IN", pa: "pa-IN",
  ur: "ur-PK", th: "th-TH", vi: "vi-VN", tr: "tr-TR", pl: "pl-PL",
  nl: "nl-NL", sv: "sv-SE", da: "da-DK", fi: "fi-FI", no: "nb-NO",
  el: "el-GR", he: "he-IL", id: "id-ID", ms: "ms-MY", uk: "uk-UA",
  cs: "cs-CZ", ro: "ro-RO", hu: "hu-HU", sw: "sw-KE", af: "af-ZA",
};

export const useSpeech = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState<boolean | null>(null);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  const getSpeechRecognition = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setSpeechSupported(false);
      return null;
    }
    setSpeechSupported(true);
    return SR;
  }, []);

  const startListening = useCallback((langCode: string, onResult: (text: string) => void) => {
    const SR = getSpeechRecognition();
    if (!SR) {
      toast({
        variant: "destructive",
        title: "Speech not supported",
        description: "Please open this page directly in Chrome (not in an iframe/preview) for speech recognition to work.",
      });
      return;
    }

    // Stop any existing recognition
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
    }

    try {
      const recognition = new SR();
      recognition.lang = speechLangMap[langCode] || "en-US";
      recognition.interimResults = true;
      recognition.continuous = true;
      recognition.maxAlternatives = 1;

      let finalTranscript = "";

      recognition.onstart = () => {
        console.log("Speech recognition started, lang:", recognition.lang);
        setIsListening(true);
        toast({ title: "🎤 Listening...", description: "Speak now. Click the mic again to stop." });
      };

      recognition.onresult = (event: any) => {
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + " ";
            onResult(transcript);
          } else {
            interim = transcript;
          }
        }
        console.log("Speech result - final:", finalTranscript, "interim:", interim);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);

        if (event.error === "not-allowed") {
          toast({
            variant: "destructive",
            title: "Microphone access denied",
            description: "Please allow microphone access in your browser settings, or open this page directly (not in a preview iframe).",
          });
        } else if (event.error === "no-speech") {
          toast({ title: "No speech detected", description: "Please try speaking again." });
        } else {
          toast({
            variant: "destructive",
            title: "Speech error",
            description: `Error: ${event.error}. Try opening in a new tab.`,
          });
        }
      };

      recognition.onend = () => {
        console.log("Speech recognition ended");
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error("Failed to start speech recognition:", err);
      setIsListening(false);
      toast({
        variant: "destructive",
        title: "Could not start microphone",
        description: "Try opening this page in a new browser tab directly.",
      });
    }
  }, [getSpeechRecognition, toast]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const speak = useCallback((text: string, langCode: string) => {
    if (!window.speechSynthesis) {
      toast({
        variant: "destructive",
        title: "Text-to-speech not supported",
        description: "Your browser does not support text-to-speech.",
      });
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = speechLangMap[langCode] || "en-US";
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }, [toast]);

  return { isListening, isSpeaking, speechSupported, startListening, stopListening, speak };
};
