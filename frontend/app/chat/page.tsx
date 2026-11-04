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
  Flame, Music2, Headphones, Activity, Key, X
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
    id: 'swaragpt-native',
    name: 'SwaraGPT Shastra Engine',
    badge: 'Canonical Musicology',
    desc: 'Instant, authoritative classical musicology grounded in Natya Shastra, Sangeeta Ratnakara & Bhatkhande',
    icon: BrainCircuit,
    color: 'from-amber-500 to-amber-700'
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Google Gemini 2.5 Flash',
    badge: 'Cloud Multimodal AI',
    desc: 'Deep musical dialogue and live queries powered by Google AI',
    icon: Sparkles,
    color: 'from-emerald-500 to-teal-700'
  },
  {
    id: 'gpt-4o-mini',
    name: 'OpenAI GPT-4o Mini',
    badge: 'Cloud AI',
    desc: 'Advanced conversational reasoning with Indian classical prompts',
    icon: Bot,
    color: 'from-blue-500 to-indigo-700'
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
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);
  const [customApiKey, setCustomApiKey] = useState<string>('');
  const [tempApiKey, setTempApiKey] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedKey = localStorage.getItem('swara_custom_api_key') || '';
      setCustomApiKey(savedKey);
      setTempApiKey(savedKey);
    }
  }, []);

  const saveCustomApiKey = (keyToSave: string) => {
    setCustomApiKey(keyToSave);
    if (typeof window !== 'undefined') {
      if (keyToSave.trim()) {
        localStorage.setItem('swara_custom_api_key', keyToSave.trim());
      } else {
        localStorage.removeItem('swara_custom_api_key');
      }
    }
    setShowKeyModal(false);
  };

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
      const res = await chatApi.send(textToSend, perfContext, selectedModel, customApiKey);
      const data = res.data;
      const answer = data?.content || data?.response || data?.reply || data?.message || (typeof data === 'string' ? data : "I have reflected upon your inquiry.");
      const thought = data?.thought || null;
      const modelUsed = data?.model || activeModelObj.name;

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
        
        {/* Left Sidebar - Chat History */}
        <aside className={`${
          sidebarOpen ? 'w-64' : 'w-0'
        } transition-all duration-300 ease-in-out shrink-0 bg-white rounded-2xl border border-amber-900/10 shadow-xs flex flex-col overflow-hidden hidden md:flex`}>
          
          {/* New Chat Button */}
          <div className="p-3 border-b border-amber-900/10">
            <button
              onClick={startNewChat}
              className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs py-2 px-3 rounded-xl transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Conversation</span>
            </button>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold px-2 py-1">
              History
            </div>
            {conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setActiveConvId(conv.id)}
                className={`group flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-colors ${
                  activeConvId === conv.id
                    ? 'bg-amber-100 text-amber-950 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${activeConvId === conv.id ? 'text-amber-700' : 'text-slate-400'}`} />
                  <span className="truncate">{conv.title}</span>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0 font-mono">{conv.timestamp}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* Main Chat Workspace */}
        <main className="flex-1 flex flex-col bg-white rounded-2xl border border-amber-900/10 shadow-xs overflow-hidden relative">
          
          {/* Top Bar: Model Selector & Sidebar Toggle */}
          <header className="px-4 py-2.5 border-b border-amber-900/10 flex items-center justify-between bg-white">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Toggle Sidebar"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>

              {/* Clean Model Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowModelDropdown(!showModelDropdown)}
                  className="flex items-center gap-2 bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  <activeModelObj.icon className="w-4 h-4 text-amber-700" />
                  <span className="text-xs font-semibold text-slate-800">{activeModelObj.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {showModelDropdown && (
                  <div className="absolute left-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-slate-200 p-1.5 z-50">
                    {MODEL_OPTIONS.map((opt) => (
                      <div
                        key={opt.id}
                        onClick={() => {
                          setSelectedModel(opt.id);
                          setShowModelDropdown(false);
                        }}
                        className={`p-2 rounded-lg cursor-pointer transition-colors ${
                          selectedModel === opt.id ? 'bg-amber-50 text-amber-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs">{opt.name}</span>
                          {selectedModel === opt.id && <Check className="w-3.5 h-3.5 text-amber-700" />}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* API Key Modal Button */}
              <button
                onClick={() => {
                  setTempApiKey(customApiKey);
                  setShowKeyModal(true);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                  customApiKey
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
                title="Configure custom AI Key (Gemini / OpenAI)"
              >
                <Key className="w-3.5 h-3.5 text-amber-700" />
                <span className="hidden sm:inline">{customApiKey ? 'Custom AI Key Active' : 'Custom AI Key'}</span>
              </button>
            </div>

            {/* Subtle Status */}
            <div className="text-[11px] font-mono text-slate-400">
              Classical Shastras Grounded
            </div>
          </header>

          {/* API Key Setup Modal */}
          {showKeyModal && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
                    <Key className="w-4 h-4 text-amber-600" />
                    <span>Configure AI Provider Key (Optional)</span>
                  </div>
                  <button
                    onClick={() => setShowKeyModal(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  SwaraGPT features a built-in canonical musicology engine that answers all classical inquiries offline with zero keys. To connect live cloud AI reasoning, paste your free Google Gemini API key or OpenAI key below:
                </p>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-700 block">API Key (Gemini or OpenAI):</label>
                  <input
                    type="password"
                    value={tempApiKey}
                    onChange={(e) => setTempApiKey(e.target.value)}
                    placeholder="AIzaSy... or sk-..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-mono"
                  />
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>Stored locally in your browser</span>
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-700 hover:text-amber-800 font-semibold underline"
                    >
                      Get Free Gemini Key ↗
                    </a>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  {customApiKey && (
                    <button
                      type="button"
                      onClick={() => saveCustomApiKey('')}
                      className="px-3 py-1.5 rounded-xl text-xs text-rose-600 hover:bg-rose-50 font-medium cursor-pointer"
                    >
                      Clear Key
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => saveCustomApiKey(tempApiKey)}
                    className="px-4 py-1.5 rounded-xl text-xs bg-amber-600 hover:bg-amber-700 text-white font-medium shadow-xs cursor-pointer transition-colors"
                  >
                    Save & Apply
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Messages Stream Container */}
          <div
            ref={messagesContainerRef}
            onScroll={handleMessagesScroll}
            className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scroll-smooth"
          >
            
            {/* Empty state suggestions */}
            {messages.length <= 1 && (
              <div className="max-w-xl mx-auto my-auto py-12 text-center space-y-5">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 font-serif">Ask Your Virtual Guru</h2>
                  <p className="text-xs text-slate-500 mt-1">Select a topic below or type any question to begin</p>
                </div>

                <div className="flex flex-wrap justify-center gap-2">
                  {SUGGESTED_PROMPTS.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(item.prompt)}
                      className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 rounded-xl text-xs font-medium transition-colors cursor-pointer"
                    >
                      {item.title}
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
                    <div className="mt-3 pt-2 text-[11px] text-slate-400 font-mono">
                      <span className="font-semibold text-slate-500">Sources: </span>
                      {msg.citations.map((c, i) => (
                        <span key={i}>
                          {c.title} ({c.source}){i < msg.citations!.length - 1 ? ' • ' : ''}
                        </span>
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
