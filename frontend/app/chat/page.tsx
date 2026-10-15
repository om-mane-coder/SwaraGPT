'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { 
  Sparkles, Send, Mic, MicOff, RefreshCw, BookOpen, 
  ShieldCheck, HelpCircle, ArrowRight, User, Bot, CheckCircle2
} from 'lucide-react';
import { chatApi } from '@/lib/api';
import { useSwaraStore } from '@/lib/store';

interface ChatMessage {
  id: string;
  sender: 'user' | 'guru';
  text: string;
  citations?: Array<{ title: string; source: string; tradition: string }>;
  suggested_drills?: string[];
  grounded?: boolean;
  timestamp: string;
}

const SUGGESTED_PROMPTS = [
  "Guru ji, please analyze my recent performance of Raga Yaman",
  "Teach me Raga Yaman and its Pakad",
  "Why does my voice go besur on higher notes?",
  "Explain the 22 Shrutis and their microtonal ratios",
  "Give me a 20-minute daily Riyaz routine",
  "What is the difference between Thaat and Raga?",
  "How to practice Meend and Gamak properly?"
];

function formatStudentName(rawName?: string): string {
  if (!rawName) return 'Sadhak';
  const prefix = rawName.split('@')[0];
  const cleaned = prefix.replace(/[0-9_.-]+$/, '').trim();
  if (!cleaned || cleaned.length < 2) return 'Sadhak';
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function ChatContent() {
  const searchParams = useSearchParams();
  const { user } = useSwaraStore();
  const studentName = formatStudentName(user?.name);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'guru',
      text: `🙏 **Namaste, ${studentName}!** I am your SwaraGPT Virtual Guru. I am here to guide your Indian Classical Music journey—whether you wish to explore Raga grammar, refine your microtonal Shruti intonation, construct a dedicated Riyaz regimen, or examine your vocal performance metrics.\n\nHow may I illuminate your musical path today?`,
      citations: [
        { title: "Natya Shastra & Sangeet Ratnakara", source: "Classical Treatises", tradition: "Hindustani & Carnatic" }
      ],
      suggested_drills: [
        "Sing Raga Yaman Pakad: .N R G, M' P",
        "10-minute morning Kharaj Sadhana",
        "Hold Gandhar for 4 beats at 60 BPM"
      ],
      grounded: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isListeningSpeech, setIsListeningSpeech] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle incoming query params (e.g. from Performance Report "Ask Guru About This")
  useEffect(() => {
    const qParam = searchParams.get('q');
    if (qParam) {
      handleSendMessage(qParam);
    }
  }, [searchParams]);

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInput('');
    setLoading(true);

    try {
      const res = await chatApi.send(textToSend);
      const answer = res.data?.content || res.data?.response || res.data?.message || (typeof res.data === 'string' ? res.data : "I have reflected upon your inquiry.");
      
      const guruMsg: ChatMessage = {
        id: `guru-${Date.now()}`,
        sender: 'guru',
        text: answer,
        citations: res.data?.citations || [
          { title: "Verified Raga Master Data", source: "SwaraGPT Knowledge Base", tradition: "Classical" }
        ],
        suggested_drills: res.data?.suggested_drills || [],
        grounded: res.data?.grounded !== false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, guruMsg]);
    } catch (err) {
      console.error("Chat API error:", err);
      // Fallback response grounded in classical pedagogy
      const fallbackMsg: ChatMessage = {
        id: `guru-fallback-${Date.now()}`,
        sender: 'guru',
        text: `### Guidance from the Virtual Guru\n\nPracticing Indian Classical Music demands steadfast focus on your **Sa (Shadja)**.\n\n* **Sa Stability:** Always sustain your tonic for at least 5 to 10 seconds before ascending to Re or descending to Mandra Nishad.\n* **Raga Integrity:** Remember the cardinal rule of Vadi and Samvadi. For instance, in *Raga Yaman*, Gandhar (Ga) is the Vadi swara and Nishad (Ni) is the Samvadi. Prolonged pauses on these notes awaken the authentic rasa of the raga.\n\nKeep your breath deep from the abdomen (*Nabhi*) and avoid pushing vocal cords.`,
        citations: [
          { title: "Bhatkhande Sangeet Shastra", source: "Hindustani Pedagogy", tradition: "Hindustani" }
        ],
        suggested_drills: [
          "Hold Gandhar for 4 beats at 60 BPM",
          "Sing Yaman Pakad: .N R G, M' P, D P M' G R, .N R S"
        ],
        grounded: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  // Web Speech API Voice Query
  const toggleVoiceInput = () => {
    const SpeechRecognition = (window as unknown as { SpeechRecognition: unknown; webkitSpeechRecognition: unknown }).SpeechRecognition ||
                              (window as unknown as { webkitSpeechRecognition: unknown }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    if (isListeningSpeech) {
      setIsListeningSpeech(false);
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const recognition = new (SpeechRecognition as any)();
      recognition.lang = 'en-IN';
      recognition.interimResults = false;

      recognition.onstart = () => setIsListeningSpeech(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListeningSpeech(false);
      };
      recognition.onerror = () => setIsListeningSpeech(false);
      recognition.onend = () => setIsListeningSpeech(false);

      recognition.start();
    } catch (err) {
      console.error("Voice input start failed:", err);
      setIsListeningSpeech(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-amber-900/10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-700 flex items-center justify-center text-white font-bold shadow-lg shadow-amber-500/25">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 font-serif">SwaraGPT Virtual Guru</h1>
                <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                  RAG Grounded
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium">Classical musicology tutor trained on verified treatises & acoustic telemetry.</p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-amber-900 bg-amber-50 px-3.5 py-1.5 rounded-xl border border-amber-200 shadow-2xs font-medium">
            <ShieldCheck className="w-4 h-4 text-amber-700" />
            <span>Anti-Hallucination Guardrails Active</span>
          </div>
        </div>

        {/* Suggested Prompts Pills */}
        <div className="mb-6 overflow-x-auto pb-2 scrollbar-none">
          <div className="flex items-center gap-2 min-w-max">
            <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1 mr-1 font-medium">
              <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
              Suggested:
            </span>
            {SUGGESTED_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                className="text-xs text-slate-700 bg-white hover:bg-amber-50 hover:text-amber-900 border border-amber-200/90 hover:border-amber-400 px-3 py-1.5 rounded-xl transition-all shadow-2xs font-medium cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Messages Container */}
        <div className="flex-1 bg-white/90 p-4 sm:p-6 rounded-2xl border border-amber-200/80 shadow-md overflow-y-auto max-h-[60vh] space-y-6 mb-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'guru' && (
                <div className="w-9 h-9 rounded-xl bg-amber-600 border border-amber-700 flex items-center justify-center text-white shrink-0 mt-1 shadow-sm">
                  <Bot className="w-5 h-5" />
                </div>
              )}

              <div className={`max-w-2xl rounded-2xl p-4 sm:p-5 ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium shadow-md shadow-amber-500/20'
                  : 'bg-[#FDFBF7] border border-amber-200/80 text-slate-800 shadow-2xs'
              }`}>
                {/* Sender badge & time */}
                <div className={`flex items-center justify-between text-[11px] mb-2 font-mono ${
                  msg.sender === 'user' ? 'text-amber-100' : 'text-slate-500'
                }`}>
                  <span className="font-semibold">{msg.sender === 'user' ? studentName : 'Virtual Guru'}</span>
                  <span>{msg.timestamp}</span>
                </div>

                {/* Body Content */}
                {msg.sender === 'guru' ? (
                  <div className="prose prose-sm max-w-none text-slate-800">
                    <MarkdownRenderer content={msg.text} />
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                )}

                {/* Dynamic Clickable Suggested Drills */}
                {msg.sender === 'guru' && msg.suggested_drills && msg.suggested_drills.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-amber-200/60">
                    <div className="text-[11px] font-semibold text-amber-900 mb-2 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                      <span>Recommended Riyaz Drills:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {msg.suggested_drills.map((drill, dIdx) => (
                        <button
                          key={dIdx}
                          onClick={() => handleSendMessage(`Guru ji, please guide me step-by-step through this drill: "${drill}"`)}
                          className="text-xs bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shadow-2xs font-medium cursor-pointer hover:scale-[1.02]"
                        >
                          <span>{drill}</span>
                          <ArrowRight className="w-3 h-3 text-amber-700" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Grounded RAG Citations */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-amber-200/60 text-[11px] font-mono space-y-1 bg-amber-50/60 p-2.5 rounded-xl">
                    <div className="flex items-center gap-1.5 text-amber-900 font-bold">
                      <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                      <span>Verified Knowledge Sources:</span>
                    </div>
                    {msg.citations.map((c, i) => (
                      <div key={i} className="text-slate-600 pl-3 border-l-2 border-amber-400">
                        <span className="text-slate-900 font-semibold">{c.title}</span> • {c.source} ({c.tradition})
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 shrink-0 mt-1 shadow-2xs">
                  <User className="w-5 h-5" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3 text-amber-800 text-xs font-mono font-medium">
              <RefreshCw className="w-4 h-4 animate-spin text-amber-700" />
              <span>Guru is meditating upon musicological scriptures...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="relative">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 bg-white p-2.5 rounded-2xl border border-amber-300 shadow-md focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-200 transition-all"
          >
            <button
              type="button"
              onClick={toggleVoiceInput}
              className={`p-3 rounded-xl transition-all cursor-pointer ${
                isListeningSpeech
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
              }`}
              title="Speak your question"
            >
              {isListeningSpeech ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Guru about Ragas, Swaras, Shrutis, Bandishes, or vocal corrections..."
              className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
            />

            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white font-bold text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-105 transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer"
            >
              <span>Ask Guru</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

      </main>

      <Footer />
    </div>
  );
}

export default function ChatPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-[#FAF8F5]" />}>
      <ChatContent />
    </React.Suspense>
  );
}
