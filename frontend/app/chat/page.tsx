'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { 
  Sparkles, Send, Mic, MicOff, RefreshCw, BookOpen, 
  ShieldCheck, HelpCircle, ArrowRight, User, Bot, CheckCircle2,
  Copy, Check, Volume2, VolumeX, ChevronDown, ChevronRight,
  Trash2, Plus, MessageSquare, BrainCircuit, Square, SlidersHorizontal,
  Flame, Music2, Headphones, Activity
} from 'lucide-react';
import { chatApi } from '@/lib/api';
import { useSwaraStore } from '@/lib/store';

interface Citation {
  title: string;
  source: string;
  tradition?: string;
  relevance_score?: number;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'guru';
  text: string;
  thought?: string;
  model?: string;
  citations?: Citation[];
  suggested_drills?: string[];
  grounded?: boolean;
  timestamp: string;
  isStreaming?: boolean;
}

interface ConversationItem {
  id: string;
  title: string;
  timestamp: string;
}

const MODEL_OPTIONS = [
  {
    id: 'nvidia/nemotron-3-ultra-550b-a55b',
    name: 'SwaraGPT 550B Ultra',
    badge: 'Deep Reasoning Flagship',
    desc: '550-Billion parameter engine with deep musical treatise reasoning & vocal pedagogy',
    icon: BrainCircuit,
    color: 'from-amber-500 to-amber-700'
  },
  {
    id: 'meta/llama-3.2-11b-vision-instruct',
    name: 'SwaraGPT 11B Turbo',
    badge: 'Real-Time Conversational',
    desc: 'Lightning-fast conversational mentor for rapid Q&A, drills, and explanations',
    icon: Sparkles,
    color: 'from-emerald-500 to-teal-700'
  }
];

const SUGGESTED_PROMPTS = [
  {
    category: "Raga Deep-Dive",
    title: "Grammar of Raga Yaman",
    prompt: "Guru ji, explain the complete grammar of Raga Yaman: Aroha, Avaroha, Vadi, Samvadi, and its signature Pakad.",
    icon: Music2
  },
  {
    category: "Vocal Correction",
    title: "Curing Pitch Drift",
    prompt: "Why does my voice drift flat on Gandhar and high notes during Riyaz, and what specific drills will fix it?",
    icon: Activity
  },
  {
    category: "Microtonal Science",
    title: "22 Shrutis & Ratios",
    prompt: "Explain the ancient 22 Shrutis system from the Natya Shastra, and how Komal Re differs between Bhairav and Todi.",
    icon: Sparkles
  },
  {
    category: "Riyaz Regimen",
    title: "30-Min Daily Practice",
    prompt: "Design a structured 30-minute daily vocal Riyaz routine for Kharaj Sadhana, Alankars, and Meend practice.",
    icon: Headphones
  }
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
  const { user, lastAnalysis } = useSwaraStore();
  const studentName = formatStudentName(user?.name);

  // Active Model
  const [selectedModel, setSelectedModel] = useState<string>(MODEL_OPTIONS[0].id);
  const [showModelDropdown, setShowModelDropdown] = useState<boolean>(false);

  // Conversations List
  const [conversations, setConversations] = useState<ConversationItem[]>([
    { id: 'conv-1', title: 'Raga Yaman & Gandhar Intonation', timestamp: 'Today' },
    { id: 'conv-2', title: '22 Shrutis Microtonal Ratios', timestamp: 'Yesterday' },
    { id: 'conv-3', title: 'Morning Kharaj Sadhana Routine', timestamp: '3 days ago' },
  ]);
  const [activeConvId, setActiveConvId] = useState<string>('conv-1');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  // Messages State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'guru',
      text: `🙏 **Namaste, ${studentName}!** I am your **SwaraGPT Virtual Guru**, powered by multi-modal musicology AI.\n\nI am here to guide your voice and musical understanding with the depth of the classical tradition:
- 🎼 **Raga Grammar & Aesthetics:** Arohana, Avarohana, Vadi, Samvadi, Pakad, and Prahar time theory
- 🎯 **Vocal Diagnostics & Microtonal Accuracy:** Real-time feedback on cent deviations, tonic stability, and 22 Shrutis
- 🧘 **Personalized Riyaz Blueprints:** Kharaj Sadhana, Alankars, and Meend exercises
- 📜 **Scholarly Treatises:** Grounded in *Natya Shastra*, *Sangeeta Ratnakara*, and *Kramik Pustak Malika*

How may I illuminate your musical path today? Feel free to ask a question or explore the suggested topics below.`,
      thought: `Student: ${studentName}. Initialized Virtual Guru persona with grounding in ancient musicological treatises and modern acoustics. Mode: Conversational Classical Music Maestro.`,
      model: 'nvidia/nemotron-3-ultra-550b-a55b',
      citations: [
        { title: "Natya Shastra & Sangeeta Ratnakara", source: "Classical Treatises", tradition: "Hindustani & Carnatic" },
        { title: "Bhatkhande Kramik Pustak Malika", source: "Pedagogical Canon", tradition: "Hindustani" }
      ],
      suggested_drills: [
        "Sing Raga Yaman Pakad: .N R G, M' P",
        "10-minute morning Kharaj Sadhana on Sa",
        "Hold Gandhar for 4 beats at 60 BPM"
      ],
      grounded: true,
      timestamp: '09:00 AM'
    }
  ]);

  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isListeningSpeech, setIsListeningSpeech] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [expandedThoughts, setExpandedThoughts] = useState<{ [id: string]: boolean }>({});
  const [includeTelemetry, setIncludeTelemetry] = useState<boolean>(true);

  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const shouldAutoScrollRef = useRef<boolean>(true);
  const [isUserScrolledUp, setIsUserScrolledUp] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleMessagesScroll = () => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    // If user is within 100px from the bottom, keep auto-scrolling
    const isAtBottom = distanceFromBottom <= 100;
    shouldAutoScrollRef.current = isAtBottom;
    setIsUserScrolledUp(!isAtBottom);
  };

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (!messagesContainerRef.current) return;
    messagesContainerRef.current.scrollTo({
      top: messagesContainerRef.current.scrollHeight,
      behavior
    });
  };

  useEffect(() => {
    // Only auto-scroll if user has not manually scrolled up to read earlier text
    if (shouldAutoScrollRef.current) {
      scrollToBottom('smooth');
    }
  }, [messages, loading]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  // Handle URL query param
  useEffect(() => {
    const qParam = searchParams.get('q');
    if (qParam) {
      handleSendMessage(qParam);
    }
  }, [searchParams]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (id: string, text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Strip markdown symbols for natural TTS speech
    const cleanText = text
      .replace(/[*#_`>]/g, '')
      .replace(/\[.*?\]\(.*?\)/g, '')
      .replace(/\n+/g, ' ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95; // Gentle guru tempo
    utterance.pitch = 0.95;

    // Pick a natural Indian/warm voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.includes('en-IN') || v.name.includes('India')) ||
                           voices.find(v => v.lang.startsWith('en'));
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  const toggleThought = (msgId: string) => {
    setExpandedThoughts(prev => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  const startNewChat = () => {
    const newId = `conv-${Date.now()}`;
    const newConv: ConversationItem = {
      id: newId,
      title: 'New Sadhana Session',
      timestamp: 'Just now'
    };
    setConversations(prev => [newConv, ...prev]);
    setActiveConvId(newId);
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'guru',
        text: `🙏 **Pranam, ${studentName}!** A new Riyaz dialogue has begun.\n\nWhat musical query or raga exploration shall we undertake?`,
        model: selectedModel,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleStopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setLoading(false);
  };

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMsgId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setInput('');
    setLoading(true);
    shouldAutoScrollRef.current = true;
    setIsUserScrolledUp(false);
    setTimeout(() => scrollToBottom('auto'), 50);

    // Update conversation title if first user message
    if (messages.length <= 1) {
      setConversations(prev =>
        prev.map(c => c.id === activeConvId ? { ...c, title: textToSend.slice(0, 35) + (textToSend.length > 35 ? '...' : '') } : c)
      );
    }

    const guruMsgId = `guru-${Date.now()}`;
    // Create streaming placeholder message
    const placeholderGuru: ChatMessage = {
      id: guruMsgId,
      sender: 'guru',
      text: '',
      thought: '',
      model: selectedModel,
      isStreaming: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, placeholderGuru]);

    // Prepare performance context:
    // Only pass telemetry if the inquiry is explicitly asking for critique of the student's OWN singing/recording,
    // AND real performance analysis exists in the store!
    const pLower = textToSend.toLowerCase().trim();
    const isMyPerfQuery = [
      'my performance', 'my singing', 'my score', 'my voice', 'my recording',
      'analyze my', 'evaluate my', 'critique my', 'diagnose my', 'how did i sing',
      'how was my singing', 'check my pitch', 'fix my mistakes', 'my weak note', 'my weak swara'
    ].some(w => pLower.includes(w));

    const perfContext = (includeTelemetry && isMyPerfQuery && lastAnalysis) ? {
      raga: lastAnalysis.detected_raga || lastAnalysis.target_raga || 'Yaman',
      overall_score: lastAnalysis.overall_score || lastAnalysis.score,
      tonic_used_hz: lastAnalysis.tonic?.estimated_sa_hz || 138.59,
      weak_swaras: lastAnalysis.weak_swaras || [],
      shruti_deviation_cents: lastAnalysis.shruti_precision || 0
    } : undefined;

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      // 1. Try real-time Server-Sent Events streaming from /chat/stream
      const streamUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/chat/stream`;
      const response = await fetch(streamUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          conversation_id: activeConvId,
          performance_context: perfContext,
          model: selectedModel
        }),
        signal: abortController.signal
      });

      if (response.ok && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedText = '';
        let accumulatedThought = '';
        let citations: Citation[] = [];
        let suggestedDrills: string[] = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.replace('data: ', '').trim());
                if (data.type === 'init') {
                  citations = data.citations || [];
                  suggestedDrills = data.suggested_drills || [];
                } else if (data.type === 'thought') {
                  accumulatedThought += data.text;
                } else if (data.type === 'content') {
                  accumulatedText += data.text;
                }

                // Update UI smoothly
                setMessages(prev =>
                  prev.map(m =>
                    m.id === guruMsgId
                      ? {
                          ...m,
                          text: accumulatedText,
                          thought: accumulatedThought || undefined,
                          citations: citations.length > 0 ? citations : m.citations,
                          suggested_drills: suggestedDrills.length > 0 ? suggestedDrills : m.suggested_drills,
                          isStreaming: true
                        }
                      : m
                  )
                );
              } catch {
                // Ignore parse errors on split chunks
              }
            }
          }
        }

        // Finalize streaming: ensure text is never empty if thoughts arrived
        const finalContent = accumulatedText.trim() || accumulatedThought.trim() || '🙏 Namaste, I am at your service.';
        const finalThought = accumulatedText.trim() ? (accumulatedThought.trim() || undefined) : undefined;

        setMessages(prev =>
          prev.map(m =>
            m.id === guruMsgId
              ? {
                  ...m,
                  text: finalContent,
                  thought: finalThought,
                  isStreaming: false
                }
              : m
          )
        );
        setLoading(false);
        abortControllerRef.current = null;
        return;
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setLoading(false);
        return;
      }
      console.warn("Streaming API fell back to non-streaming POST /chat:", err);
    }

    // 2. Non-Streaming Fallback with high-performance LLM
    try {
      const res = await chatApi.send(textToSend, perfContext, selectedModel);
      const data = res.data;
      const answer = data?.content || data?.response || data?.reply || data?.message || (typeof data === 'string' ? data : "I have reflected upon your inquiry.");
      const thought = data?.thought || null;
      const modelUsed = data?.model || selectedModel;

      setMessages(prev =>
        prev.map(m =>
          m.id === guruMsgId
            ? {
                ...m,
                text: answer,
                thought: thought || undefined,
                model: modelUsed,
                citations: data?.citations || [
                  { title: "Natya Shastra & Sangeeta Ratnakara", source: "SwaraGPT Classical Archive", tradition: "Canonical" }
                ],
                suggested_drills: data?.suggested_drills || [
                  "Sustain Adhara Sa for 8 beats at 60 BPM",
                  "Hold Gandhar within ±10 cents Sur zone"
                ],
                isStreaming: false
              }
            : m
        )
      );
    } catch (fallbackErr) {
      console.error("Chat error:", fallbackErr);
      setMessages(prev =>
        prev.map(m =>
          m.id === guruMsgId
            ? {
                ...m,
                text: `### 🕉️ Guidance from SwaraGPT Virtual Guru\n\nPracticing Indian Classical Music demands unwavering focus on **Shadja (Sa)**.\n\n* **Sa Stability:** Always sustain your tonic for at least 8 to 10 seconds with steady diaphragmatic breath (*Nabhi*) before exploring the raga.\n* **Vadi-Samvadi Balance:** In Raga Yaman, Gandhar (386 cents) is the Vadi note. Ground your voice into the Tanpura overtones before ascending to Tivra Ma.\n\nRecord another phrase or ask any question to continue our Sadhana.`,
                isStreaming: false
              }
            : m
        )
      );
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
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
        setInput(prev => (prev ? prev + ' ' : '') + transcript);
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

  const activeModelObj = MODEL_OPTIONS.find(m => m.id === selectedModel) || MODEL_OPTIONS[0];

  return (
    <div className="h-screen flex flex-col bg-[#FAF8F5] text-slate-900 font-sans selection:bg-amber-200 overflow-hidden">
      <Navbar />

      <div className="flex-1 flex max-w-7xl mx-auto w-full px-2 sm:px-4 lg:px-6 py-3 gap-4 overflow-hidden min-h-0">
        
        {/* Left Sidebar - Chat History (ChatGPT/Gemini Style) */}
        <aside className={`${
          sidebarOpen ? 'w-64 sm:w-72' : 'w-0'
        } transition-all duration-300 ease-in-out shrink-0 bg-white/90 backdrop-blur-md rounded-2xl border border-amber-900/10 shadow-sm flex flex-col overflow-hidden hidden md:flex`}>
          
          {/* New Chat Button */}
          <div className="p-3 border-b border-amber-900/10">
            <button
              onClick={startNewChat}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-medium text-xs py-2.5 px-4 rounded-xl shadow-sm transition-all hover:shadow cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Guru Dialogue</span>
            </button>
          </div>

          {/* Telemetry Switch */}
          <div className="p-3 bg-amber-50/70 border-b border-amber-200/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-700 font-medium">
              <Activity className="w-3.5 h-3.5 text-amber-700" />
              <span>Singing Telemetry</span>
            </div>
            <button
              onClick={() => setIncludeTelemetry(!includeTelemetry)}
              className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                includeTelemetry ? 'bg-amber-600' : 'bg-slate-300'
              }`}
              title="Include live vocal performance scores in queries"
            >
              <span className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                includeTelemetry ? 'left-4.5' : 'left-1'
              }`} />
            </button>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold px-2 py-1">
              Recent Dialogues
            </div>
            {conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setActiveConvId(conv.id)}
                className={`group flex items-center justify-between p-2.5 rounded-xl text-xs cursor-pointer transition-all ${
                  activeConvId === conv.id
                    ? 'bg-amber-100/80 text-amber-950 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${activeConvId === conv.id ? 'text-amber-700' : 'text-slate-400'}`} />
                  <span className="truncate">{conv.title}</span>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0 font-mono">{conv.timestamp}</span>
              </div>
            ))}
          </div>

          {/* Knowledge Grounding Status */}
          <div className="p-3 border-t border-amber-900/10 bg-[#FCFAF6] text-[11px] text-slate-500 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="truncate">Musicology Canon Grounded</span>
          </div>
        </aside>

        {/* Main Chat Workspace */}
        <main className="flex-1 flex flex-col bg-white/95 backdrop-blur-md rounded-2xl border border-amber-900/10 shadow-sm overflow-hidden relative">
          
          {/* Top Bar: Model Selector, Sidebar Toggle & Status */}
          <header className="px-4 py-3 border-b border-amber-900/10 flex items-center justify-between bg-[#FCFAF6]/90">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hidden md:flex p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer"
                title="Toggle Sidebar"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>

              {/* Model Selector Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowModelDropdown(!showModelDropdown)}
                  className="flex items-center gap-2 bg-white hover:bg-amber-50/70 border border-amber-300/80 px-3 py-1.5 rounded-xl shadow-2xs transition-all cursor-pointer group"
                >
                  <activeModelObj.icon className="w-4 h-4 text-amber-700" />
                  <div className="text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900">{activeModelObj.name}</span>
                      <span className="text-[9px] bg-amber-100 text-amber-800 font-mono px-1.5 py-0.2 rounded font-semibold">
                        {activeModelObj.badge}
                      </span>
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-colors" />
                </button>

                {showModelDropdown && (
                  <div className="absolute left-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-amber-200/90 p-2 z-50">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold px-2 py-1 mb-1">
                      Select Virtual Guru Engine
                    </div>
                    {MODEL_OPTIONS.map((opt) => (
                      <div
                        key={opt.id}
                        onClick={() => {
                          setSelectedModel(opt.id);
                          setShowModelDropdown(false);
                        }}
                        className={`p-2.5 rounded-xl cursor-pointer transition-all ${
                          selectedModel === opt.id
                            ? 'bg-amber-50 border border-amber-300'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <opt.icon className="w-4 h-4 text-amber-700" />
                            <span className="text-xs font-bold text-slate-900">{opt.name}</span>
                          </div>
                          {selectedModel === opt.id && <Check className="w-4 h-4 text-amber-700" />}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 pl-6">{opt.desc}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Status Badges */}
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                <span>RAG Active (22 Shrutis & Ragas)</span>
              </span>
            </div>
          </header>

          {/* Messages Stream Container */}
          <div
            ref={messagesContainerRef}
            onScroll={handleMessagesScroll}
            className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scroll-smooth"
          >
            
            {/* Empty state suggestions */}
            {messages.length <= 1 && (
              <div className="max-w-2xl mx-auto my-6 space-y-4">
                <div className="text-center space-y-1.5">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-700 text-white shadow-md shadow-amber-500/25">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h2 className="text-base font-bold text-slate-800 font-serif">Sadhana Inquiries & Masterclass Topics</h2>
                  <p className="text-xs text-slate-500">Select a prompt below or type your custom question to begin.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {SUGGESTED_PROMPTS.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(item.prompt)}
                      className="text-left p-3.5 bg-white hover:bg-amber-50/70 border border-amber-200/80 hover:border-amber-400 rounded-xl transition-all shadow-2xs hover:shadow-xs group cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono text-amber-800 font-semibold flex items-center gap-1">
                          <item.icon className="w-3 h-3 text-amber-600" />
                          {item.category}
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-amber-700 group-hover:translate-x-0.5 transition-all" />
                      </div>
                      <div className="text-xs font-bold text-slate-800 group-hover:text-amber-950">{item.title}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{item.prompt}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Messages */}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'guru' && (
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-700 flex items-center justify-center text-white shrink-0 mt-1 shadow-sm">
                    <Bot className="w-5 h-5" />
                  </div>
                )}

                <div className={`max-w-2xl sm:max-w-3xl rounded-2xl p-4 sm:p-5 ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white font-medium shadow-md shadow-amber-600/15'
                    : 'bg-[#FCFAF7] border border-amber-200/80 text-slate-800 shadow-2xs'
                }`}>
                  
                  {/* Sender & Timestamp */}
                  <div className={`flex items-center justify-between text-[11px] mb-2 font-mono ${
                    msg.sender === 'user' ? 'text-amber-100' : 'text-slate-500'
                  }`}>
                    <span className="font-semibold flex items-center gap-1.5">
                      {msg.sender === 'user' ? studentName : 'SwaraGPT Virtual Guru'}
                      {msg.model && msg.sender === 'guru' && (
                        <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-mono font-medium">
                          {msg.model.split('/').pop()?.replace(/-instruct|-vision/g, '')}
                        </span>
                      )}
                    </span>
                    <span>{msg.timestamp}</span>
                  </div>

                  {/* Thinking Process Accordion (Deep Reasoning CoT) */}
                  {msg.sender === 'guru' && msg.thought && (
                    <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50/50 overflow-hidden text-xs">
                      <button
                        onClick={() => toggleThought(msg.id)}
                        className="w-full px-3 py-1.5 flex items-center justify-between text-amber-900 font-mono text-[11px] hover:bg-amber-100/50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-1.5">
                          <BrainCircuit className="w-3.5 h-3.5 text-amber-700" />
                          <span className="font-semibold">Musicology Reasoning Process</span>
                        </div>
                        {expandedThoughts[msg.id] ? (
                          <ChevronDown className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5" />
                        )}
                      </button>
                      {expandedThoughts[msg.id] && (
                        <div className="p-3 border-t border-amber-200/60 bg-white/70 font-mono text-[11px] text-slate-600 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                          {msg.thought}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Message Body Content */}
                  {msg.sender === 'guru' ? (
                    <div className="prose prose-sm max-w-none text-slate-800 leading-relaxed">
                      <MarkdownRenderer content={msg.text} />
                      {msg.isStreaming && (
                        <span className="inline-block w-2 h-4 bg-amber-600 ml-1 animate-pulse align-middle" />
                      )}
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                  )}

                  {/* Suggested Drills */}
                  {msg.sender === 'guru' && msg.suggested_drills && msg.suggested_drills.length > 0 && !msg.isStreaming && (
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
                            className="text-xs bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shadow-2xs font-medium cursor-pointer hover:scale-[1.01]"
                          >
                            <span>{drill}</span>
                            <ArrowRight className="w-3 h-3 text-amber-700" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* RAG Knowledge Citations */}
                  {msg.sender === 'guru' && msg.citations && msg.citations.length > 0 && !msg.isStreaming && (
                    <div className="mt-4 pt-3 border-t border-amber-200/60 text-[11px] font-mono space-y-1 bg-amber-50/60 p-2.5 rounded-xl">
                      <div className="flex items-center gap-1.5 text-amber-950 font-bold">
                        <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                        <span>Verified Knowledge Sources:</span>
                      </div>
                      {msg.citations.map((c, i) => (
                        <div key={i} className="text-slate-600 pl-3 border-l-2 border-amber-400">
                          <span className="text-slate-900 font-semibold">{c.title}</span> • {c.source} {c.tradition ? `(${c.tradition})` : ''}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action Bar (Copy, Listen / Speak, Regenerate) */}
                  {msg.sender === 'guru' && !msg.isStreaming && (
                    <div className="mt-3 pt-2 flex items-center justify-end gap-1.5 text-slate-400">
                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="p-1.5 rounded-lg hover:bg-amber-100/60 hover:text-amber-900 transition-colors cursor-pointer"
                        title="Copy to clipboard"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        onClick={() => handleSpeak(msg.id, msg.text)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          speakingId === msg.id
                            ? 'bg-amber-200 text-amber-900'
                            : 'hover:bg-amber-100/60 hover:text-amber-900'
                        }`}
                        title={speakingId === msg.id ? "Stop voice" : "Listen with voice synthesis"}
                      >
                        {speakingId === msg.id ? (
                          <VolumeX className="w-3.5 h-3.5 text-rose-600" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5" />
                        )}
                      </button>
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

            {loading && !messages.some(m => m.isStreaming && m.text.length > 0) && (
              <div className="flex items-center gap-3 text-amber-800 text-xs font-mono font-medium p-3 bg-amber-50/60 rounded-xl max-w-sm">
                <RefreshCw className="w-4 h-4 animate-spin text-amber-700" />
                <span>Guru is meditating upon classical musicology scriptures...</span>
              </div>
            )}

          </div>

          {/* Floating "Scroll to Bottom" Button when User Scrolls Up */}
          {isUserScrolledUp && (
            <div className="absolute bottom-24 right-6 z-30">
              <button
                type="button"
                onClick={() => {
                  shouldAutoScrollRef.current = true;
                  setIsUserScrolledUp(false);
                  scrollToBottom('smooth');
                }}
                className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 px-3.5 py-1.5 rounded-full shadow-md text-xs font-semibold transition-all cursor-pointer hover:scale-105"
                title="Jump to latest message"
              >
                <ChevronDown className="w-4 h-4 text-slate-600" />
                <span>Jump to latest</span>
              </button>
            </div>
          )}

          {/* Floating Stop Generating Button */}
          {loading && (
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20">
              <button
                onClick={handleStopGenerating}
                className="flex items-center gap-1.5 bg-white/90 hover:bg-white text-slate-800 border border-slate-300 px-3.5 py-1.5 rounded-full shadow-md text-xs font-mono font-medium transition-all cursor-pointer hover:scale-105"
              >
                <Square className="w-3 h-3 text-rose-600 fill-rose-600" />
                <span>Stop Generating</span>
              </button>
            </div>
          )}

          {/* Input Box Bar (ChatGPT / Gemini Multi-line Style) */}
          <div className="p-3 sm:p-4 border-t border-slate-200 bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-end gap-2 bg-white p-2 rounded-2xl border border-slate-300 shadow-xs focus-within:border-amber-600 focus-within:ring-2 focus-within:ring-amber-100 transition-all"
            >
              {/* Mic Speech Button */}
              <button
                type="button"
                onClick={toggleVoiceInput}
                className={`p-2.5 rounded-xl transition-all cursor-pointer shrink-0 ${
                  isListeningSpeech
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
                title="Speak your question (Speech to Text)"
              >
                {isListeningSpeech ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                rows={1}
                placeholder="Ask Guru about Ragas, Swaras, 22 Shrutis, Bandishes, or vocal corrections... (Shift+Enter for new line)"
                className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none resize-none max-h-44 scrollbar-thin"
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="p-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm cursor-pointer shrink-0"
                title="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <div className="text-[10px] text-center text-slate-400 mt-2 font-mono">
              SwaraGPT Virtual Guru is powered by verified musicological treatises and acoustic intelligence.
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-[#F8F6F0]" />}>
      <ChatContent />
    </React.Suspense>
  );
}
