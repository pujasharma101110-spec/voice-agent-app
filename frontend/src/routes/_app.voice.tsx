import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { Mic, MicOff, Pause, Volume2 } from "lucide-react";
import { motion } from "framer-motion";
import { Chip, GlassCard, PageHeader } from "@/components/ui-bits";
import { cn } from "@/lib/utils";
import { chatWithAI } from "@/lib/api";

export const Route = createFileRoute("/_app/voice")({
  component: VoicePage,
  head: () => ({ meta: [{ title: "Voice Assistant — Lensread AI" }] }),
});

type State = "idle" | "listening" | "thinking" | "speaking";

function VoicePage() {
  const [state, setState] = useState<State>("idle");
  const [transcript, setTranscript] = useState<{ who: string; text: string }[]>([
    { who: "AI", text: "Hi! Tap the microphone and ask me anything about your documents." },
  ]);
  const [ws, setWs] = useState<WebSocket | null>(null);
  
  // Browser Audio APIs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    
    // Connect WebSocket
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const socket = new WebSocket(`${protocol}//localhost:8000/ws/voice/user_${Math.random().toString(36).substring(7)}`);
    
    socket.onopen = () => console.log("WebSocket connected");
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("WS Message:", data);
      if (data.type === "user_transcript") {
        setTranscript((p) => [...p, { who: "You", text: data.text }]);
        setState("thinking");
      } else if (data.type === "ai_response") {
        setTranscript((p) => [...p, { who: "AI", text: data.text }]);
        if (data.audio_url) {
          playServerAudio(data.audio_url);
        } else {
          speak(data.text);
        }
      }
    };
    setWs(socket);

    return () => {
      socket.close();
      if (synthRef.current) synthRef.current.cancel();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        if (chunksRef.current.length === 0) return;
        
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        if (ws && ws.readyState === WebSocket.OPEN) {
          console.log("Sending audio blob to server...");
          const arrayBuffer = await audioBlob.arrayBuffer();
          ws.send(arrayBuffer);
          setState("thinking");
        } else {
          console.error("WS not open, cannot send audio");
          setState("idle");
        }
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setState("listening");
      console.log("Recording started...");
    } catch (err) {
      console.error("Microphone error:", err);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      console.log("Recording stopped, transcribing...");
    }
  };

  const stopVoice = () => {
    if (synthRef.current) synthRef.current.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (state === "listening") {
      stopRecording();
    }
    setState("idle");
  };

  const playServerAudio = (url: string) => {
    setState("speaking");
    const fullUrl = `http://localhost:8000${url}`;
    const audio = new Audio(fullUrl);
    audioRef.current = audio;
    audio.onended = () => {
      setState("idle");
      audioRef.current = null;
    };
    audio.onerror = (e) => {
      console.error("Audio playback error:", e);
      setState("idle");
      audioRef.current = null;
    };
    audio.play().catch(err => {
      console.error("Playback failed, probably browser blocked:", err);
      setState("idle");
      audioRef.current = null;
    });
  };

  const speak = (text: string) => {
    if (!synthRef.current) return;
    
    // Cancel any ongoing speech
    synthRef.current.cancel();
    
    setState("speaking");
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Try to find a good natural voice
    const voices = synthRef.current.getVoices();
    const premiumVoice = voices.find(v => v.name.includes("Google") || v.name.includes("Natural") || v.lang === 'en-US');
    if (premiumVoice) utterance.voice = premiumVoice;
    
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    utterance.onend = () => {
      console.log("Speech finished");
      setState("idle");
    };
    
    utterance.onerror = (err) => {
      console.error("Speech error:", err);
      setState("idle");
    };

    synthRef.current.speak(utterance);
  };

  const toggle = () => {
    // Prime the audio engine (browser requirement)
    if (synthRef.current) {
      const dummy = new SpeechSynthesisUtterance("");
      synthRef.current.speak(dummy);
    }

    if (state === "idle" || state === "speaking") {
      if (state === "speaking") stopVoice();
      startRecording();
    } else if (state === "listening") {
      stopRecording();
    }
  };

  const active = state !== "idle";

  return (
    <>
      <PageHeader
        eyebrow="Voice mode"
        title="Talk to your documents"
        description="Real-time speech-to-speech with live transcript and source citations."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <GlassCard className="relative flex min-h-[460px] flex-col items-center justify-center overflow-hidden p-10">
          {/* Ambient bg */}
          <div className="pointer-events-none absolute inset-0 -z-10 opacity-60">
            <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-brand opacity-20 blur-3xl" />
          </div>

          {/* Orb */}
          <motion.div
            className="relative flex h-56 w-56 items-center justify-center"
            animate={{ scale: active ? [1, 1.1, 1] : 1 }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            {[0, 1, 2].map((r) => (
              <motion.div
                key={r}
                className="absolute inset-0 rounded-full"
                style={{
                  background: "radial-gradient(circle, var(--gradient-start), transparent 70%)",
                  opacity: 0.35 - r * 0.1,
                }}
                animate={
                  active
                    ? { scale: [1, 1.5 + r * 0.2, 1], opacity: [0.4, 0, 0.4] }
                    : { scale: 1, opacity: 0.1 }
                }
                transition={{ duration: 1.5 + r * 0.5, repeat: Infinity, delay: r * 0.2 }}
              />
            ))}
            <div className="relative flex h-44 w-44 items-center justify-center rounded-full bg-gradient-brand shadow-glow">
              <div className="absolute inset-2 rounded-full bg-background/20 backdrop-blur" />
              <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-background/80 backdrop-blur-xl">
                {state === "speaking" ? (
                  <Volume2 className="h-10 w-10 text-primary" />
                ) : state === "listening" ? (
                  <motion.div 
                    animate={{ opacity: [1, 0.5, 1] }} 
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <Mic className="h-10 w-10 text-primary" />
                  </motion.div>
                ) : state === "thinking" ? (
                  <motion.div
                    className="h-4 w-4 rounded-full bg-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]"
                    animate={{ scale: [1, 1.8, 1], opacity: [1, 0.6, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                  />
                ) : (
                  <Mic className="h-10 w-10 text-muted-foreground" />
                )}
              </div>
            </div>
          </motion.div>

          {/* Waveform */}
          <div className="mt-8 flex h-14 items-center gap-1">
            {Array.from({ length: 32 }).map((_, i) => (
              <motion.span
                key={i}
                className="w-1 rounded-full bg-gradient-brand"
                animate={{
                  height: active ? [6, 12 + Math.random() * 32, 6] : 4,
                  opacity: active ? 1 : 0.2,
                }}
                transition={{
                  duration: 0.5 + Math.random() * 0.5,
                  repeat: Infinity,
                  delay: i * 0.03,
                }}
              />
            ))}
          </div>

          <div className="mt-8 flex items-center gap-3">
            <Chip tone={active ? (state === 'listening' ? "success" : "info") : "default"}>
              {state === "idle" && "Tap to start"}
              {state === "listening" && "● Listening"}
              {state === "thinking" && "AI is thinking…"}
              {state === "speaking" && "AI is speaking"}
            </Chip>
            <button
              onClick={toggle}
              disabled={state === "thinking"}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition-all active:scale-95 disabled:opacity-50",
                state === "listening"
                  ? "bg-destructive text-white shadow-lg"
                  : "bg-gradient-brand text-white shadow-glow hover:brightness-110",
              )}
            >
              {state === "listening" ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              {state === "listening" ? "Stop & Ask" : "Start Speaking"}
            </button>
            {active && (
              <button 
                onClick={stopVoice}
                className="rounded-full border border-border bg-card/60 p-2.5 hover:bg-destructive/10 hover:border-destructive/40 transition-colors"
                title="Stop agent"
              >
                <Pause className="h-4 w-4" />
              </button>
            )}
          </div>
        </GlassCard>

        <GlassCard className="flex max-h-[460px] flex-col overflow-hidden">
          <div className="border-b border-border px-5 py-3">
            <p className="text-sm font-semibold">Live transcript</p>
            <p className="text-xs text-muted-foreground">Synced with voice</p>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-5">
            {transcript.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-border bg-card/40 p-3"
              >
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {t.who}
                </p>
                <p className="mt-1 text-sm leading-relaxed">{t.text}</p>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </div>
    </>
  );
}
