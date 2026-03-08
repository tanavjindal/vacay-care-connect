import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import Header from "@/components/layout/Header";
import {
  Heart,
  Send,
  Loader2,
  ShieldCheck,
  AlertTriangle,
  Brain,
  Sparkles,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

type Msg = { role: "user" | "assistant"; content: string };

const TOPICS = [
  { id: "grief", label: "Loss & Grief", emoji: "🕊️", description: "Coping with the passing of a loved one" },
  { id: "breakup", label: "Breakup / Heartbreak", emoji: "💔", description: "Navigating relationship endings" },
  { id: "anxiety", label: "Anxiety & Stress", emoji: "😰", description: "Managing overwhelming worry or pressure" },
  { id: "loneliness", label: "Loneliness", emoji: "🌧️", description: "Feeling isolated or disconnected" },
  { id: "homesick", label: "Homesickness", emoji: "🏠", description: "Missing home while traveling" },
  { id: "trauma", label: "Difficult Experience", emoji: "🌪️", description: "Processing a traumatic or difficult event" },
  { id: "selfesteem", label: "Self-Esteem", emoji: "🪞", description: "Building confidence and self-worth" },
  { id: "general", label: "Just Need to Talk", emoji: "💬", description: "No specific topic — just need someone to listen" },
];

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-therapist`;

async function streamChat({
  messages,
  topic,
  onDelta,
  onDone,
  onError,
}: {
  messages: Msg[];
  topic: string;
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (msg: string) => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages, topic }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: "Connection failed" }));
    onError(err.error || "Something went wrong. Please try again.");
    return;
  }

  if (!resp.body) {
    onError("No response received.");
    return;
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let textBuffer = "";
  let streamDone = false;

  while (!streamDone) {
    const { done, value } = await reader.read();
    if (done) break;
    textBuffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
      let line = textBuffer.slice(0, newlineIndex);
      textBuffer = textBuffer.slice(newlineIndex + 1);

      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;

      const jsonStr = line.slice(6).trim();
      if (jsonStr === "[DONE]") {
        streamDone = true;
        break;
      }

      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch {
        textBuffer = line + "\n" + textBuffer;
        break;
      }
    }
  }

  onDone();
}

const Therapist = () => {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [acceptedDisclaimer, setAcceptedDisclaimer] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleAcceptAndStart = () => {
    setAcceptedDisclaimer(true);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Msg = { role: "user", content: input.trim() };
    setInput("");
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    let assistantSoFar = "";
    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: assistantSoFar } : m
          );
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      await streamChat({
        messages: [...messages, userMsg],
        topic: TOPICS.find((t) => t.id === selectedTopic)?.label || "general",
        onDelta: (chunk) => upsertAssistant(chunk),
        onDone: () => setIsLoading(false),
        onError: (msg) => {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: `⚠️ ${msg}` },
          ]);
          setIsLoading(false);
        },
      });
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Connection error. Please try again." },
      ]);
      setIsLoading(false);
    }
  };

  // Step 1: Topic selection
  if (!selectedTopic) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 pt-24 pb-12 max-w-3xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">MindBridge</h1>
            <p className="text-muted-foreground">
              Your AI wellness companion — a safe space to talk
            </p>
          </div>

          <Card className="p-6 mb-6 border-yellow-500/30 bg-yellow-500/5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-yellow-600 mb-1">Important Notice</p>
                <p>
                  MindBridge is an AI companion and is <strong>not a substitute</strong> for 
                  professional therapy or counseling. This feature has been reviewed by licensed 
                  mental health professionals for safety guidelines. If you are in crisis, please 
                  call a helpline immediately.
                </p>
              </div>
            </div>
          </Card>

          <h2 className="text-lg font-semibold text-foreground mb-4">
            What would you like to talk about?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {TOPICS.map((topic) => (
              <Card
                key={topic.id}
                className="p-4 cursor-pointer hover:shadow-card hover:border-primary/30 transition-all"
                onClick={() => setSelectedTopic(topic.id)}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{topic.emoji}</span>
                  <div>
                    <h3 className="font-medium text-foreground">{topic.label}</h3>
                    <p className="text-sm text-muted-foreground">{topic.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </main>
      </div>
    );
  }

  // Step 2: Disclaimer acceptance
  if (!acceptedDisclaimer) {
    const topic = TOPICS.find((t) => t.id === selectedTopic)!;
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 pt-24 pb-12 max-w-xl">
          <Card className="p-6">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-1">Before We Begin</h2>
              <p className="text-sm text-muted-foreground">
                Topic: {topic.emoji} {topic.label}
              </p>
            </div>

            <div className="space-y-4 text-sm text-muted-foreground mb-6">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                <ShieldCheck className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <p>
                  This AI has been <strong className="text-foreground">reviewed and approved by licensed mental 
                  health professionals</strong> to ensure it follows safe, ethical guidelines for supportive conversations.
                </p>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <p>
                  MindBridge is <strong className="text-foreground">not a replacement for professional therapy</strong>. 
                  It cannot diagnose conditions or prescribe treatment. For serious concerns, please 
                  consult a licensed professional.
                </p>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                <Heart className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                <p>
                  <strong className="text-foreground">Crisis resources:</strong> If you're in immediate danger, 
                  call emergency services. India helplines: iCall (9152987821), Vandrevala Foundation (1860-2662-345), 
                  AASRA (9820466726).
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setSelectedTopic(null)}
              >
                Go Back
              </Button>
              <Button className="flex-1 gap-2" onClick={handleAcceptAndStart}>
                <Sparkles className="w-4 h-4" />
                I Understand, Let's Talk
              </Button>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  // Step 3: Chat interface
  const topic = TOPICS.find((t) => t.id === selectedTopic)!;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col container mx-auto px-4 pt-20 pb-4 max-w-2xl">
        {/* Chat header */}
        <div className="flex items-center gap-3 py-3 border-b border-border/50 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground text-sm">MindBridge</h2>
            <p className="text-xs text-muted-foreground">
              {topic.emoji} {topic.label} • AI Wellness Companion
            </p>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 py-4 min-h-0">
          {/* Welcome message */}
          {messages.length === 0 && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                <Brain className="w-4 h-4 text-primary" />
              </div>
              <Card className="p-4 max-w-[80%] bg-muted/30 border-border/50">
                <p className="text-sm text-foreground">
                  Hi there 💙 I'm MindBridge, your AI wellness companion. I'm here to listen 
                  and support you. You mentioned you'd like to talk about <strong>{topic.label.toLowerCase()}</strong>.
                </p>
                <p className="text-sm text-foreground mt-2">
                  Take your time — there's no rush. How are you feeling right now?
                </p>
              </Card>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <Brain className="w-4 h-4 text-primary" />
                </div>
              )}
              <Card
                className={`p-4 max-w-[80%] ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted/30 border-border/50"
                }`}
              >
                {msg.role === "assistant" ? (
                  <div className="text-sm prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm">{msg.content}</p>
                )}
              </Card>
            </div>
          ))}

          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Brain className="w-4 h-4 text-primary" />
              </div>
              <Card className="p-4 bg-muted/30 border-border/50">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </Card>
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="flex gap-2 pt-2 border-t border-border/50">
          <Input
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !input.trim()} size="icon">
            <Send className="w-4 h-4" />
          </Button>
        </form>

        <p className="text-[10px] text-muted-foreground text-center mt-2">
          MindBridge is an AI companion, not a licensed therapist. In crisis, call iCall: 9152987821
        </p>
      </main>
    </div>
  );
};

export default Therapist;
