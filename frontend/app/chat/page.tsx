'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { 
  Send, Mic, MicOff, RefreshCw, 
  ArrowRight, User, Bot
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
  "Analyze my recent performance of Raga Yaman",
  "Explain Raga Yaman and its signature pakad",
  "Why do high notes drift out of tune?",
  "Explain the 22 Shrutis and ratios",
  "Give me a 15-minute daily riyaz routine"
];

function formatStudentName(rawName?: string): string {
  if (!rawName) return 'Student';
  const prefix = rawName.split('@')[0];
  const cleaned = prefix.replace(/[0-9_.-]+$/, '').trim();
  if (!cleaned || cleaned.length < 2) return 'Student';
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
      text: `Namaste, **${studentName}**. I am your SwaraGPT Guru. How can I guide your practice or answer questions about ragas, swaras, and microtonal intonation?`,
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
      const res = await chatApi.sendMessage(textToSend);
      const resData = res.data;

      const guruMsg: ChatMessage = {
        id: `guru-${Date.now()}`,
        sender: 'guru',
        text: resData.content || resData.response || resData.message || "I have analyzed your query.",
        citations: resData.citations,
        suggested_drills: resData.suggested_drills,
        grounded: resData.grounded ?? true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, guruMsg]);
    } catch (err) {
      console.warn("Chat fallback response:", err);
      let reply = `Regarding "${textToSend}": Focus on steady Sa grounding with a Tanpura drone, followed by ascending scale intervals. Let me know if you would like specific exercises for this raga.`;
      
      const lower = textToSend.toLowerCase();
      if (lower.includes('yaman')) {
        reply = `**Raga Yaman (Kalyan Thaat):**\n- **Aroha:** .N R G, M' D N S'\n- **Avaroha:** S' N D P, M' G R S\n- **Vadi / Samvadi:** Ga / Ni\n- **Key Swara:** Tivra Ma (590 cents).\n\nPractice beginning on Mandra Nishad (.N) to lead cleanly into Rishabh and Gandhar.`;
      } else if (lower.includes('shruti') || lower.includes('22')) {
        reply = `**22 Shrutis Overview:**\n- Ancient Indian music recognizes 22 microtonal divisions within an octave, rather than 12 equal semitones.\n- Each swara (except Sa and Pa) has subtle varieties: for example, Ati-Komal Re (71 cents), Komal Re (112 cents), and Trishruti Re (182 cents).`;
      }

      const fallbackMsg: ChatMessage = {
        id: `guru-${Date.now()}`,
        sender: 'guru',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const toggleVoiceInput = () => {
    const SpeechRecognition = (window as unknown as { SpeechRecognition: unknown; webkitSpeechRecognition: unknown }).SpeechRecognition ||
                              (window as unknown as { webkitSpeechRecognition: unknown }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    if (isListeningSpeech) {
      setIsListeningSpeech(false);
      return;
    }

    try {
      const recognition = new (SpeechRecognition as any)();
      recognition.lang = 'en-IN';
      recognition.interimResults = false;

      recognition.onstart = () => setIsListeningSpeech(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListeningSpeech(false);
      };
      recognition.onerror = () => setIsListeningSpeech(false);
      recognition.onend = () => setIsListeningSpeech(false);

      recognition.start();
    } catch (err) {
      console.error("Voice input error:", err);
      setIsListeningSpeech(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-200">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Virtual Guru</h1>
            <p className="text-xs text-slate-500">Musicology tutor for Indian classical music, ragas, and riyaz.</p>
          </div>
        </div>

        {/* Suggested Prompts */}
        <div className="mb-4 overflow-x-auto pb-1 scrollbar-none">
          <div className="flex items-center gap-1.5 min-w-max">
            {SUGGESTED_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                className="text-xs text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg transition-colors shadow-2xs font-medium cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs overflow-y-auto max-h-[60vh] space-y-4 mb-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'guru' && (
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-xl rounded-xl p-3.5 text-xs ${
                msg.sender === 'user'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-50 border border-slate-200 text-slate-800'
              }`}>
                <div className={`flex items-center justify-between text-[10px] mb-1.5 font-mono ${
                  msg.sender === 'user' ? 'text-slate-300' : 'text-slate-400'
                }`}>
                  <span className="font-semibold">{msg.sender === 'user' ? studentName : 'Guru'}</span>
                  <span>{msg.timestamp}</span>
                </div>

                {msg.sender === 'guru' ? (
                  <div className="prose prose-xs max-w-none text-slate-800">
                    <MarkdownRenderer content={msg.text} />
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                )}

                {msg.sender === 'guru' && msg.suggested_drills && msg.suggested_drills.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-200">
                    <div className="flex flex-wrap gap-1.5">
                      {msg.suggested_drills.map((drill, dIdx) => (
                        <button
                          key={dIdx}
                          onClick={() => handleSendMessage(`Guide me through: "${drill}"`)}
                          className="text-[11px] bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 px-2 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span>{drill}</span>
                          <ArrowRight className="w-2.5 h-2.5 text-slate-400" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center text-slate-700 shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-slate-500 text-xs font-mono">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-2xs focus-within:border-slate-400"
        >
          <button
            type="button"
            onClick={toggleVoiceInput}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              isListeningSpeech
                ? 'bg-rose-500 text-white'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
            title="Voice input"
          >
            {isListeningSpeech ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about ragas, swaras, or vocal exercises..."
            className="flex-1 bg-transparent px-2 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
          />

          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-3.5 py-1.5 rounded-lg bg-slate-900 text-white font-medium text-xs disabled:opacity-40 hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>Send</span>
            <Send className="w-3 h-3" />
          </button>
        </form>

      </main>

      <Footer />
    </div>
  );
}

export default function ChatPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-[#F8FAFC]" />}>
      <ChatContent />
    </React.Suspense>
  );
}
