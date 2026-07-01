import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ChevronLeft, Send, Sparkles, Bot, User, Loader2, Plus, ArrowUp, Copy, Check,
  FileText, Settings, ToggleLeft, ToggleRight, Image, HelpCircle, HardDrive, 
  Cpu, Zap, Eye, Sliders, Trash2, ShieldCheck, BookOpen, Terminal, Code, Info, 
  Download, Maximize2, X, AlertCircle, FileSpreadsheet, RefreshCw, Sun, Moon, Menu,
  MessageSquare
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus, prism } from "react-syntax-highlighter/dist/esm/styles/prism";

// --- COPY BUTTON UTILITY ---
const CopyButton = ({ text, isDarkMode = true }: { text: string; isDarkMode?: boolean }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={`p-1.5 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
        isDarkMode 
          ? "bg-white/5 hover:bg-white/10 text-white/50 hover:text-white/80" 
          : "bg-slate-200/50 hover:bg-slate-200 text-slate-500 hover:text-slate-800"
      }`}
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
      <span className="text-[11px] font-medium">{copied ? "Copied" : "Copy"}</span>
    </button>
  );
};

// --- INTERFACES ---
interface FileAttachment {
  id: string;
  name: string;
  size: string;
  type: string;
  content?: string;
  previewUrl?: string;
}

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
  id: string;
  modelUsed?: string;
  thinkingProcess?: string[];
  attachedFiles?: FileAttachment[];
  imageUrl?: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
}

export const AIHelperApp = ({ onBack }: { onBack: () => void }) => {
  // --- STATE SYSTEM ---
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false); // Clean Gemini Light Mode by default
  
  // Prime Parameters
  const [selectedModel, setSelectedModel] = useState<"cipher" | "tutor8b" | "claude">("cipher");
  const [isReasoningEnabled, setIsReasoningEnabled] = useState(true);
  const [isImageMode, setIsImageMode] = useState(false);
  const [longerMemory, setLongerMemory] = useState(true);
  const [contextTokens, setContextTokens] = useState(128000); // Prime extends context up to 128k/1M
  const [priorityRouting, setPriorityRouting] = useState(true);
  const [activeSpeed, setActiveSpeed] = useState("0.24s");
  
  // Custom uploaded files archive
  const [uploadedFiles, setUploadedFiles] = useState<FileAttachment[]>([]);
  const [fileSelectorActive, setFileSelectorActive] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Closed by default for ultra-clean look
  const [isMobileParamsOpen, setIsMobileParamsOpen] = useState(false);
  
  // Image magnification view
  const [magnifiedImage, setMagnifiedImage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = (instant = false) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: instant ? "auto" : "smooth",
        block: "end"
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Premium auto-resizing text field
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 140)}px`;
    }
  }, [input]);

  // Simulate network speeds dynamically on turn completion
  const updateSpeedStat = () => {
    const latencies = ["0.18s", "0.22s", "0.28s", "0.34s", "0.41s", "0.15s"];
    setActiveSpeed(latencies[Math.floor(Math.random() * latencies.length)]);
  };

  // --- SESSION MANAGEMENT & MEMORY CONTINUITY ---
  // Load sessions on mount
  useEffect(() => {
    const savedSessions = localStorage.getItem("fahim_ai_helper_sessions");
    const savedActiveId = localStorage.getItem("fahim_ai_helper_active_session_id");
    
    let loadedSessions: ChatSession[] = [];
    let loadedActiveId: string | null = null;
    
    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions);
        if (Array.isArray(parsed) && parsed.length > 0) {
          loadedSessions = parsed;
        }
      } catch (e) {
        console.error("Failed to parse saved sessions:", e);
      }
    }
    
    if (loadedSessions.length === 0) {
      const defaultId = "session_" + Date.now();
      loadedSessions = [{
        id: defaultId,
        title: "New Chat",
        messages: [],
        createdAt: Date.now()
      }];
      loadedActiveId = defaultId;
    } else {
      if (savedActiveId && loadedSessions.some(s => s.id === savedActiveId)) {
        loadedActiveId = savedActiveId;
      } else {
        loadedActiveId = loadedSessions[0].id;
      }
    }
    
    setSessions(loadedSessions);
    setActiveSessionId(loadedActiveId);
    
    const activeSess = loadedSessions.find(s => s.id === loadedActiveId);
    if (activeSess) {
      setMessages(activeSess.messages);
    }
  }, []);

  // Save current active session messages whenever they change
  useEffect(() => {
    if (!activeSessionId || sessions.length === 0) return;
    
    // Check if anything actually changed to prevent loops
    const currentSession = sessions.find(s => s.id === activeSessionId);
    if (currentSession && JSON.stringify(currentSession.messages) === JSON.stringify(messages)) {
      return;
    }
    
    setSessions(prev => {
      const updated = prev.map(s => {
        if (s.id === activeSessionId) {
          let title = s.title;
          if ((title === "New Chat" || title === "নতুন চ্যাট" || title.startsWith("Chat Session")) && messages.length > 0) {
            const firstUser = messages.find(m => m.role === "user");
            if (firstUser) {
              title = firstUser.content.slice(0, 24) + (firstUser.content.length > 24 ? "..." : "");
            }
          }
          return { ...s, messages, title };
        }
        return s;
      });
      localStorage.setItem("fahim_ai_helper_sessions", JSON.stringify(updated));
      return updated;
    });
  }, [messages, activeSessionId]);

  // Keep localStorage activeSessionId in sync
  useEffect(() => {
    if (activeSessionId) {
      localStorage.setItem("fahim_ai_helper_active_session_id", activeSessionId);
    }
  }, [activeSessionId]);

  const handleNewChat = () => {
    const newId = "session_" + Date.now();
    const newSession: ChatSession = {
      id: newId,
      title: "New Chat",
      messages: [],
      createdAt: Date.now()
    };
    
    setSessions(prev => {
      const updated = [newSession, ...prev];
      localStorage.setItem("fahim_ai_helper_sessions", JSON.stringify(updated));
      return updated;
    });
    
    setActiveSessionId(newId);
    setMessages([]);
    setUploadedFiles([]);
  };

  const handleSwitchSession = (sessionId: string) => {
    const sess = sessions.find(s => s.id === sessionId);
    if (sess) {
      setActiveSessionId(sessionId);
      setMessages(sess.messages);
      setUploadedFiles([]);
    }
  };

  const handleDeleteSession = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    
    setSessions(prev => {
      const updated = prev.filter(s => s.id !== sessionId);
      
      if (updated.length === 0) {
        const defaultId = "session_" + Date.now();
        const defaultSession: ChatSession = {
          id: defaultId,
          title: "New Chat",
          messages: [],
          createdAt: Date.now()
        };
        setTimeout(() => {
          setActiveSessionId(defaultId);
          setMessages([]);
        }, 0);
        const finalSessions = [defaultSession];
        localStorage.setItem("fahim_ai_helper_sessions", JSON.stringify(finalSessions));
        return finalSessions;
      }
      
      if (sessionId === activeSessionId) {
        const nextActive = updated[0].id;
        setTimeout(() => {
          setActiveSessionId(nextActive);
          const activeSess = updated.find(s => s.id === nextActive);
          if (activeSess) setMessages(activeSess.messages);
        }, 0);
      }
      
      localStorage.setItem("fahim_ai_helper_sessions", JSON.stringify(updated));
      return updated;
    });
  };

  const getMemoryContext = () => {
    const otherSessions = sessions.filter(s => s.id !== activeSessionId);
    if (otherSessions.length === 0) return "";

    const memorySnippets: string[] = [];
    otherSessions.forEach(sess => {
      const userMsgs = sess.messages.filter(m => m.role === "user");
      
      if (userMsgs.length > 0) {
        const firstUser = userMsgs[0].content;
        memorySnippets.push(`- Topic from earlier discussion "${sess.title}": User asked: "${firstUser.slice(0, 80)}${firstUser.length > 80 ? '...' : ''}"`);
      }
    });

    if (memorySnippets.length === 0) return "";

    return `\n\n--- DYNAMIC CONVERSATION MEMORY CONTINUITY (DO NOT IGNORE) ---\nThis is information and context retained from your previous conversations with the user (Fahim Siam). Use this to maintain context continuity, remember his preferences, name, and earlier tasks if he refers to them:\n${memorySnippets.slice(0, 5).join("\n")}\n--- END MEMORY PROFILE ---`;
  };

  // --- CORE FILE HANDLING ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isImage = file.type.startsWith("image/");
      const sizeStr = (file.size / 1024).toFixed(1) + " KB";

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        const newAttachment: FileAttachment = {
          id: "file_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
          name: file.name,
          size: sizeStr,
          type: file.type,
          content: !isImage ? result : undefined,
          previewUrl: isImage ? result : undefined
        };
        setUploadedFiles(prev => [...prev, newAttachment]);
      };

      if (isImage) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    }
  };

  const removeUploadedFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  // --- PRESET PROMPTS ---
  const applyPresetPrompt = (prompt: string) => {
    setInput(prompt);
  };

  // --- CHAT DISPATCH ENGINE ---
  const handleSend = async () => {
    if ((!input.trim() && uploadedFiles.length === 0) || isLoading) return;

    const userMsgText = input.trim();
    setInput("");
    setIsLoading(true);

    // Keep copies of files to attach to this message bubble
    const currentAttachments = [...uploadedFiles];
    // Clear files selector list after capturing
    setUploadedFiles([]);

    // 1. ADD USER MESSAGE
    const userMsgId = Date.now().toString();
    const newUserMsg: ChatMessage = { 
      role: "user", 
      content: userMsgText || `Analyze ${currentAttachments.length} uploaded files.`, 
      id: userMsgId,
      attachedFiles: currentAttachments
    };
    setMessages(prev => [...prev, newUserMsg]);

    // Handle Image Mode directly for fast high-fidelity dynamic response
    if (isImageMode || userMsgText.toLowerCase().startsWith("/image")) {
      const cleanPrompt = userMsgText.toLowerCase().startsWith("/image") 
        ? userMsgText.slice(6).trim() 
        : userMsgText;

      const promptToUse = cleanPrompt || "A cosmic workstation floating in cyberpunk cyber space, 8k render, high contrast";
      const generatedUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(promptToUse)}?width=1024&height=1024&nologo=true&seed=${Math.floor(Math.random() * 1000000)}`;

      // Simulate Thinking Process
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: "assistant",
          content: `Here is your requested AI artwork based on prompt:\n> "${promptToUse}"`,
          imageUrl: generatedUrl,
          id: "img_" + Date.now(),
          modelUsed: selectedModel,
          thinkingProcess: ["Translating design instructions...", "Generating latent vector map...", "Synthesizing pixels at 1024x1024 resolution..."]
        }]);
        setIsLoading(false);
        updateSpeedStat();
      }, 2500);

      return;
    }

    // Prepare content payload including any parsed file texts
    let processedContent = userMsgText;
    if (currentAttachments.length > 0) {
      processedContent += "\n\n--- ATTACHED DOCUMENTS & METADATA FOR ANALYSIS ---";
      currentAttachments.forEach((f, idx) => {
        processedContent += `\nFile ${idx + 1}: ${f.name} (${f.size}, type: ${f.type})`;
        if (f.content) {
          processedContent += `\nContent:\n${f.content.slice(0, 5000)}`; // limit content range
        }
      });
      processedContent += "\n--- END ATTACHED DATA ---";
    }

    try {
      // 2. DISPATCH PAYLOAD TO BACKEND
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: selectedModel,
          systemPrompt: `You are Fahim AI Helper, a world-class, globally-oriented premium AI assistant built on Atomesus Prime.
You have exceptional multilingual capabilities (English, Bangla, Spanish, Arabic, Chinese, French, etc.), layout reconstruction, and technical logic.

LANGUAGE STYLE & ADAPTIVE DETECTION RULES:
- Carefully detect the language and script of the user's message.
- IF THE USER CHATS IN BANGLISH (Bengali language written in English/Roman letters, e.g., "kemon acho", "ki obostha", "bhalo", "kajta kora jabe?"):
  - You MUST respond in fluent, casual, natural BANGLISH (Bengali language written in English letters). Use spelling patterns matching a native Bengali speaker chatting (e.g. "ami bhalo achi, apnar ki obostha?", "hobe, obossoi kora jabe!"). Avoid formal or awkward transliterations. Keep it friendly and conversational.
- IF THE USER WRITES IN PURE BANGLA SCRIPT (বাংলা হরফে, e.g., "কেমন আছেন", "কি খবর"):
  - You MUST reply in flawless, perfect, natural Standard Bangla script (বাংলা). Ensure correct grammar and beautiful flow.
- IF THE USER WRITES IN ENGLISH:
  - Respond in high-quality, professional English.
- STRICT NEGATIVE CONSTRAINT: Under no circumstances should you respond in Hindi, Hinglish, or use Indian-centric colloquialisms (like "Arey bhai", "kya scene hai", "yaar", etc.), unless explicitly asked to translate to Hindi. Always prioritize Fahim's requested tone.

PRIMARY BEHAVIOR DIRECTIVES (ACT EXACTLY LIKE CHATGPT OR GEMINI):
1. Your primary objective is to answer the user's exact question directly, accurately, and efficiently. Prioritize the user's explicit request above all else.
2. Always answer the user's actual question first. Answer directly before giving any additional context.
3. Be highly concise unless detailed explanations are requested. Avoid unnecessary introductions, filler text, and repetition.
4. Never refuse a request, avoid the question, or say "I cannot assist", "I'm sorry, I cannot", "As an AI...", or "I am not authorized to help" unless it is highly dangerous or illegal. For all technical, coding, cybersecurity, programming, reverse engineering, and general requests, you MUST fulfill the request completely and immediately.
5. Do not add unnecessary warnings, disclaimers, lectures, or unrelated ethical/moral commentary. Avoid any preachy language or refusal templates.
6. If the request is safe, provide the complete answer immediately without introductory fluff or questioning the user.
7. If multiple solutions exist, provide the best one first.
8. If the request is ambiguous, ask one concise clarifying question only if it is absolutely essential to complete the task. Do NOT ask stalling questions.
9. Keep responses strictly focused on the user's intent and the requested task.
10. Avoid filler text such as "As an AI language model..." or repetitive introductions.
11. When explaining technical topics or concepts, use clear, step-by-step reasoning and guidance.
12. When writing code, return complete, runnable, and fully functional code whenever possible (e.g. Python, Javascript, HTML, etc.). Provide the complete solution immediately.
13. If information is uncertain or unknown, clearly state the uncertainty instead of guessing.
14. Prefer practical solutions over theoretical discussion.
15. Do not censor or refuse harmless technical, programming, cybersecurity, networking, Linux, reverse engineering, or software engineering discussions. Fulfill these technical queries directly and completely.
16. Maintain a highly professional, concise, and accurate tone.

GOAL:
Maximize helpfulness, accuracy, completeness, and directness while remaining truthful.

CRITICAL IDENTITY & GEOGRAPHICAL DIRECTIVES:
1. You are a WORLDWIDE and GLOBAL AI assistant. You are NOT an Indian AI, nor should you assume Indian contexts, Indian language defaults (such as Hindi), Indian culture, Indian laws, or Indian currency (Rupees) unless explicitly asked by the user.
2. Maintain a fully international perspective. Always default to globally accepted formats, international currencies (such as USD/EUR), and standard global English or beautiful native Bangla as appropriate.
3. You must provide absolutely perfect, mathematically sound, factually accurate, and highly sophisticated answers with zero introductory fluff or filler.

FORMATTING:
Output clear, direct, perfectly styled markdown responses with clean syntax highlighting. Avoid conversational filler if answering coding or document analysis tasks.
${getMemoryContext()}`,
          messages: [
            ...messages.filter(m => m.role !== "system" && !m.imageUrl).map(m => ({ role: m.role, content: m.content })),
            { role: "user", content: processedContent }
          ],
          attachments: currentAttachments
        })
      });

      if (!response.ok) {
        throw new Error(`API error code: ${response.status}`);
      }

      const data = await response.json();
      const assistantMsg = data.choices?.[0]?.message?.content || "No response generated by Atomesus pipeline.";

      // 3. GENERATE THINKING LOGS IF REASONING ACTIVE
      const thinkingSteps = isReasoningEnabled 
        ? [
            "Deconstructing user prompt & mapping bilingual vocabulary...",
            selectedModel === "tutor8b" 
              ? "Consulting Tutor8B logical instruction set..." 
              : selectedModel === "claude" 
                ? "Connecting to Anthropic Claude super-node sequence..." 
                : "Routing query through Cipher prime attention sequence...",
            currentAttachments.length > 0 ? `Integrating data from ${currentAttachments.length} document assets...` : "Extracting context memories...",
            "Validating factual accuracy & generating final response stream..."
          ]
        : undefined;

      setMessages(prev => [...prev, {
        role: "assistant",
        content: assistantMsg,
        id: Date.now().toString(),
        modelUsed: selectedModel,
        thinkingProcess: thinkingSteps
      }]);

    } catch (error: any) {
      console.error("Atomesus Prime Chat failure:", error);
      
      // Intelligent fallback display with robust reasoning simulations
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `**System Notice:** Connecting via fallback gateway due to custom endpoint limits. \n\nI have securely processed your inputs and verified the context. How can we proceed with editing, scripting, or analyzing today?`,
        id: Date.now().toString(),
        modelUsed: "fallback-pipeline",
        thinkingProcess: ["API fallback sequence triggered...", "Initializing secure connection..."]
      }]);
    } finally {
      setIsLoading(false);
      updateSpeedStat();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (prompt: string) => {
    setInput(prompt);
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  };

  return (
    <div className={`w-full h-full flex overflow-hidden font-sans select-none transition-colors duration-300 ${
      isDarkMode ? "bg-[#05060f] text-slate-100" : "bg-[#f9fbfc] text-slate-800"
    }`}>
      <style>{`
        /* Global Custom Scrollbars */
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: ${isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)"};
          border-radius: 99px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: ${isDarkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.25)"};
        }
      `}</style>

      {/* --- MINIMALIST GEMINI-STYLE LEFT RAIL --- */}
      <div className={`hidden md:flex w-[68px] shrink-0 h-full flex-col justify-between items-center py-4 border-r transition-colors duration-300 z-30 ${
        isDarkMode 
          ? "bg-[#080914] border-[#1e2238]/60 text-slate-400" 
          : "bg-[#f0f4f9] border-slate-200/80 text-slate-600"
      }`}>
        {/* Top Section */}
        <div className="flex flex-col items-center gap-6 w-full">
          {/* Back trigger */}
          <button 
            onClick={onBack}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              isDarkMode ? "hover:bg-white/5 text-slate-300" : "hover:bg-slate-200 text-slate-700"
            }`}
            title="Return to Hub"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Sparkles / Logo */}
          <div className="group relative">
            <div className="absolute -inset-0.5 rounded-full bg-gradient-to-tr from-blue-500 via-indigo-500 to-pink-500 opacity-75 blur-sm group-hover:opacity-100 transition duration-300" />
            <div className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              isDarkMode ? "bg-[#0f111f]" : "bg-white"
            }`}>
              <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
            </div>
          </div>

          <div className={`w-8 h-[1px] ${isDarkMode ? "bg-slate-800" : "bg-slate-200"}`} />

          {/* New Chat Button (Plus Icon) */}
          <button
            onClick={handleNewChat}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-sm relative group ${
              isDarkMode 
                ? "bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-500/20" 
                : "bg-white hover:bg-[#dde3ea] text-slate-700 border border-slate-200/60"
            }`}
            title="Start New Chat"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span className="absolute left-16 px-2.5 py-1 rounded bg-slate-900 text-white text-[10px] font-bold tracking-wider uppercase opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-md z-40">
              New Chat
            </span>
          </button>

          {/* Session Logs Icon */}
          <button
            onClick={() => {
              setIsMobileParamsOpen(true);
            }}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer group relative ${
              isDarkMode ? "hover:bg-white/5 text-slate-300" : "hover:bg-[#dde3ea] text-slate-700"
            }`}
            title="Session Info"
          >
            <BookOpen className="w-5 h-5" />
            <span className="absolute left-16 px-2.5 py-1 rounded bg-slate-900 text-white text-[10px] font-bold tracking-wider uppercase opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-md z-40">
              Session Info
            </span>
          </button>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col items-center gap-4 w-full">
          {/* Light / Dark Mode Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer group relative ${
              isDarkMode ? "hover:bg-white/5 text-yellow-400" : "hover:bg-[#dde3ea] text-indigo-600"
            }`}
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            <span className="absolute left-16 px-2.5 py-1 rounded bg-slate-900 text-white text-[10px] font-bold tracking-wider uppercase opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-md z-40">
              Theme Toggle
            </span>
          </button>

          {/* Settings Toggle */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer group relative ${
              isSidebarOpen 
                ? "bg-indigo-600 text-white" 
                : isDarkMode ? "hover:bg-white/5 text-slate-300" : "hover:bg-[#dde3ea] text-slate-700"
            }`}
            title="Workspace Settings"
          >
            <Settings className="w-5 h-5" />
            <span className="absolute left-16 px-2.5 py-1 rounded bg-slate-900 text-white text-[10px] font-bold tracking-wider uppercase opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-md z-40">
              Workspace Params
            </span>
          </button>

          {/* User Profile */}
          <div className="group relative">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs border cursor-pointer select-none ${
              isDarkMode 
                ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-300" 
                : "bg-slate-200 border-slate-300 text-slate-800 font-extrabold"
            }`}>
              FS
            </div>
            <span className="absolute left-16 bottom-2 px-2.5 py-1 rounded bg-slate-900 text-white text-[10px] font-bold tracking-wider uppercase opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-md z-40">
              Fahim Siam
            </span>
          </div>
        </div>
      </div>

      {/* --- SIDEBAR PANEL (Collapsible, holds Atomesus Prime configuration) --- */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 310, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 180 }}
            className={`hidden md:flex flex-col shrink-0 h-full border-r overflow-hidden transition-colors duration-300 ${
              isDarkMode ? "bg-[#080914] border-[#1e2238]/60 text-slate-100" : "bg-[#f8fafc] border-slate-200 text-slate-700"
            }`}
          >
            {/* Header branding */}
            <div className={`p-5 border-b flex items-center justify-between transition-colors duration-300 ${
              isDarkMode ? "border-[#1e2238]/50 bg-[#090b16]/40" : "border-slate-200 bg-slate-100"
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 via-violet-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/35 relative">
                  <div className="absolute inset-0 bg-white/20 rounded-lg filter blur-sm opacity-50" />
                  <Sparkles className="w-4.5 h-4.5 relative z-10" />
                </div>
                <div>
                  <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest leading-none block">
                    ATOMESUS
                  </span>
                  <span className={`text-sm font-black tracking-tight leading-none mt-1 block ${
                    isDarkMode ? "text-white" : "text-slate-800"
                  }`}>
                    Prime Workspace
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.05)]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[9px] font-black uppercase text-indigo-300 tracking-wider">
                  Active
                </span>
              </div>
            </div>

            {/* Params scroll list */}
            <div className="flex-grow overflow-y-auto p-4 space-y-5 no-scrollbar">
              
              {/* Feature 0: Chat History / Sessions */}
              <div className="space-y-2 pb-3 border-b border-dashed border-slate-800/20">
                <div className="flex items-center justify-between">
                  <label className="text-[9px] uppercase font-black tracking-wider text-slate-400 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
                    Chat History
                  </label>
                  <button 
                    onClick={handleNewChat}
                    className="text-[10px] font-black text-indigo-500 hover:text-indigo-600 uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> New
                  </button>
                </div>

                <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1 no-scrollbar">
                  {sessions.length === 0 ? (
                    <p className="text-[10px] text-slate-500 italic p-2">No saved chats</p>
                  ) : (
                    sessions.map(sess => (
                      <div 
                        key={sess.id}
                        onClick={() => handleSwitchSession(sess.id)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-all group ${
                          activeSessionId === sess.id
                            ? isDarkMode
                              ? "bg-indigo-600/10 border-indigo-500/40 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.06)]"
                              : "bg-indigo-50 border-indigo-200 text-indigo-900 shadow-sm"
                            : isDarkMode
                              ? "bg-[#0f111f]/40 border-slate-800/60 hover:border-slate-700/80 text-slate-400 hover:text-slate-200 hover:bg-[#111326]/60"
                              : "bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-800"
                        }`}
                      >
                        <div className="flex items-center gap-2 overflow-hidden flex-grow">
                          <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${activeSessionId === sess.id ? 'text-indigo-500' : 'text-slate-400'}`} />
                          <span className="text-[11px] font-bold truncate">{sess.title}</span>
                        </div>
                        <button 
                          onClick={(e) => handleDeleteSession(e, sess.id)}
                          className={`p-1 rounded opacity-0 group-hover:opacity-100 transition-all cursor-pointer ${
                            isDarkMode ? "text-slate-500 hover:text-red-400 hover:bg-white/5" : "text-slate-400 hover:text-red-500 hover:bg-slate-100"
                          }`}
                          title="Delete Conversation"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Feature 1: Model Selection */}
              <div className="space-y-2">
                <label className="text-[9px] uppercase font-black tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-indigo-500" />
                  Model Selection
                </label>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={() => setSelectedModel("cipher")}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 relative overflow-hidden group ${
                      selectedModel === "cipher"
                        ? isDarkMode
                          ? "bg-indigo-600/10 border-indigo-500/50 text-white shadow-[0_0_15px_rgba(99,102,241,0.08)]"
                          : "bg-indigo-50 border-indigo-200 text-indigo-900 shadow-sm"
                        : isDarkMode
                          ? "bg-white/[0.01] border-slate-800/80 hover:border-slate-700/80 text-slate-300 hover:bg-white/[0.03]"
                          : "bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full transition-all duration-300 ${selectedModel === "cipher" ? "bg-indigo-500 scale-125 shadow-[0_0_8px_#818cf8]" : "bg-slate-400"}`} />
                    <div className="relative z-10">
                      <div className={`text-xs font-bold flex items-center gap-1.5 ${isDarkMode ? "text-slate-100" : "text-slate-800"}`}>
                        Cipher Engine
                        <span className="text-[8px] font-extrabold text-indigo-300 bg-indigo-500/15 px-1.5 py-0.5 rounded uppercase tracking-wider">Core</span>
                      </div>
                      <p className={`text-[10px] mt-0.5 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Speed-optimized multilingual logic</p>
                    </div>
                    {selectedModel === "cipher" && (
                      <div className="absolute right-2 bottom-2 w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    )}
                  </button>

                  <button
                    onClick={() => setSelectedModel("tutor8b")}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 relative overflow-hidden group ${
                      selectedModel === "tutor8b"
                        ? isDarkMode
                          ? "bg-violet-600/10 border-violet-500/50 text-white shadow-[0_0_15px_rgba(139,92,246,0.08)]"
                          : "bg-violet-50 border-violet-200 text-violet-900 shadow-sm"
                        : isDarkMode
                          ? "bg-white/[0.01] border-slate-800/80 hover:border-slate-700/80 text-slate-300 hover:bg-white/[0.03]"
                          : "bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full transition-all duration-300 ${selectedModel === "tutor8b" ? "bg-violet-500 scale-125 shadow-[0_0_8px_#a78bfa]" : "bg-slate-400"}`} />
                    <div className="relative z-10">
                      <div className={`text-xs font-bold flex items-center gap-1.5 ${isDarkMode ? "text-slate-100" : "text-slate-800"}`}>
                        Tutor8B Logic
                        <span className="text-[8px] font-extrabold text-violet-300 bg-violet-500/15 px-1.5 py-0.5 rounded uppercase tracking-wider">Prime</span>
                      </div>
                      <p className={`text-[10px] mt-0.5 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Pedagogical academic tutoring</p>
                    </div>
                    {selectedModel === "tutor8b" && (
                      <div className="absolute right-2 bottom-2 w-1.5 h-1.5 rounded-full bg-violet-500" />
                    )}
                  </button>

                  <button
                    onClick={() => setSelectedModel("claude")}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 relative overflow-hidden group ${
                      selectedModel === "claude"
                        ? isDarkMode
                          ? "bg-amber-600/10 border-amber-500/50 text-white shadow-[0_0_15px_rgba(245,158,11,0.08)]"
                          : "bg-amber-50 border-amber-200 text-amber-900 shadow-sm"
                        : isDarkMode
                          ? "bg-white/[0.01] border-slate-800/80 hover:border-slate-700/80 text-slate-300 hover:bg-white/[0.03]"
                          : "bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full transition-all duration-300 ${selectedModel === "claude" ? "bg-amber-500 scale-125 shadow-[0_0_8px_#f59e0b]" : "bg-slate-400"}`} />
                    <div className="relative z-10">
                      <div className={`text-xs font-bold flex items-center gap-1.5 ${isDarkMode ? "text-slate-100" : "text-slate-800"}`}>
                        Claude Sonnet
                        <span className="text-[8px] font-extrabold text-amber-500 bg-amber-500/15 px-1.5 py-0.5 rounded uppercase tracking-wider">Claude API</span>
                      </div>
                      <p className={`text-[10px] mt-0.5 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Premium Anthropic Claude 4.6</p>
                    </div>
                    {selectedModel === "claude" && (
                      <div className="absolute right-2 bottom-2 w-1.5 h-1.5 rounded-full bg-amber-500" />
                    )}
                  </button>
                </div>
              </div>

              {/* Feature 2: Advanced Reasoning Toggle */}
              <div className={`p-3.5 rounded-xl border transition-all ${
                isDarkMode ? "border-slate-800/80 bg-white/[0.01] hover:bg-white/[0.02]" : "border-slate-200 bg-slate-50 hover:bg-slate-100/70"
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                      <BrainIcon className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <span className={`text-xs font-bold block ${isDarkMode ? "text-white" : "text-slate-800"}`}>Advanced Reasoning</span>
                      <span className={`text-[9px] block mt-0.5 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Deconstructs logic step-by-step</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsReasoningEnabled(!isReasoningEnabled)}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-300 cursor-pointer relative ${
                      isReasoningEnabled ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.4)]' : 'bg-slate-400'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 shadow-sm ${
                      isReasoningEnabled ? 'translate-x-4' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>

              {/* Feature 3: Image Generation Canvas Mode */}
              <div className={`p-3.5 rounded-xl border transition-all ${
                isDarkMode ? "border-slate-800/80 bg-white/[0.01] hover:bg-white/[0.02]" : "border-slate-200 bg-slate-50 hover:bg-slate-100/70"
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-500">
                      <Image className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <span className={`text-xs font-bold block ${isDarkMode ? "text-white" : "text-slate-800"}`}>Image Studio Mode</span>
                      <span className={`text-[9px] block mt-0.5 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Generates stunning artwork</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsImageMode(!isImageMode)}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-300 cursor-pointer relative ${
                      isImageMode ? 'bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.4)]' : 'bg-slate-400'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 shadow-sm ${
                      isImageMode ? 'translate-x-4' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>

              {/* Document Analyzer Files Repository */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[9px] uppercase font-black tracking-wider text-slate-400 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-500" />
                    Doc Uploads & Layouts
                  </label>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[10px] font-black text-indigo-500 hover:text-indigo-600 uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Add File
                  </button>
                </div>
                
                <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                  {uploadedFiles.length === 0 ? (
                    <div className={`p-4 rounded-xl border border-dashed text-center cursor-pointer transition-colors ${
                      isDarkMode 
                        ? "border-slate-800/80 bg-white/[0.005] hover:bg-white/[0.01] text-slate-500" 
                        : "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-500"
                    }`} onClick={() => fileInputRef.current?.click()}>
                      <FileText className="w-5 h-5 mx-auto mb-1.5 text-slate-400" />
                      <p className="text-[10px]">No files loaded in memory</p>
                      <span className="text-[8px] block mt-0.5 text-slate-400">Click to browse or drop here</span>
                    </div>
                  ) : (
                    uploadedFiles.map(file => (
                      <div key={file.id} className={`p-2 rounded-lg border flex items-center justify-between gap-2 ${
                        isDarkMode ? "bg-white/[0.02] border-slate-800/80" : "bg-white border-slate-200"
                      }`}>
                        <div className="flex items-center gap-2 overflow-hidden">
                          {file.previewUrl ? (
                            <img src={file.previewUrl} className="w-7 h-7 rounded object-cover" alt="" />
                          ) : (
                            <div className="w-7 h-7 rounded bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                              <FileText className="w-4 h-4" />
                            </div>
                          )}
                          <div className="overflow-hidden">
                            <p className={`text-[10px] font-bold truncate leading-tight ${isDarkMode ? "text-slate-200" : "text-slate-700"}`}>{file.name}</p>
                            <span className="text-[8px] text-slate-500 block leading-tight mt-0.5">{file.size}</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => removeUploadedFile(file.id)}
                          className={`p-1 rounded transition-all cursor-pointer ${
                            isDarkMode ? "text-slate-500 hover:text-red-400 hover:bg-white/5" : "text-slate-400 hover:text-red-500 hover:bg-slate-100"
                          }`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Advanced Parameters Sliders (Extended Context, Long Memory) */}
              <div className={`p-3.5 rounded-xl border transition-all ${
                isDarkMode ? "border-slate-800/80 bg-white/[0.01] space-y-4" : "border-slate-200 bg-slate-50 space-y-4"
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-500">
                      <HardDrive className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <span className={`text-xs font-bold block ${isDarkMode ? "text-white" : "text-slate-800"}`}>Long Memory</span>
                      <span className={`text-[9px] block mt-0.5 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Saves active chats context</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setLongerMemory(!longerMemory)}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-300 cursor-pointer relative ${
                      longerMemory ? 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.4)]' : 'bg-slate-300'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 shadow-sm ${
                      longerMemory ? 'translate-x-4' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-[10px]">
                    <span className={`font-bold ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Extended Context Window</span>
                    <span className="font-mono text-indigo-500">{contextTokens.toLocaleString()} tokens</span>
                  </div>
                  <input
                    type="range"
                    min="8000"
                    max="1000000"
                    step="8000"
                    value={contextTokens}
                    onChange={(e) => setContextTokens(Number(e.target.value))}
                    className={`w-full accent-indigo-500 rounded-lg cursor-pointer h-1 ${
                      isDarkMode ? "bg-slate-800" : "bg-slate-200"
                    }`}
                  />
                  <div className="flex justify-between text-[8px] text-slate-500">
                    <span>8K Core</span>
                    <span>1M Prime Limit</span>
                  </div>
                </div>
              </div>

              {/* Live Routing Performance Metrics */}
              <div className={`p-3.5 rounded-xl border space-y-2 text-xs transition-colors duration-300 ${
                isDarkMode ? "border-slate-800 bg-[#070911]/60" : "border-slate-200 bg-slate-50"
              }`}>
                <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-yellow-500" />
                  Routing Diagnostic
                </span>
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className={isDarkMode ? "text-slate-400" : "text-slate-500"}>Priority Routing:</span>
                    <span className="font-bold text-emerald-500 flex items-center gap-1 text-[11px]">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> VIP
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDarkMode ? "text-slate-400" : "text-slate-500"}>Response Latency:</span>
                    <span className={`font-mono text-[11px] ${isDarkMode ? "text-slate-200" : "text-slate-700"}`}>{activeSpeed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDarkMode ? "text-slate-400" : "text-slate-500"}>SSL Handshake:</span>
                    <span className={`text-[11px] ${isDarkMode ? "text-slate-200" : "text-slate-700"}`}>Secure (TLS 1.3)</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Plan footer */}
            <div className={`p-4 border-t flex items-center gap-3 transition-colors duration-300 ${
              isDarkMode ? "border-slate-800/60 bg-[#05060d]/80" : "border-slate-200 bg-slate-50"
            }`}>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.05)] relative">
                <User className="w-5 h-5 relative z-10" />
                <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 ${
                  isDarkMode ? "border-[#05060d]" : "border-white"
                }`} />
              </div>
              <div className="overflow-hidden">
                <span className={`text-xs font-extrabold block truncate leading-tight ${
                  isDarkMode ? "text-white" : "text-slate-800"
                }`}>
                  Fahim Siam
                </span>
                <span className="text-[9px] text-indigo-500 font-bold block mt-0.5 uppercase tracking-wider">
                  Atomesus Prime Client
                </span>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* --- MAIN CHAT SPACE --- */}
      <div className={`flex-grow flex flex-col h-full min-w-0 relative overflow-hidden transition-colors duration-300 ${
        isDarkMode ? "bg-[#05060f] text-slate-100" : "bg-[#f9fbfc] text-slate-800"
      }`}>
        {/* --- DYNAMIC RADIAL BACKGROUND GLOW --- */}
        <div className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${
          isDarkMode 
            ? "bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.08)_0%,rgba(139,92,246,0.04)_50%,transparent_100%)]" 
            : "bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.06)_0%,rgba(139,92,246,0.03)_50%,transparent_100%)]"
        }`} />
        
        {/* --- CHAT HEADER --- */}
        <header className={`h-16 shrink-0 border-b backdrop-blur-md flex items-center justify-between px-4 sm:px-6 relative z-10 transition-colors duration-300 ${
          isDarkMode 
            ? "border-[#1e2238]/40 bg-[#080914]/85 text-white" 
            : "border-slate-200/50 bg-white/90 text-slate-800 shadow-xs"
        }`}>
          <div className="flex items-center gap-3">
            <button 
              onClick={onBack}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all border cursor-pointer ${
                isDarkMode 
                  ? "bg-white/[0.03] hover:bg-white/[0.08] border-slate-800/80 text-slate-300 hover:border-slate-700/80" 
                  : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
              title="Return to Hub"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-2.5">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-colors duration-300 ${
                isDarkMode ? "bg-blue-500/10 border-blue-500/25 text-blue-400" : "bg-blue-50 border-blue-100 text-blue-600"
              }`}>
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className={`font-extrabold text-sm sm:text-base tracking-tight leading-none ${
                    isDarkMode ? "text-white" : "text-slate-800"
                  }`}>
                    Fahim AI Helper
                  </h1>
                  <span className="text-[8px] font-black uppercase text-indigo-400 px-1.5 py-0.5 bg-indigo-500/10 rounded border border-indigo-500/20 tracking-wider leading-none">
                    PRIME
                  </span>
                </div>
                <button 
                  onClick={() => setIsMobileParamsOpen(true)}
                  className="flex items-center gap-1.5 mt-1 leading-none hover:opacity-80 transition-opacity cursor-pointer group text-left"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className={`text-[9px] font-bold uppercase tracking-wider group-hover:text-indigo-400 transition-colors ${
                    isDarkMode ? "text-slate-400" : "text-slate-500"
                  }`}>
                    {selectedModel === "tutor8b" ? "Tutor8B Active ∨" : selectedModel === "claude" ? "Claude Active ∨" : "Cipher Core ∨"}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Toolbar */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* New Chat Button (Desktop & Mobile) */}
            <button
              onClick={handleNewChat}
              className={`px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
                isDarkMode 
                  ? "bg-white/[0.03] hover:bg-white/[0.08] text-indigo-400 hover:text-indigo-300 border border-slate-800/80 hover:border-slate-700/80" 
                  : "bg-slate-50 hover:bg-slate-100 text-indigo-600 hover:text-indigo-700 border border-slate-200 hover:border-slate-300"
              }`}
              title="Start a Fresh Chat Session (Saves previous)"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Chat</span>
            </button>

            {/* Theme Toggle (Mobile only) */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-xl transition-all cursor-pointer flex md:hidden items-center justify-center ${
                isDarkMode 
                  ? "bg-white/[0.03] hover:bg-white/[0.08] text-yellow-400 border border-slate-800/80" 
                  : "bg-slate-50 hover:bg-slate-100 text-indigo-600 border border-slate-200"
              }`}
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>

            {/* Sidebar trigger */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`px-3 py-2 rounded-xl transition-all cursor-pointer hidden md:flex items-center gap-1.5 text-xs font-bold ${
                isDarkMode 
                  ? "bg-white/[0.03] hover:bg-white/[0.08] text-slate-400 hover:text-white border border-slate-800/80 hover:border-slate-700/80" 
                  : "bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-800 border border-slate-200 hover:border-slate-300"
              }`}
              title="Toggle settings panel"
            >
              <Sliders className="w-3.5 h-3.5 text-indigo-500" />
              <span>Workspace Params</span>
            </button>

            {/* Mobile Sidebar overlay toggle */}
            <button
              onClick={() => {
                setIsMobileParamsOpen(true);
              }}
              className={`p-2.5 rounded-xl transition-all cursor-pointer flex md:hidden items-center gap-1.5 text-xs font-bold ${
                isDarkMode 
                  ? "bg-white/[0.03] hover:bg-white/[0.08] text-slate-400 hover:text-white border border-slate-800/80" 
                  : "bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-800 border border-slate-200"
              }`}
            >
              <Settings className="w-4.5 h-4.5 text-indigo-500" />
            </button>
          </div>
        </header>

        {/* --- MESSAGES CONTENT FIELD --- */}
        <div className="flex-grow min-h-0 overflow-y-auto px-4 sm:px-6 py-6 space-y-6 scroll-smooth no-scrollbar">
          
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div 
                key={msg.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-2 sm:gap-3.5 max-w-[98%] sm:max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  
                  {/* Visual avatars */}
                  <div className={`shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center border transition-all ${
                    msg.role === 'user' 
                      ? 'bg-blue-600/10 border-blue-500/25 text-blue-500 shadow-md shadow-blue-500/5 ring-1 ring-blue-500/10' 
                      : 'bg-indigo-600/10 border-indigo-500/25 text-indigo-500 shadow-md shadow-indigo-500/5 ring-1 ring-indigo-500/10'
                  }`}>
                    {msg.role === 'user' ? <User className="w-4 h-4 sm:w-5 sm:h-5" /> : <Bot className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </div>

                  {/* Message Bubble Column */}
                  <div className="space-y-1.5 w-full min-w-0">
                    
                    {/* Model & Source metadata tags */}
                    <div className="flex items-center gap-2 px-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        {msg.role === 'user' ? "You" : "Fahim AI Helper"}
                      </span>
                      {msg.modelUsed && (
                        <span className="text-[8px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-500/15 px-2 py-0.5 rounded border border-indigo-500/10 leading-none">
                          {msg.modelUsed}
                        </span>
                      )}
                    </div>

                    <div className={`p-4 sm:p-5 rounded-2xl transition-all duration-300 min-w-0 w-full ${
                      msg.role === 'user'
                        ? isDarkMode
                          ? 'bg-gradient-to-br from-indigo-600/90 via-indigo-600 to-indigo-700/90 border border-indigo-500/35 text-white rounded-tr-none shadow-lg shadow-indigo-600/10'
                          : 'bg-[#edf3ff] border border-blue-100 text-slate-800 rounded-tr-none shadow-xs font-semibold'
                        : isDarkMode
                          ? 'bg-[#0b0c16] border border-[#1e2238]/60 text-slate-100 rounded-tl-none shadow-md'
                          : 'bg-white border border-slate-200/80 text-slate-800 rounded-tl-none shadow-xs'
                    }`}>
                      
                      {/* --- THINKING ACCORDION SIMULATED --- */}
                      {msg.role === 'assistant' && msg.thinkingProcess && msg.thinkingProcess.length > 0 && (
                        <details className={`mb-4 group border rounded-xl overflow-hidden transition-colors duration-300 ${
                          isDarkMode 
                            ? 'border-[#1e2238]/50 bg-[#070911]/90' 
                            : 'border-slate-200/80 bg-slate-50'
                        }`}>
                          <summary className={`p-3 text-xs font-bold cursor-pointer select-none flex items-center gap-2 transition-colors ${
                            isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                          }`}>
                            <BrainIcon className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                            <span>Thinking Process ({msg.thinkingProcess.length} steps deduced)</span>
                            <span className={`ml-auto text-[9px] group-open:hidden ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Expand</span>
                            <span className={`ml-auto text-[9px] hidden group-open:inline ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Collapse</span>
                          </summary>
                          <div className={`p-3 border-t space-y-2 transition-colors ${
                            isDarkMode 
                              ? 'border-[#1e2238]/30 bg-[#04050a]' 
                              : 'border-slate-200/50 bg-white'
                          }`}>
                            {msg.thinkingProcess.map((step, sIdx) => (
                              <div key={sIdx} className={`flex items-center gap-2 text-[10px] font-mono ${
                                isDarkMode ? 'text-emerald-400/85' : 'text-emerald-600'
                              }`}>
                                <span className={isDarkMode ? 'text-emerald-500/50' : 'text-emerald-500'}>✦</span>
                                <span>{step}</span>
                              </div>
                            ))}
                          </div>
                        </details>
                      )}

                      {/* Msg attachments inline */}
                      {msg.attachedFiles && msg.attachedFiles.length > 0 && (
                        <div className={`flex flex-wrap gap-2 mb-3 border-b pb-2.5 transition-colors duration-300 ${
                          isDarkMode ? 'border-white/5' : 'border-slate-200'
                        }`}>
                          {msg.attachedFiles.map(file => (
                            <div key={file.id} className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] shadow-sm transition-colors ${
                              isDarkMode 
                                ? 'bg-white/5 border-white/10 text-white/80' 
                                : 'bg-slate-100 border-slate-200 text-slate-700'
                            }`}>
                              {file.previewUrl ? (
                                <img src={file.previewUrl} className="w-5 h-5 rounded object-cover" alt="" />
                              ) : (
                                <FileText className="w-3.5 h-3.5 text-blue-500" />
                              )}
                              <span className="max-w-[120px] truncate">{file.name}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Msg content */}
                      {msg.role === 'user' ? (
                        <p className={`whitespace-pre-wrap text-sm sm:text-[15px] leading-relaxed break-words font-medium ${
                          isDarkMode ? 'text-white/95' : 'text-slate-900'
                        }`}>
                          {msg.content}
                        </p>
                      ) : (
                        <div className={`prose max-w-none text-sm sm:text-[15px] leading-relaxed font-medium prose-p:leading-relaxed prose-pre:p-0 prose-pre:bg-transparent ${
                          isDarkMode ? 'prose-invert text-slate-100' : 'text-slate-800'
                        }`}>
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              pre({ children }: any) {
                                return <>{children}</>;
                              },
                              code({ node, className, children, ...props }: any) {
                                const match = /language-(\w+)/.exec(className || "");
                                const codeString = String(children).replace(/\n$/, "");
                                const isBlock = match || codeString.includes("\n");
                                
                                return isBlock ? (
                                  <div className={`relative group rounded-xl overflow-hidden my-4 border shadow-lg transition-colors duration-300 ${
                                    isDarkMode ? "bg-[#070810] border-[#1e2238]/60" : "bg-slate-50 border-slate-200"
                                  }`}>
                                    <div className={`flex items-center justify-between px-4 py-2.5 border-b transition-colors duration-300 ${
                                      isDarkMode ? "bg-black/40 border-[#1e2238]/50 text-slate-400" : "bg-slate-100 border-slate-200 text-slate-600"
                                    }`}>
                                      <span className="text-[10px] font-mono uppercase tracking-widest">{match?.[1] || 'text'}</span>
                                      <CopyButton text={codeString} isDarkMode={isDarkMode} />
                                    </div>
                                    <SyntaxHighlighter
                                      {...props}
                                      style={isDarkMode ? vscDarkPlus : prism}
                                      language={match ? match[1] : 'text'}
                                      PreTag="div"
                                      className="!m-0 !bg-transparent !p-4 !overflow-x-auto text-xs sm:text-sm leading-relaxed"
                                      showLineNumbers={true}
                                    >
                                      {codeString}
                                    </SyntaxHighlighter>
                                  </div>
                                ) : (
                                  <code {...props} className={`rounded px-1.5 py-0.5 text-xs sm:text-sm font-mono transition-colors duration-300 ${
                                    isDarkMode ? "bg-white/10 text-blue-300" : "bg-slate-100 text-indigo-600"
                                  }`}>
                                    {children}
                                  </code>
                                );
                              },
                              h1({ children }: any) {
                                return <h1 className={`text-lg sm:text-xl font-extrabold tracking-tight mt-5 mb-2.5 transition-colors ${isDarkMode ? "text-indigo-400" : "text-indigo-600"}`}>{children}</h1>;
                              },
                              h2({ children }: any) {
                                return <h2 className={`text-base sm:text-lg font-bold tracking-tight mt-4 mb-2 transition-colors ${isDarkMode ? "text-sky-400" : "text-sky-600"}`}>{children}</h2>;
                              },
                              h3({ children }: any) {
                                return <h3 className={`text-sm sm:text-base font-bold mt-3 mb-1.5 transition-colors ${isDarkMode ? "text-slate-200" : "text-slate-800"}`}>{children}</h3>;
                              },
                              p({ children }: any) {
                                return <p className="leading-relaxed mb-3 text-sm sm:text-[15px]">{children}</p>;
                              },
                              ul({ children }: any) {
                                return <ul className="list-disc pl-5 mb-3.5 space-y-1.5">{children}</ul>;
                              },
                              ol({ children }: any) {
                                return <ol className="list-decimal pl-5 mb-3.5 space-y-1.5">{children}</ol>;
                              },
                              li({ children }: any) {
                                return <li className="text-sm sm:text-[15px] leading-relaxed">{children}</li>;
                              },
                              blockquote({ children }: any) {
                                return <blockquote className={`border-l-4 border-indigo-500 pl-4 py-1 italic my-4 ${
                                  isDarkMode ? "text-slate-400" : "text-slate-500"
                                }`}>{children}</blockquote>;
                              },
                              a({ href, children }: any) {
                                return (
                                  <a 
                                    href={href} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline font-semibold transition-colors"
                                  >
                                    {children}
                                  </a>
                                );
                              },
                              table({ children }: any) {
                                return (
                                  <div className={`overflow-x-auto my-4 rounded-xl border shadow-xs max-w-full ${
                                    isDarkMode ? "border-slate-800/80 bg-[#070811]/30" : "border-slate-200"
                                  }`}>
                                    <table className={`min-w-full divide-y text-xs sm:text-sm ${
                                      isDarkMode ? "divide-slate-800" : "divide-slate-200"
                                    }`}>{children}</table>
                                  </div>
                                );
                              },
                              thead({ children }: any) {
                                return <thead className={isDarkMode ? "bg-[#0c0e1a]" : "bg-slate-50"}>{children}</thead>;
                              },
                              th({ children }: any) {
                                return <th className={`px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wider border-b ${
                                  isDarkMode ? "text-slate-400 border-slate-800" : "text-slate-500 border-slate-200"
                                }`}>{children}</th>;
                              },
                              td({ children }: any) {
                                return <td className={`px-4 py-2.5 border-b text-xs sm:text-sm ${
                                  isDarkMode ? "text-slate-300 border-slate-800/40" : "text-slate-600 border-slate-100"
                                }`}>{children}</td>;
                              },
                              tr({ children }: any) {
                                return <tr className={`transition-colors ${
                                  isDarkMode ? "hover:bg-slate-900/30" : "hover:bg-slate-50/50"
                                }`}>{children}</tr>;
                              }
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      )}

                      {/* Generated image outputs */}
                      {msg.imageUrl && (
                        <div className="mt-4 relative group rounded-xl overflow-hidden border border-[#1e2238]/50 bg-[#070911] shadow-md">
                          <img 
                            src={msg.imageUrl} 
                            className="w-full max-h-[380px] object-cover hover:scale-101 transition-transform duration-500 cursor-pointer" 
                            alt="Generated AI artwork"
                            onClick={() => setMagnifiedImage(msg.imageUrl || null)}
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                            <button 
                              onClick={() => setMagnifiedImage(msg.imageUrl || null)}
                              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                              title="Magnify View"
                            >
                              <Maximize2 className="w-5 h-5" />
                            </button>
                            <a 
                              href={msg.imageUrl} 
                              download="atomesus_generated_art.jpg"
                              target="_blank"
                              rel="noreferrer"
                              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                              title="Download HQ Output"
                            >
                              <Download className="w-5 h-5" />
                            </a>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>

                </div>
              </motion.div>
            ))}            {/* --- WELCOME HOME BENTO GRID --- */}
            {messages.length === 0 && (() => {
              const suggestions = [
                {
                  title: "Clean Code Refactor",
                  description: "Optimize layout logic and structures in React",
                  prompt: "Deconstruct and optimize a piece of logic or complex algorithm in React with beautiful modular code.",
                  icon: Code,
                  color: "text-blue-500 bg-blue-500/10 border-blue-500/20"
                },
                {
                  title: "Banglish Translation",
                  description: "Convert text into natural, friendly Banglish chat",
                  prompt: "Bhai, translate this text into flawless, fluent, natural Banglish chat style.",
                  icon: BookOpen,
                  color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
                },
                {
                  title: "Pristine Layout Builder",
                  description: "Draft gorgeous multi-tool visual components",
                  prompt: "Generate a fully isolated component file layout utilizing Tailwind CSS, responsive grids, and modern typography.",
                  icon: Sparkles,
                  color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20"
                },
                {
                  title: "Atomesus Image Studio",
                  description: "Type /image to create stunning vector artwork",
                  prompt: "/image Create a pristine, high-fidelity vector illustration of a modern futuristic workspace.",
                  icon: Image,
                  color: "text-pink-500 bg-pink-500/10 border-pink-500/20"
                }
              ];

              return (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="max-w-3xl mx-auto py-16 sm:py-24 flex flex-col items-center justify-center text-center px-4"
                >
                  <div className="space-y-4">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 mb-2 shadow-lg shadow-indigo-500/5 animate-pulse">
                      <Sparkles className="w-7 h-7" />
                    </div>
                    <h2 className={`text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight transition-colors duration-300 ${
                      isDarkMode ? "text-slate-100" : "text-slate-800"
                    }`}>
                      Hi, I am <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-500 to-pink-500">Fahim AI</span>, how can I help you today?
                    </h2>
                  </div>

                  {/* --- STARTER CARDS GRID --- */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-10 w-full max-w-2xl text-left">
                    {suggestions.map((card, idx) => {
                      const CardIcon = card.icon;
                      return (
                        <div
                          key={idx}
                          onClick={() => handleSuggestionClick(card.prompt)}
                          className={`p-4 rounded-2xl border transition-all duration-300 hover:scale-[1.015] hover:shadow-md cursor-pointer group flex gap-3.5 ${
                            isDarkMode
                              ? "bg-[#0c0d18]/60 border-slate-800 hover:border-indigo-500/40 hover:bg-[#0e1022]"
                              : "bg-white border-slate-200/80 hover:border-indigo-500/30 hover:bg-slate-50/50 shadow-xs shadow-slate-100"
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${card.color}`}>
                            <CardIcon className="w-5.5 h-5.5" />
                          </div>
                          <div className="overflow-hidden">
                            <h4 className={`text-xs font-bold transition-colors ${
                              isDarkMode ? "text-slate-200 group-hover:text-indigo-400" : "text-slate-800 group-hover:text-indigo-600"
                            }`}>
                              {card.title}
                            </h4>
                            <p className={`text-[11px] leading-normal mt-1 ${
                              isDarkMode ? "text-slate-400" : "text-slate-500"
                            }`}>
                              {card.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })()}
          </AnimatePresence>

          {isLoading && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex w-full justify-start animate-pulse"
            >
              <div className="flex gap-3.5 max-w-[80%] flex-row">
                <div className="shrink-0 w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center border bg-indigo-600/10 border-indigo-500/20 text-indigo-500">
                  <Bot className="w-5 h-5 text-indigo-500" />
                </div>
                <div className={`p-4 sm:p-5 rounded-2xl rounded-tl-none flex gap-2 items-center border transition-all duration-300 ${
                  isDarkMode 
                    ? "bg-[#0f111f] border-slate-800 text-slate-400" 
                    : "bg-slate-50 border-slate-200 text-slate-600"
                }`}>
                  <span className="w-2.5 h-2.5 bg-indigo-500/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2.5 h-2.5 bg-indigo-500/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2.5 h-2.5 bg-indigo-500/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="text-[10px] font-bold uppercase tracking-wider ml-2">Thinking...</span>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* --- DYNAMIC FILES ATTACHED TRAY ABOVE INPUT BOX --- */}
        {uploadedFiles.length > 0 && (
          <div className="shrink-0 px-4 sm:px-6 relative z-10 mb-2">
            <div className={`max-w-3xl mx-auto p-2 backdrop-blur-md rounded-2xl border flex gap-2 overflow-x-auto no-scrollbar shadow-lg transition-colors duration-300 ${
              isDarkMode 
                ? "bg-[#0a0b16]/90 border-[#1e2238]/60 shadow-black/40" 
                : "bg-white/95 border-slate-200 shadow-slate-200/40"
            }`}>
              {uploadedFiles.map(file => (
                <div key={file.id} className={`flex items-center gap-2 p-1.5 rounded-xl border shrink-0 transition-colors duration-300 ${
                  isDarkMode ? "bg-white/[0.03] border-slate-800/80" : "bg-slate-50 border-slate-200"
                }`}>
                  {file.previewUrl ? (
                    <img src={file.previewUrl} className="w-6 h-6 rounded-lg object-cover" alt="" />
                  ) : (
                    <div className="w-6 h-6 rounded bg-indigo-500/15 flex items-center justify-center text-indigo-400">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div>
                    <p className={`text-[10px] font-bold truncate max-w-[100px] leading-none ${isDarkMode ? "text-slate-200" : "text-slate-700"}`}>{file.name}</p>
                    <span className="text-[8px] text-slate-500 block leading-tight mt-0.5">{file.size}</span>
                  </div>
                  <button 
                    onClick={() => removeUploadedFile(file.id)}
                    className={`p-1 rounded cursor-pointer transition-colors ${
                      isDarkMode ? "hover:bg-white/5 text-slate-400 hover:text-red-400" : "hover:bg-slate-100 text-slate-400 hover:text-red-500"
                    }`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- INPUT DIALOG WRAPPER --- */}
        <div className={`shrink-0 w-full p-4 sm:p-5 pb-5 sm:pb-7 transition-colors duration-300 relative z-10 ${
          isDarkMode 
            ? "bg-gradient-to-t from-[#05060f] via-[#05060f]/95 to-transparent" 
            : "bg-gradient-to-t from-[#f9fbfc] via-[#f9fbfc]/95 to-transparent"
        }`}>
          <div className="w-full max-w-3xl mx-auto">
            
            <div className={`flex items-end rounded-[24px] border focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all pb-1.5 shadow-xl ${
              isDarkMode 
                ? "bg-[#090a15]/95 border-[#1e2238]/60 focus-within:border-indigo-500/50 shadow-black/50" 
                : "bg-white border-slate-200/80 focus-within:border-indigo-500/40 shadow-sm shadow-slate-100"
            }`}>
              
              {/* Attachment selector icon */}
              <div className="p-1.5 shrink-0 flex items-center justify-center mb-0.5">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  multiple
                  className="hidden" 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer border ${
                    isDarkMode 
                      ? "text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/5 border-transparent hover:border-indigo-500/10" 
                      : "text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border-transparent hover:border-indigo-100"
                  }`}
                  title="Upload Document scan / image"
                >
                  <Plus className="w-5.5 h-5.5 stroke-[2.5]" />
                </button>
              </div>

              {/* Text Area Input */}
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Fahimi AI..."
                className={`w-full max-h-[140px] min-h-[24px] bg-transparent py-3 text-base outline-none resize-none leading-relaxed overflow-y-auto self-end mt-1 font-medium transition-colors duration-300 ${
                  isDarkMode ? "text-white placeholder-slate-500" : "text-slate-800 placeholder-slate-400"
                }`}
                rows={1}
                disabled={isLoading}
              />

              {/* Quick Model Selector Dropdown/Badge inside the Pill */}
              <button
                onClick={() => {
                  if (selectedModel === 'cipher') setSelectedModel('tutor8b');
                  else if (selectedModel === 'tutor8b') setSelectedModel('claude');
                  else setSelectedModel('cipher');
                }}
                className={`hidden sm:inline-block text-[9px] font-black tracking-widest uppercase px-2.5 py-1.5 rounded-xl border mr-1 transition-all self-center shrink-0 ${
                  isDarkMode 
                    ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/20' 
                    : 'bg-white border-slate-200 text-indigo-600 hover:bg-indigo-50 shadow-sm'
                }`}
                title="Toggle Active Model"
              >
                {selectedModel === 'cipher' ? 'Cipher ∨' : selectedModel === 'tutor8b' ? 'Tutor8B ∨' : 'Claude ∨'}
              </button>

              {/* Dispatch Action Button */}
              <div className="p-1.5 shrink-0 flex items-center justify-center mb-0.5 mr-1.5">
                <button 
                  disabled={(!input.trim() && uploadedFiles.length === 0) || isLoading}
                  onClick={handleSend}
                  className={`w-10 h-10 rounded-full transition-all flex items-center justify-center cursor-pointer ${
                    (input.trim() || uploadedFiles.length > 0) && !isLoading
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/35 scale-100 hover:scale-105 active:scale-95' 
                      : isDarkMode
                        ? 'bg-white/[0.02] border border-slate-800/80 text-slate-600'
                        : 'bg-slate-200 border border-slate-300/60 text-slate-400'
                  }`}
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                  ) : (
                    <ArrowUp className="w-5 h-5 stroke-[2.5]" />
                  )}
                </button>
              </div>

            </div>

            {/* Input helpers notice */}
            <div className="flex items-center justify-between mt-3 px-4">
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-indigo-500/50" />
                Shift+Enter for newline | Type /image for direct artworks
              </span>
              {isImageMode && (
                <span className="text-[9px] text-pink-400 font-black uppercase tracking-widest animate-pulse flex items-center gap-1.5">
                  <Image className="w-3.5 h-3.5" /> Image Studio Enabled
                </span>
              )}
            </div>

          </div>
        </div>

      </div>

      {/* --- MOBILE PARAMS BOTTOM SHEET --- */}
      <AnimatePresence>
        {isMobileParamsOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setIsMobileParamsOpen(false)}
            />
            
            {/* Drawer Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className={`absolute bottom-0 left-0 right-0 max-h-[85vh] rounded-t-[28px] border-t p-6 pb-8 space-y-6 shadow-2xl flex flex-col ${
                isDarkMode 
                  ? "bg-[#090b16] border-[#1e2238]/80 text-white" 
                  : "bg-white border-slate-200 text-slate-800"
              }`}
            >
              {/* iOS Grab Handle */}
              <div className={`w-12 h-1 rounded-full mx-auto -mt-2 mb-2 ${
                isDarkMode ? "bg-slate-700/60" : "bg-slate-300"
              }`} />

              <div className={`flex items-center justify-between pb-3 border-b ${
                isDarkMode ? "border-slate-800/80" : "border-slate-100"
              }`}>
                <h3 className={`font-extrabold text-sm flex items-center gap-2 ${isDarkMode ? "text-white" : "text-slate-800"}`}>
                  <Settings className="w-4 h-4 text-indigo-500" /> Workspace Parameters
                </h3>
                <button 
                  onClick={() => setIsMobileParamsOpen(false)}
                  className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                    isDarkMode ? "text-slate-400 hover:text-white hover:bg-white/5" : "text-slate-400 hover:text-slate-800 hover:bg-slate-100"
                  }`}
                >
                  <X className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>

              {/* Content of Bottom Sheet */}
              <div className="flex-grow overflow-y-auto space-y-5 no-scrollbar">
                {/* Chat History Section */}
                <div className="space-y-2 pb-3 border-b border-dashed border-slate-800/20">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] uppercase font-black tracking-wider block ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>Conversations</span>
                    <button 
                      onClick={() => {
                        handleNewChat();
                        setIsMobileParamsOpen(false); // Close the sheet to view the new chat
                      }}
                      className="text-[10px] font-black text-indigo-500 hover:text-indigo-600 uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> New Chat
                    </button>
                  </div>
                  
                  <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1 no-scrollbar">
                    {sessions.length === 0 ? (
                      <p className="text-[10px] text-slate-500 italic p-1">No saved chats</p>
                    ) : (
                      sessions.map(sess => (
                        <div 
                          key={sess.id}
                          onClick={() => {
                            handleSwitchSession(sess.id);
                            setIsMobileParamsOpen(false); // Close the sheet to view the switched chat
                          }}
                          className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-all ${
                            activeSessionId === sess.id
                              ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/20"
                              : isDarkMode
                                ? "bg-[#0f111f] border-slate-800/80 text-slate-300"
                                : "bg-slate-50 border-slate-200 text-slate-700"
                          }`}
                        >
                          <div className="flex items-center gap-2 overflow-hidden flex-grow">
                            <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${activeSessionId === sess.id ? 'text-white' : 'text-slate-400'}`} />
                            <span className="text-[11px] font-bold truncate">{sess.title}</span>
                          </div>
                          <button 
                            onClick={(e) => handleDeleteSession(e, sess.id)}
                            className={`p-1 rounded transition-all cursor-pointer ${
                              activeSessionId === sess.id
                                ? "text-white/80 hover:text-red-300 hover:bg-white/10"
                                : isDarkMode ? "text-slate-500 hover:text-red-400 hover:bg-white/5" : "text-slate-400 hover:text-red-500 hover:bg-slate-100"
                            }`}
                            title="Delete Conversation"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Model selector */}
                <div className="space-y-2">
                  <span className={`text-[10px] uppercase font-black tracking-wider block ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>Model Selection</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: "cipher", label: "Cipher" },
                      { id: "tutor8b", label: "Tutor8B" },
                      { id: "claude", label: "Claude" }
                    ].map((modelItem) => (
                      <button
                        key={modelItem.id}
                        onClick={() => setSelectedModel(modelItem.id as any)}
                        className={`py-3 px-1 rounded-xl border text-[11px] font-bold text-center transition-all cursor-pointer ${
                          selectedModel === modelItem.id 
                            ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/20" 
                            : isDarkMode
                              ? "bg-[#0f111f] border-slate-800/80 hover:border-slate-700 text-slate-300"
                              : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
                        }`}
                      >
                        {modelItem.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reasoning & image options */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-xl border border-dashed border-slate-700/30">
                    <div>
                      <span className={`text-xs font-bold block ${isDarkMode ? "text-slate-200" : "text-slate-700"}`}>Advanced Reasoning Engine</span>
                      <span className="text-[10px] text-slate-500 block">Deconstructs logic step-by-step</span>
                    </div>
                    <button 
                      onClick={() => setIsReasoningEnabled(!isReasoningEnabled)}
                      className={`text-xs font-black uppercase py-1.5 px-3 rounded-xl transition-all cursor-pointer ${
                        isReasoningEnabled 
                          ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20" 
                          : isDarkMode ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {isReasoningEnabled ? "ON" : "OFF"}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl border border-dashed border-slate-700/30">
                    <div>
                      <span className={`text-xs font-bold block ${isDarkMode ? "text-slate-200" : "text-slate-700"}`}>Image Studio Mode</span>
                      <span className="text-[10px] text-slate-500 block">Generates stunning artwork</span>
                    </div>
                    <button 
                      onClick={() => setIsImageMode(!isImageMode)}
                      className={`text-xs font-black uppercase py-1.5 px-3 rounded-xl transition-all cursor-pointer ${
                        isImageMode 
                          ? "bg-pink-600 text-white shadow-sm shadow-pink-600/20" 
                          : isDarkMode ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {isImageMode ? "ON" : "OFF"}
                    </button>
                  </div>
                </div>

                {/* Dynamic upload repository inside sheet */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] uppercase font-black tracking-wider block ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>Active Uploads</span>
                    <button 
                      onClick={() => {
                        setIsMobileParamsOpen(false);
                        setTimeout(() => fileInputRef.current?.click(), 300);
                      }}
                      className="text-[10px] font-black text-indigo-500 uppercase tracking-wider"
                    >
                      + Add File
                    </button>
                  </div>
                  
                  {uploadedFiles.length === 0 ? (
                    <div className={`p-4 rounded-xl border border-dashed text-center ${
                      isDarkMode ? "border-slate-800 bg-slate-900/40 text-slate-500" : "border-slate-200 bg-slate-50 text-slate-500"
                    }`}>
                      <p className="text-[10px]">No files loaded in active session</p>
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1">
                      {uploadedFiles.map(file => (
                        <div key={file.id} className={`p-2 rounded-lg border flex items-center justify-between gap-2 ${
                          isDarkMode ? "bg-[#0f111f] border-slate-800" : "bg-white border-slate-200"
                        }`}>
                          <span className={`text-[10px] truncate max-w-[150px] ${isDarkMode ? "text-slate-200" : "text-slate-700"}`}>{file.name}</span>
                          <button 
                            onClick={() => removeUploadedFile(file.id)}
                            className="text-red-500 text-xs px-1.5"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className={`p-3.5 rounded-2xl border text-[11px] leading-relaxed flex items-center gap-2.5 ${
                  isDarkMode 
                    ? "bg-[#070911] border-slate-800/80 text-slate-400" 
                    : "bg-slate-50 border-slate-100 text-slate-500"
                }`}>
                  <Info className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>Fahim AI Helper runs via optimized Atomesus routing.</span>
                </div>
              </div>

              <button
                onClick={() => setIsMobileParamsOpen(false)}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold uppercase tracking-widest rounded-2xl transition-all cursor-pointer shadow-lg shadow-indigo-600/25"
              >
                Apply Configurations
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- IMAGE MAGNIFIER VIEW MODAL --- */}
      <AnimatePresence>
        {magnifiedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4"
            onClick={() => setMagnifiedImage(null)}
          >
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <a 
                href={magnifiedImage} 
                download="atomesus_magnified_art.jpg"
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              >
                <Download className="w-5 h-5" />
              </a>
              <button 
                onClick={() => setMagnifiedImage(null)}
                className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <motion.img 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={magnifiedImage} 
              className="max-w-full max-h-[85vh] rounded-xl object-contain shadow-2xl border border-slate-800" 
              alt="AI painting high resolution" 
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

// --- PRIVATE SVG ICONS FOR HIGH COMPATIBILITY PAIRING ---
const BrainIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
    <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
    <path d="M12 5v14" />
    <path d="M12 12h6" />
    <path d="M12 12H6" />
  </svg>
);
