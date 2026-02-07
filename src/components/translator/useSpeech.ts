import { useState, useCallback, useRef } from "react";

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
  const recognitionRef = useRef<any>(null);

  const startListening = useCallback((langCode: string, onResult: (text: string) => void) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Try Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = speechLangMap[langCode] || "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const speak = useCallback((text: string, langCode: string) => {
    if (!window.speechSynthesis) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = speechLangMap[langCode] || "en-US";
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }, []);

  return { isListening, isSpeaking, startListening, stopListening, speak };
};
