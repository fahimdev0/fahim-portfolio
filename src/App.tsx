/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Tv, Shield, Zap, Globe, Github, Facebook, Instagram, ExternalLink, ChevronLeft, LayoutGrid, Terminal, Cpu, Mail, Copy, Check, X, Users, Send, Pin, Youtube, MessageSquare, Lock, User, Eye, EyeOff, Sparkles, LogIn, UserPlus, Settings, Sliders, KeyRound, LogOut, CheckCircle2, ShieldCheck, Database, Briefcase, BookOpen, Trophy, Languages, FileText } from "lucide-react";
import { useState, useMemo, useEffect, FormEvent, Suspense, lazy } from "react";
import { View, Tool, ToolCategory } from "./types";
import { LoadingScreen } from "./components/LoadingScreen";
import { ErrorBoundary } from "./components/core/ErrorBoundary";
import { TOOL_REGISTRY, TOOL_CATEGORIES } from "./core/toolsRegistry";

// Route-based dynamic lazy loading & Code splitting
const IPTVApp = lazy(() => import("./components/IPTVApp").then(m => ({ default: m.IPTVApp })));
const FreelancingApp = lazy(() => import("./components/FreelancingApp").then(m => ({ default: m.FreelancingApp })));
const FifaApp = lazy(() => import("./components/FifaApp").then(m => ({ default: m.FifaApp })));
const AIHelperApp = lazy(() => import("./components/AIHelperApp").then(m => ({ default: m.AIHelperApp })));
const TranslatorApp = lazy(() => import("./components/TranslatorApp").then(m => ({ default: m.TranslatorApp })));
const APITesterApp = lazy(() => import("./components/APITesterApp").then(m => ({ default: m.APITesterApp })));
const HackingApp = lazy(() => import("./components/HackingApp").then(m => ({ default: m.HackingApp })));
const DocumentClonerApp = lazy(() => import("./components/DocumentClonerApp").then(m => ({ default: m.DocumentClonerApp })));

// Firestore and Firebase Authentication integrations
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "firebase/auth";
import {
  setDoc,
  doc,
  serverTimestamp,
  collection,
  onSnapshot,
  query,
  orderBy,
  limit
} from "firebase/firestore";
import { auth, googleProvider, db, handleFirestoreError, OperationType } from "./lib/firebase";
import { SpiderWeb } from "./components/SpiderWeb";

const AVATAR_URL = "https://i.postimg.cc/KjWv0jtW/Chat-GPT-Image-Jun-16-2026-05-25-46-PM.png";

const TOOLS: Tool[] = TOOL_REGISTRY as unknown as Tool[];

const CATEGORIES: ToolCategory[] = ["All", ...TOOL_CATEGORIES] as ToolCategory[];

const BackgroundGlows = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Top Black Area is natural body bg */}
      
      {/* Large Blue Glow Center */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.4, 0.3],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[140px]"
      />

      {/* Purple Lighting */}
      <motion.div
        animate={{
          x: [-20, 20, -20],
          y: [-20, 20, -20],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-[20%] right-[10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]"
      />

      {/* Pink Lighting */}
      <motion.div
        animate={{
          x: [20, -20, 20],
          y: [20, -20, 20],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-[40%] left-[5%] w-[450px] h-[450px] bg-pink-600/10 rounded-full blur-[110px]"
      />

      {/* Soft Orange Glow Bottom */}
      <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-full h-[400px] bg-orange-600/5 rounded-full blur-[130px]" />
    </div>
  );
};

const Header = ({ currentView, setView, onContactClick, onCommunityClick }: { currentView: View; setView: (v: View) => void; onContactClick: () => void; onCommunityClick: () => void }) => {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed top-0 left-0 w-full z-50 px-4 py-3 sm:px-8 sm:py-5 md:px-12 md:py-8 flex justify-between items-center bg-black/60 backdrop-blur-xl border-b border-white/[0.04]"
    >
      <div 
        onClick={() => setView("hero")}
        className="flex items-center gap-2.5 sm:gap-3 group cursor-pointer select-none"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-md group-hover:bg-blue-500/40 transition-all" />
          <img
            src={AVATAR_URL}
            alt="Fahim's Avatar"
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-white/10 relative z-10 animate-float"
          />
        </div>
        <span className="font-display font-bold text-xs sm:text-sm text-white/85 tracking-tight group-hover:text-blue-400 transition-colors">Fahim Montasir Siam</span>
      </div>
      
      <div className="flex items-center gap-1.5 sm:gap-3">
        {currentView === "tools" && (
          <button 
            onClick={() => setView("hero")}
            className="flex items-center gap-1 text-white/50 hover:text-white transition-colors text-[10px] sm:text-xs font-bold bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 select-none"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Back<span className="hidden sm:inline"> to Home</span></span>
          </button>
        )}
        <button 
          onClick={onCommunityClick}
          className="px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-[#0084ff] to-[#007aff] hover:from-[#007aff] hover:to-[#006bdd] text-white shadow-[0_3px_10px_rgba(0,122,255,0.35)] hover:shadow-[0_5px_15px_rgba(0,122,255,0.5)] transition-all text-[10px] sm:text-xs font-black select-none active:scale-95 duration-100 flex items-center gap-1 sm:gap-1.5 border border-[#007aff]/20"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse hidden min-[360px]:inline-block" />
          <span>Join<span className="hidden sm:inline"> Our</span> Community</span>
        </button>
        {currentView !== "tools" && (
          <button 
            onClick={onContactClick}
            className="px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all text-[10px] sm:text-xs font-bold select-none text-white/90 active:scale-95 duration-100"
          >
            Get In Touch
          </button>
        )}
      </div>
    </motion.header>
  );
};

const getToolAppStoreMeta = (id: string) => {
  switch (id) {
    case "fahim-doc-cloner":
      return {
        subtitle: "AI-Powered A4 Template Cloner & Editor",
        genre: "AI & Documents",
        gradient: "bg-gradient-to-tr from-[#020617] via-[#2563eb] to-[#38bdf8] border border-blue-500/35 shadow-[0_0_15px_rgba(59,130,246,0.25)]"
      };
    case "fahim-api-tester":
      return {
        subtitle: "Professional API Playground & Key Validator",
        genre: "Developer Tools",
        gradient: "bg-gradient-to-tr from-[#140b02] via-[#ea580c] to-[#fb923c] border border-orange-500/35 shadow-[0_0_15px_rgba(234,88,12,0.25)]"
      };
    case "fahim-translator":
      return {
        subtitle: "Smart Multi-Lingual Translator",
        genre: "AI & Languages",
        gradient: "bg-gradient-to-tr from-[#111124] via-[#6366f1] to-[#ec4899] border border-pink-500/35 shadow-[0_0_15px_rgba(236,72,153,0.25)]"
      };
    case "fahim-ai-helper":
      return {
        subtitle: "DeepSeek Powered AI Assistant Hub",
        genre: "AI & Automation",
        gradient: "bg-gradient-to-tr from-[#020813] via-[#0284c7] to-[#22d3ee] border border-cyan-500/35 shadow-[0_0_15px_rgba(34,211,238,0.3)]"
      };
    case "ethical-hacking":
      return {
        subtitle: "Multi-Category Security Testing Suite",
        genre: "Security Operations",
        gradient: "bg-gradient-to-tr from-[#030101] via-[#1a080a] to-[#2e0509] border border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.35)]"
      };
    case "fifa-2026":
      return {
        subtitle: "FIFA World Cup 2026™ Match Center",
        genre: "Sports & Live Stream",
        gradient: "bg-gradient-to-tr from-[#7c2d12] via-[#ea580c] to-[#facc15] border border-amber-500/25 shadow-[0_0_15px_rgba(234,88,12,0.2)]"
      };
    case "fahim-ip-tv":
      return {
        subtitle: "Live Sports & Global TV Client",
        genre: "Streaming & TV",
        gradient: "bg-gradient-to-tr from-[#3a1c71] via-[#d76d77] to-[#ffaf7b]"
      };
    case "start-freelancing":
      return {
        subtitle: "Beginner Freelancer Roadmap & Bidding Hub",
        genre: "Business & Career",
        gradient: "bg-gradient-to-tr from-[#052e16] via-[#064e3b] to-[#0f172a] border border-[#a3e635]/15"
      };
    case "cyber-sentinel":
      return {
        subtitle: "Active Network Port Auditor",
        genre: "Security & Audits",
        gradient: "bg-gradient-to-tr from-[#000428] to-[#004e92]"
      };
    case "helix-core":
      return {
        subtitle: "Developer minifiers & hash keys",
        genre: "Developer Utilities",
        gradient: "bg-gradient-to-tr from-[#11998e] to-[#38ef7d]"
      };
    case "vector-speed":
      return {
        subtitle: "Real-time stream & network test",
        genre: "Utilities & Diagnostics",
        gradient: "bg-gradient-to-tr from-[#f12711] to-[#f5af19]"
      };
    case "osint-tracker":
      return {
        subtitle: "Open Source Intelligence Tool",
        genre: "OSINT & Intelligence",
        gradient: "bg-gradient-to-tr from-[#020617] via-[#0f172a] to-[#1e1b4b] border border-sky-500/10"
      };
    case "ai-copilot":
      return {
        subtitle: "AI Gemini Workspace Sandbox",
        genre: "AI & Automation",
        gradient: "bg-gradient-to-tr from-[#1e1b4b] via-[#3b0764] to-[#4c0519] border border-pink-500/10"
      };
    case "cron-automator":
      return {
        subtitle: "Dynamic Task Automator Engine",
        genre: "Automation & Scripts",
        gradient: "bg-gradient-to-tr from-[#1c1917] via-[#292524] to-[#44403c] border border-stone-500/10"
      };
    default:
      return {
        subtitle: "Useful tool & resource",
        genre: "Utility",
        gradient: "bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-800"
      };
  }
};

const AppStoreIcon = ({ id, icon: Icon }: { id: string; icon: any }) => {
  const meta = getToolAppStoreMeta(id);
  const [fifaSrc, setFifaSrc] = useState("https://i.postimg.cc/cKbCq1gV/image.png");

  return (
    <div className={`relative w-12 h-12 sm:w-[54px] sm:h-[54px] rounded-[22%] ${meta.gradient} flex items-center justify-center shrink-0 shadow-[0_4px_10px_rgba(0,0,0,0.35)] overflow-hidden border border-white/10 select-none`}>
      {/* 3D Gloss reflection curve matching Apple design */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/15 to-transparent pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-[45%] bg-white/[0.08] rounded-b-[40%] pointer-events-none" />
      
      {/* Specular lighting spots */}
      <div className="absolute -bottom-4 -left-4 w-7 h-7 rounded-full bg-white/10 blur-md pointer-events-none" />
      <div className="absolute -top-4 -right-4 w-7 h-7 rounded-full bg-white/10 blur-md pointer-events-none" />

      {id === "fifa-2026" ? (
        // Beautiful actual FIFA World Cup 2026 Logo loaded with fallback security
        <div className="relative flex items-center justify-center w-full h-full z-10 select-none p-1.5">
          <img
            src={fifaSrc}
            alt="FIFA 2026"
            className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
            referrerPolicy="no-referrer"
            onError={() => {
              if (fifaSrc === "https://i.postimg.cc/cKbCq1gV/image.png") {
                setFifaSrc("https://i.postimg.cc/cKbCq1gV/logo.png");
              } else if (fifaSrc === "https://i.postimg.cc/cKbCq1gV/logo.png") {
                setFifaSrc("https://i.postimg.cc/cKbCq1gV/image.jpg");
              } else if (fifaSrc === "https://i.postimg.cc/cKbCq1gV/image.jpg") {
                setFifaSrc("https://upload.wikimedia.org/wikipedia/commons/c/cf/2026_FIFA_World_Cup_logo.svg");
              } else if (fifaSrc === "https://upload.wikimedia.org/wikipedia/commons/c/cf/2026_FIFA_World_Cup_logo.svg") {
                setFifaSrc("https://i.ibb.co/xL3nJbB/fifa-icon.png");
              }
            }}
          />
        </div>
      ) : id === "fahim-ip-tv" ? (
        // Custom IPTV client logo with crisp metallic television screen and check logo representation
        <div className="relative flex items-center justify-center w-full h-full z-10">
          <svg className="w-6 sm:w-6.5 h-6 sm:h-6.5 text-white filter drop-shadow-[0_2px_3px_rgba(0,0,0,0.35)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="15" rx="3" />
            <path d="M17 2l-5 5-5-5" strokeWidth="2.2" />
            <path d="M9 14.5l2 2 4-4" strokeWidth="2.8" stroke="white" />
          </svg>
        </div>
      ) : id === "start-freelancing" ? (
        // Custom Freelancing logo: custom "F" in bright lime green ("sobuj tiya" color)
        <div className="relative flex items-center justify-center w-full h-full z-10 select-none">
          <span 
            className="font-display font-black text-2xl sm:text-3xl text-[#a3e635] tracking-tighter filter drop-shadow-[0_2px_6px_rgba(163,230,53,0.5)]"
          >
            F
          </span>
        </div>
      ) : id === "fahim-ai-helper" ? (
        // Futuristic Glowing AI Orbits
        <div className="relative flex items-center justify-center w-full h-full z-10">
          <div className="absolute w-5.5 h-5.5 rounded-full border border-cyan-400/35 animate-pulse" />
          <svg className="w-5.5 h-5.5 text-cyan-300 filter drop-shadow-[0_0_8px_rgba(34,211,238,0.85)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" fill="cyan" fillOpacity="0.25" />
            <circle cx="12" cy="12" r="2" fill="white" />
          </svg>
        </div>
      ) : id === "fahim-translator" ? (
        // Glassmorphism Overlapping Dual translation Squares (EN-বা)
        <div className="relative flex items-center justify-center w-full h-full z-10">
          <div className="absolute w-[24px] h-[24px] rounded-lg bg-pink-500/25 border border-pink-400/40 -translate-x-[5px] -translate-y-[4px] flex items-center justify-center shadow-lg select-none">
            <span className="text-[10.5px] font-sans font-extrabold text-white">A</span>
          </div>
          <div className="absolute w-[24px] h-[24px] rounded-lg bg-indigo-500/45 border border-indigo-400/50 translate-x-[6px] translate-y-[5px] flex items-center justify-center shadow-lg select-none">
            <span className="text-[10px] font-sans font-black text-indigo-100">বা</span>
          </div>
        </div>
      ) : id === "fahim-api-tester" ? (
        // Stylized Technical Developer Console
        <div className="relative flex items-center justify-center w-full h-full z-10">
          <div className="w-[38px] h-[35px] rounded-[7px] bg-[#0c0602]/90 border border-orange-500/50 flex flex-col justify-center items-center gap-[2.5px] shadow-inner">
            <div className="flex gap-[3px] self-start ml-1.5">
              <span className="w-1 h-1 rounded-full bg-red-500/80" />
              <span className="w-1 h-1 rounded-full bg-amber-500/80" />
              <span className="w-1 h-1 rounded-full bg-emerald-500/80" />
            </div>
            <div className="text-[10.5px] font-mono text-orange-400 font-extrabold leading-none select-none">&gt;_</div>
          </div>
        </div>
      ) : id === "fahim-doc-cloner" ? (
        // Spectacular 3D Glimmering Document Sheet + Magical Spark
        <div className="relative flex items-center justify-center w-full h-full z-10 select-none">
          <div className="w-[28px] h-[36px] bg-slate-50 rounded-[3px] border-t-[8px] border-r-[8px] border-blue-600 relative shadow-[0_3px_8px_rgba(0,0,0,0.4)] flex flex-col justify-end p-1">
            {/* Fold Corner Effect */}
            <div className="absolute top-0 right-0 w-[8px] h-[8px] bg-sky-100 rounded-bl-[1px]" />
            <div className="flex flex-col gap-1 w-full mb-0.5">
              <div className="h-[2px] bg-slate-300 w-4/5 rounded-full" />
              <div className="h-[2px] bg-slate-300 w-[90%] rounded-full" />
              <div className="h-[2px] bg-blue-400 w-3/5 rounded-full" />
            </div>
          </div>
          <svg className="absolute top-0 -right-1.5 w-4.5 h-4.5 text-amber-300 filter drop-shadow-[0_0_5px_rgba(251,191,36,0.95)] animate-pulse" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4-3.9-3.8 5.4-.8L12 2z" />
          </svg>
        </div>
      ) : id === "ethical-hacking" ? (
        // Military Secure Red Radar Target Shield - Ultra High Contrast
        <div className="relative flex items-center justify-center w-full h-full z-10">
          <div className="absolute w-7 h-7 rounded-full border border-red-500/35 animate-ping pointer-events-none" style={{ animationDuration: '3s' }} />
          <div className="absolute w-6 h-6 rounded-full border border-red-500/25 pointer-events-none" />
          <svg className="w-5.5 h-5.5 text-white filter drop-shadow-[0_0_6px_rgba(239,68,68,0.7)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.3">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="white" />
            <path d="M12 8v8M8 12h8" strokeWidth="1.6" stroke="#f43f5e" opacity="0.9" />
          </svg>
        </div>
      ) : (
        <Icon className="w-5.5 sm:w-6 h-5.5 sm:h-6 text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.35)] z-10" />
      )}
    </div>
  );
};

const ToolGrid = ({ 
  activeCategory, 
  handleLaunchIPTV, 
  handleLaunchFreelancing,
  handleLaunchFifa,
  handleLaunchAIHelper,
  handleLaunchTranslator,
  handleLaunchAPITester,
  handleLaunchHacking,
  handleLaunchDocCloner
}: { 
  activeCategory: ToolCategory; 
  handleLaunchIPTV: (playlistUrl?: string, category?: string) => void; 
  handleLaunchFreelancing: () => void;
  handleLaunchFifa: () => void;
  handleLaunchAIHelper: () => void;
  handleLaunchTranslator: () => void;
  handleLaunchAPITester: () => void;
  handleLaunchHacking: () => void;
  handleLaunchDocCloner: () => void;
}) => {
  const [pinnedTools, setPinnedTools] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("fahim_pinned_tools");
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  const togglePin = (id: string) => {
    setPinnedTools((prev) => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem("fahim_pinned_tools", JSON.stringify(next));
      return next;
    });
  };

  const filteredTools = useMemo(() => {
    const baseTools = activeCategory === "All" ? TOOLS : TOOLS.filter(t => t.category === activeCategory);
    return [...baseTools].sort((a, b) => {
      const aPinned = pinnedTools.includes(a.id);
      const bPinned = pinnedTools.includes(b.id);
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      return 0;
    });
  }, [activeCategory, pinnedTools]);

  const categoryKicker = useMemo(() => {
    switch (activeCategory) {
      case "Streaming": return "OUR FAVOURITES";
      case "Security": return "NET SECURITY";
      case "Utilities": return "SYSTEM ESSENTIALS";
      case "Web Tools": return "PLATFORMS & SPEED";
      case "Sports": return "SPORTS CENTER";
      case "AI": return "AI & AUTOMATION";
      default: return "OUR SELECTION";
    }
  }, [activeCategory]);

  return (
    <div className="w-full max-w-[440px] sm:max-w-[480px] px-4 select-none flex flex-col min-h-0 h-full max-h-[620px]">
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full bg-[#1c1c1e] text-white rounded-[26px] p-5 sm:p-6 border border-[#2c2c2e]/70 shadow-[0_24px_50px_-15px_rgba(0,0,0,0.85)] flex flex-col min-h-0 h-full gap-4"
      >
        {/* App Store Card Header */}
        <div className="flex flex-col text-left shrink-0">
          <span className="text-[#8e8e93] text-[9.5px] sm:text-[10px] font-black uppercase tracking-[0.14em] leading-none mb-1">
            {categoryKicker}
          </span>
          <h2 className="text-xl sm:text-[23px] font-extrabold text-white tracking-tight leading-none mt-0.5">
            Fahim All Tools
          </h2>
        </div>

        {/* Divider line */}
        <div className="h-[1px] bg-white/[0.04] w-full shrink-0" />

        {/* App List */}
        <div className="flex-grow overflow-y-auto pr-1 select-none flex flex-col gap-0.5 no-scrollbar scroll-smooth">
          <AnimatePresence mode="popLayout">
            {filteredTools.map((tool, idx) => {
              const isLive = tool.status === "Live";
              const isPinned = pinnedTools.includes(tool.id);
              const meta = getToolAppStoreMeta(tool.id);
              
              return (
                <motion.div
                  key={tool.id}
                  layout
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ duration: 0.25, delay: idx * 0.04 }}
                  className="flex items-center justify-between gap-3 sm:gap-4 py-3.5 first:pt-0 last:pb-0 border-b border-white/[0.04] last:border-0 group"
                >
                  {/* Left Aspect: Stylized Squicle Icon */}
                  <AppStoreIcon id={tool.id} icon={tool.icon} />

                  {/* Middle Aspect: App Info */}
                  <div className="flex flex-col min-w-0 flex-grow text-left">
                    <h3 className="text-white text-[13.5px] sm:text-[14.5px] font-extrabold tracking-tight leading-snug group-hover:text-indigo-400 transition-colors flex items-center gap-1.5 flex-wrap">
                      <span>{tool.name}</span>
                      
                      {/* Premium compact push-pin toggler */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePin(tool.id);
                        }}
                        className={`p-1 rounded-md transition-all active:scale-90 cursor-pointer ${
                          isPinned 
                            ? "text-purple-400 bg-purple-500/10" 
                            : "text-[#8e8e93]/30 hover:text-white hover:bg-white/5 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                        }`}
                        title={isPinned ? "Unpin tool from top" : "Pin tool to top"}
                      >
                        <Pin className={`w-3 h-3 ${isPinned ? "fill-purple-400" : ""}`} />
                      </button>
                    </h3>
                    <p className="text-[#a1a1aa] text-[9.5px] sm:text-[11px] font-medium leading-normal mt-1 opacity-90 select-none">
                      {tool.description}
                    </p>
                  </div>

                  {/* Right Aspect: Action Button or Cloud Indicator */}
                  <div className="flex flex-col items-center justify-center shrink-0 min-w-[70px]">
                    {isLive ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (tool.id === "fifa-2026") {
                            handleLaunchFifa();
                          } else if (tool.id === "fahim-doc-cloner") {
                            handleLaunchDocCloner();
                          } else if (tool.id === "fahim-tranlsator" || tool.id === "fahim-translator") {
                            handleLaunchTranslator();
                          } else if (tool.id === "fahim-ip-tv") {
                            handleLaunchIPTV();
                          } else if (tool.id === "start-freelancing") {
                            handleLaunchFreelancing();
                          } else if (tool.id === "fahim-ai-helper") {
                            handleLaunchAIHelper();
                          } else if (tool.id === "fahim-api-tester") {
                            handleLaunchAPITester();
                          } else if (tool.id === "ethical-hacking") {
                            handleLaunchHacking();
                          }
                        }}
                        className="bg-[#2c2c2e] hover:bg-[#3a3a3c] text-[#0a84ff] hover:text-[#3396ff] font-extrabold text-[12px] sm:text-[13px] h-7 sm:h-[29px] px-5 rounded-full select-none transition-all active:scale-95 duration-150 flex items-center justify-center border-0 tracking-tight cursor-pointer"
                      >
                        Use
                      </button>
                    ) : (
                      // Authentic App Store Cloud Download outline icon with down arrow
                      <div className="flex flex-col items-center justify-center shrink-0 py-0.5">
                        <svg className="w-5.5 h-5.5 sm:w-6 sm:h-6 text-[#0a84ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 11v6m0 0l-3-3m3 3l3-3" />
                          <path d="M17 10.5a5.5 5.5 0 0 0-11 0c0 .3 0 .7.1 1a4 4 0 0 0 1.9 7.5h9a5 5 0 0 0 0-10l-.4-.1z" />
                        </svg>
                      </div>
                    )}
                    <span className="text-[#8e8e93]/50 text-[8px] sm:text-[8.5px] font-black text-center mt-1 uppercase tracking-wider select-none leading-none">
                      {isLive ? "Live now" : "Soon"}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

const Filters = ({ active, onChange }: { active: ToolCategory; onChange: (c: ToolCategory) => void }) => {
  return (
    <div className="w-full flex justify-center mb-6 px-4">
      <div className="overflow-x-auto no-scrollbar flex items-center gap-0.5 p-0.5 bg-[#1c1c1e] border border-[#2c2c2e]/80 rounded-xl max-w-full shadow-inner select-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-[10px] text-[11px] font-black tracking-tight transition-all duration-150 cursor-pointer ${
              active === cat
                ? "bg-[#3a3a3c] text-[#0a84ff] shadow-[0_2px_4px_rgba(0,0,0,0.25)] scale-[1.02]"
                : "text-[#8e8e93] hover:text-white hover:bg-white/[0.02]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  const [view, setView] = useState<View>("hero");
  const [category, setCategory] = useState<ToolCategory>("All");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionProps, setTransitionProps] = useState<{
    title?: string;
    subtitle?: string;
    icon?: any;
    glowColor?: string;
    iconBgColor?: string;
  }>({});
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isCommunityOpen, setIsCommunityOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const [iptvPlaylistUrl, setIptvPlaylistUrl] = useState<string | undefined>(undefined);
  const [iptvActiveCategory, setIptvActiveCategory] = useState<string | undefined>(undefined);
  const [iptvBackView, setIptvBackView] = useState<View>("tools");

  const handleLaunchAPITester = () => {
    setTransitionProps({
      title: "FAHIM API TESTER",
      subtitle: "Preparing professional playground workstation...",
      icon: Terminal,
      glowColor: "bg-purple-600/25",
      iconBgColor: "bg-purple-600"
    });
    setIsTransitioning(true);
    setTimeout(() => {
      setView("api-tester");
      setIsTransitioning(false);
    }, 1800);
  };

  const handleLaunchTranslator = () => {
    setTransitionProps({
      title: "Fahim Translator",
      subtitle: "Initializing multi-lingual core...",
      icon: Sparkles,
      glowColor: "bg-purple-600/20",
      iconBgColor: "bg-purple-500"
    });
    setIsTransitioning(true);
    setTimeout(() => {
      setView("translator");
      setIsTransitioning(false);
    }, 1800);
  };

  const handleLaunchIPTV = (playlistUrl?: string, category?: string, backView: View = "tools") => {
    setIptvPlaylistUrl(playlistUrl);
    setIptvActiveCategory(category);
    setIptvBackView(backView);
    setTransitionProps({
      title: "Fahim IPTV",
      subtitle: playlistUrl ? "Opening Live Channel Preset..." : "Loading premium cinematic experience...",
      icon: Tv,
      glowColor: "bg-red-600/25",
      iconBgColor: "bg-red-600"
    });
    setIsTransitioning(true);
    setTimeout(() => {
      setView("iptv");
      setIsTransitioning(false);
    }, 2500);
  };

  const handleLaunchFreelancing = () => {
    setTransitionProps({
      title: "Start Freelancing",
      subtitle: "Initializing your freelancing workstation...",
      icon: Briefcase,
      glowColor: "bg-emerald-600/20",
      iconBgColor: "bg-emerald-500"
    });
    setIsTransitioning(true);
    setTimeout(() => {
      setView("freelancing");
      setIsTransitioning(false);
    }, 1800);
  };

  const handleLaunchFifa = () => {
    setTransitionProps({
      title: "FIFA Match Center",
      subtitle: "Connecting to FIFA 2026 World Cup Center...",
      icon: Trophy,
      glowColor: "bg-amber-600/20",
      iconBgColor: "bg-amber-500"
    });
    setIsTransitioning(true);
    setTimeout(() => {
      setView("fifa");
      setIsTransitioning(false);
    }, 2000);
  };

  const handleLaunchAIHelper = () => {
    setTransitionProps({
      title: "Fahim AI Helper",
      subtitle: "Initializing DeepSeek Intelligence Core...",
      icon: Sparkles,
      glowColor: "bg-blue-600/20",
      iconBgColor: "bg-blue-500"
    });
    setIsTransitioning(true);
    setTimeout(() => {
      setView("ai-helper");
      setIsTransitioning(false);
    }, 1800);
  };

  const handleLaunchHacking = () => {
    setTransitionProps({
      title: "Siam Hacking Suite",
      subtitle: "Establishing dynamic security sandbox workstation...",
      icon: Shield,
      glowColor: "bg-red-600/25",
      iconBgColor: "bg-red-600"
    });
    setIsTransitioning(true);
    setTimeout(() => {
      setView("hacking");
      setIsTransitioning(false);
    }, 1800);
  };

  const handleLaunchDocCloner = () => {
    setTransitionProps({
      title: "AI Doc Cloner & Editor",
      subtitle: "Initializing A4 layout OCR & template reconstruction engine...",
      icon: FileText,
      glowColor: "bg-indigo-600/20",
      iconBgColor: "bg-indigo-500"
    });
    setIsTransitioning(true);
    setTimeout(() => {
      setView("doc-cloner");
      setIsTransitioning(false);
    }, 2000);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("fahimxdm@gmail.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const [registerEmail, setRegisterEmail] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);

  // Cyber Auth system for the Join Community pop-up with real Firebase integrations
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [isAuthed, setIsAuthed] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Subscribe to real Firebase authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthed(true);
        setLoggedInUser(user.displayName || user.email?.split("@")[0] || "Cyber Node");
      } else {
        setIsAuthed(false);
        setLoggedInUser("");
      }
    });
    return () => unsubscribe();
  }, []);

  const handleRegisterCommunity = async (e: FormEvent) => {
    e.preventDefault();
    if (!registerEmail || isRegistering) return;
    setIsRegistering(true);

    const currentUser = auth.currentUser;
    if (currentUser) {
      const path = `community_registrations/${currentUser.uid}`;
      try {
        await setDoc(doc(db, "community_registrations", currentUser.uid), {
          uid: currentUser.uid,
          name: currentUser.displayName || loggedInUser || currentUser.email?.split("@")[0] || "Cyber Node",
          email: registerEmail,
          registeredAt: serverTimestamp()
        });
      } catch (err) {
        console.error("Firestore save failed for newsletter:", err);
      }
    }

    setTimeout(() => {
      setIsRegistering(false);
      setRegistered(true);
      setRegisterEmail("");
      // Clear notification after 5 seconds
      setTimeout(() => setRegistered(false), 5000);
    }, 1200);
  };

  const handleAuthSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError("");
    
    if (!authEmail || !authPassword) {
      setAuthError("Please fill in email and password.");
      return;
    }
    if (authMode === "register" && !authName) {
      setAuthError("Please specify your name.");
      return;
    }

    setIsAuthenticating(true);
    try {
      if (authMode === "register") {
        const userCredential = await createUserWithEmailAndPassword(auth, authEmail, authPassword);
        const user = userCredential.user;
        
        await updateProfile(user, { displayName: authName });

        const path = `community_registrations/${user.uid}`;
        try {
          await setDoc(doc(db, "community_registrations", user.uid), {
            uid: user.uid,
            name: authName,
            email: authEmail,
            registeredAt: serverTimestamp()
          });
        } catch (dbErr) {
          handleFirestoreError(dbErr, OperationType.WRITE, path);
        }
      } else {
        await signInWithEmailAndPassword(auth, authEmail, authPassword);
      }
      setIsAuthenticating(false);
    } catch (err: any) {
      setIsAuthenticating(false);
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        setAuthError("This email address is already in use.");
      } else if (err.code === "auth/weak-password") {
        setAuthError("Password must be at least 6 characters.");
      } else if (err.code === "auth/invalid-credential") {
        setAuthError("Incorrect password or email address.");
      } else {
        setAuthError(err.message || "An error occurred during authentication.");
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setAuthEmail("");
      setAuthPassword("");
      setAuthName("");
      setAuthMode("login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // Google Authentication trigger function
  const handleGoogleAuth = async () => {
    setAuthError("");
    setIsAuthenticating(true);
    try {
      const credential = await signInWithPopup(auth, googleProvider);
      const user = credential.user;
      
      const displayName = user.displayName || user.email?.split("@")[0] || "Cyber Node";
      const path = `community_registrations/${user.uid}`;
      try {
        await setDoc(doc(db, "community_registrations", user.uid), {
          uid: user.uid,
          name: displayName,
          email: user.email || "",
          registeredAt: serverTimestamp()
        }, { merge: true });
      } catch (dbErr) {
        handleFirestoreError(dbErr, OperationType.WRITE, path);
      }
      setIsAuthenticating(false);
    } catch (err: any) {
      setIsAuthenticating(false);
      console.error(err);
      if (err.code === "auth/popup-closed-by-user") {
        setAuthError("Google pop-up was closed before completing.");
      } else {
        setAuthError(err.message || "An authentication link error occurred.");
      }
    }
  };

  // Extended States for Profile & Settings
  const [profileDisplayName, setProfileDisplayName] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [apiToken, setApiToken] = useState("");
  const [profileAccent, setProfileAccent] = useState<"indigo" | "emerald" | "amber">("indigo");
  const [encryptionType, setEncryptionType] = useState("AES-256 Cloud Standard");
  const [activeTab, setActiveTab] = useState<"profile" | "settings" | "admin">("profile");

  // Admin Central Analysis States
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [adminViews, setAdminViews] = useState<any[]>([]);
  const [adminStatsLoading, setAdminStatsLoading] = useState(false);

  // Timezone to country mapping
  const getCountryFromTimezone = (): string => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    if (!tz) return "Unknown";
    if (tz.includes("Dhaka")) return "Bangladesh";
    if (tz.includes("Calcutta") || tz.includes("Kolkata")) return "India";
    if (tz.includes("Singapore")) return "Singapore";
    if (tz.includes("New_York") || tz.includes("Los_Angeles") || tz.includes("Chicago")) return "United States";
    if (tz.includes("London")) return "United Kingdom";
    if (tz.includes("Tokyo")) return "Japan";
    if (tz.includes("Dubai")) return "United Arab Emirates";
    if (tz.includes("Sydney") || tz.includes("Melbourne")) return "Australia";
    if (tz.includes("Toronto") || tz.includes("Vancouver")) return "Canada";
    
    const parts = tz.split("/");
    const lastPart = parts[parts.length - 1];
    return lastPart.replace(/_/g, " ");
  };

  // Register a site visit to Firestore
  useEffect(() => {
    const logVisit = async () => {
      if (sessionStorage.getItem("cyber_node_visited")) return;
      
      const viewId = `view_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const country = getCountryFromTimezone();
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
      const email = auth.currentUser?.email || "Guest User";

      try {
        await setDoc(doc(db, "page_views", viewId), {
          timestamp: serverTimestamp(),
          country,
          email,
          timezone
        });
        sessionStorage.setItem("cyber_node_visited", "true");
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `page_views/${viewId}`);
      }
    };

    const timer = setTimeout(() => {
      logVisit();
    }, 1500);

    return () => clearTimeout(timer);
  }, [isAuthed]);

  // Real-time listener for user registrations and page views (Admin Only)
  useEffect(() => {
    if (!isAuthed || auth.currentUser?.email !== "fahimmuntasir12390@gmail.com") {
      setAdminUsers([]);
      setAdminViews([]);
      return;
    }

    setAdminStatsLoading(true);

    const qUsers = query(collection(db, "community_registrations"), orderBy("registeredAt", "desc"), limit(200));
    const unsubscribeUsers = onSnapshot(qUsers, (snapshot) => {
      const users: any[] = [];
      snapshot.forEach((docSnap) => {
         const data = docSnap.data();
         users.push({
           id: docSnap.id,
           ...data,
           registeredAt: data.registeredAt?.toDate ? data.registeredAt.toDate().toLocaleString() : data.registeredAt || "N/A"
         });
      });
      setAdminUsers(users);
      setAdminStatsLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, "community_registrations");
    });

    const qViews = query(collection(db, "page_views"), orderBy("timestamp", "desc"), limit(1000));
    const unsubscribeViews = onSnapshot(qViews, (snapshot) => {
      const views: any[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        views.push({
          id: docSnap.id,
          ...data,
          timestamp: data.timestamp?.toDate ? data.timestamp.toDate().toLocaleString() : data.timestamp || "N/A"
        });
      });
      setAdminViews(views);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, "page_views");
    });

    return () => {
      unsubscribeUsers();
      unsubscribeViews();
    };
  }, [isAuthed, loggedInUser]);

  // Aggregate stats in real-time
  const stats = useMemo(() => {
    const totalViews = adminViews.length;
    const todayStr = new Date().toDateString();
    
    const todayViews = adminViews.filter(v => {
      if (!v.timestamp) return false;
      const d = new Date(v.timestamp);
      return d && d.toDateString() === todayStr;
    }).length;

    const countryMap: Record<string, number> = {};
    adminViews.forEach(v => {
      const c = v.country || "Unknown Region";
      countryMap[c] = (countryMap[c] || 0) + 1;
    });

    const countries = Object.entries(countryMap)
      .map(([name, count]) => ({
        name,
        count,
        percent: totalViews > 0 ? Math.round((count / totalViews) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count);

    return {
      totalViews,
      todayViews,
      totalUsers: adminUsers.length,
      countries
    };
  }, [adminViews, adminUsers]);

  // Keep profileDisplayName synced on load
  useEffect(() => {
    if (auth.currentUser) {
      setProfileDisplayName(auth.currentUser.displayName || auth.currentUser.email?.split("@")[0] || "");
    }
  }, [isAuthed, loggedInUser]);

  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || isSavingProfile) return;
    setIsSavingProfile(true);
    setProfileSaved(false);

    try {
      await updateProfile(auth.currentUser, { displayName: profileDisplayName });
      const path = `community_registrations/${auth.currentUser.uid}`;
      try {
        await setDoc(doc(db, "community_registrations", auth.currentUser.uid), {
          uid: auth.currentUser.uid,
          name: profileDisplayName,
          email: auth.currentUser.email || "",
          registeredAt: serverTimestamp()
        }, { merge: true });
      } catch (dbErr) {
        console.error("Firestore update failed in profile settings:", dbErr);
      }
      setLoggedInUser(profileDisplayName);
      setProfileSaved(true);
    } catch (err) {
      console.error("Profile update failed:", err);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleGenerateToken = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let token = "SIAM-SECURE-KEY_";
    for (let i = 0; i < 20; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setApiToken(token);
  };

  const isStablePage = view === "hero" || view === "tools" || view === "fifa" || view === "iptv" || view === "ai-helper" || view === "translator" || view === "freelancing" || view === "api-tester" || view === "hacking" || view === "doc-cloner";

  return (
    <div className={`flex flex-col font-sans selection:bg-blue-500/30 w-full relative ${
      isStablePage ? "h-[100dvh] max-h-[100dvh] overflow-hidden" : "min-h-screen"
    }`}>
      <BackgroundGlows />
      {view === "hero" && <SpiderWeb />}
      {view !== "freelancing" && view !== "iptv" && view !== "fifa" && view !== "ai-helper" && view !== "translator" && view !== "api-tester" && view !== "hacking" && view !== "doc-cloner" && (
        <Header currentView={view} setView={setView} onContactClick={() => setIsContactOpen(true)} onCommunityClick={() => setIsCommunityOpen(true)} />
      )}

      <AnimatePresence mode="wait">
        {isTransitioning ? (
          <LoadingScreen key="loader" {...transitionProps} />
        ) : view === "hero" ? (
          <motion.main
            key="hero"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 flex-grow flex flex-col items-center justify-center w-full h-[100dvh] md:h-auto px-4 sm:px-6 text-center pt-[70px] md:pt-28 pb-4 md:pb-12 overflow-hidden"
          >
            <div className="w-full max-w-4xl flex flex-col items-center justify-center py-4 md:py-20">
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-white/40 uppercase tracking-[0.3em] font-extrabold text-[10px] sm:text-xs mb-3 sm:mb-4"
              >
                Hi, I’m
              </motion.p>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="font-display text-[2.85rem] min-[360px]:text-[3.25rem] sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight mb-3 sm:mb-6 bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent leading-[1.1] sm:leading-none text-center"
              >
                Fahim Montasir Siam
              </motion.h1>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mb-5 sm:mb-8"
              >
                <h2 className="text-base sm:text-xl md:text-2xl font-display font-bold text-indigo-400 mb-2 sm:mb-4 text-center">
                  Ethical Hacker & Developer
                </h2>
                <p className="text-white/75 text-[12px] min-[360px]:text-sm sm:text-base md:text-xl max-w-sm sm:max-w-2xl mx-auto leading-relaxed px-2 font-medium text-center">
                  Building useful tools, modern web experiences, automation systems and secure digital products. Welcome to the official portfolio of Fahim Montasir (Fahim Montasir Siam) — Bangladeshi Ethical Hacker, Full-Stack Developer, and Technical Architect.
                </p>
                
                {/* Social media connections for search indexing and user navigation */}
                <div className="flex items-center justify-center gap-3 flex-wrap mt-5 sm:mt-7 max-w-lg mx-auto">
                  <a
                    href="https://github.com/fahimxdm"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-white/50 hover:text-white transition-colors bg-white/5 border border-white/5 hover:border-white/10 px-3 py-1.5 rounded-full select-none"
                    title="Fahim Montasir Siam on GitHub"
                  >
                    <Github className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
                    <span>GitHub</span>
                  </a>
                  <a
                    href="https://facebook.com/fahimxdm"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-white/50 hover:text-white transition-colors bg-white/5 border border-white/5 hover:border-white/10 px-3 py-1.5 rounded-full select-none"
                    title="Fahim Montasir Siam on Facebook"
                  >
                    <Facebook className="w-3.5 h-3.5 text-blue-500" />
                    <span>Facebook</span>
                  </a>
                  <a
                    href="https://instagram.com/fahimxdm"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-white/50 hover:text-white transition-colors bg-white/5 border border-white/5 hover:border-white/10 px-3 py-1.5 rounded-full select-none"
                    title="Fahim Montasir Siam on Instagram"
                  >
                    <Instagram className="w-3.5 h-3.5 text-pink-500" />
                    <span>Instagram</span>
                  </a>
                  <a
                    href="https://tiktok.com/@fahimxdm"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-white/50 hover:text-white transition-colors bg-white/5 border border-white/5 hover:border-white/10 px-3 py-1.5 rounded-full select-none"
                    title="Fahim Montasir Siam on TikTok"
                  >
                    <Globe className="w-3.5 h-3.5 text-purple-400" />
                    <span>TikTok</span>
                  </a>
                  <a
                    href="https://t.me/fahimxdm"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-white/50 hover:text-white transition-colors bg-white/5 border border-white/5 hover:border-white/10 px-3 py-1.5 rounded-full select-none"
                    title="Fahim Montasir Siam on Telegram"
                  >
                    <Send className="w-3.5 h-3.5 text-sky-400" />
                    <span>Telegram</span>
                  </a>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="w-full flex justify-center"
              >
                <button 
                  onClick={() => setView("tools")}
                  className="group relative w-[80%] max-w-[280px] sm:w-auto px-6 py-3.5 sm:px-8 sm:py-4 rounded-full bg-gradient-to-r from-[#0084ff] to-[#007aff] hover:from-[#007aff] hover:to-[#006bdd] text-white font-display font-black text-sm sm:text-lg transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_6px_20px_rgba(0,122,255,0.4)] hover:shadow-[0_8px_25px_rgba(0,122,255,0.55)] border border-[#007aff]/20"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2 select-none">
                    Fahim’s All Tools
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-1" />
                  </span>
                </button>
              </motion.div>
            </div>
          </motion.main>
        ) : view === "tools" ? (
          <motion.main
            key="tools"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 w-full h-[100dvh] pt-[75px] sm:pt-[92px] md:pt-[106px] pb-4 flex flex-col items-center justify-start overflow-hidden px-4"
          >
            <div className="shrink-0 mb-3 sm:mb-4 w-full">
              <Filters active={category} onChange={setCategory} />
            </div>
            <div className="flex-grow flex flex-col items-center justify-start min-h-0 w-full overflow-hidden pb-4">
              <ToolGrid 
                activeCategory={category} 
                handleLaunchIPTV={handleLaunchIPTV} 
                handleLaunchFreelancing={handleLaunchFreelancing}
                handleLaunchFifa={handleLaunchFifa}
                handleLaunchAIHelper={handleLaunchAIHelper}
                handleLaunchTranslator={handleLaunchTranslator}
                handleLaunchAPITester={handleLaunchAPITester}
                handleLaunchHacking={handleLaunchHacking}
                handleLaunchDocCloner={handleLaunchDocCloner}
              />
            </div>
          </motion.main>
        ) : view === "iptv" ? (
          <motion.div 
            key="iptv-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full overflow-hidden flex flex-col"
          >
            <ErrorBoundary toolName="Fahim IPTV" onReset={() => setView("tools")}>
              <Suspense fallback={
                <LoadingScreen 
                  title="Fahim IPTV" 
                  subtitle="Loading your streaming experience..." 
                  icon={Tv} 
                  glowColor="bg-red-600/25" 
                  iconBgColor="bg-red-600" 
                />
              }>
                <IPTVApp 
                  onBack={() => setView(iptvBackView)} 
                  initialPlaylistUrl={iptvPlaylistUrl}
                  initialActiveCategory={iptvActiveCategory}
                />
              </Suspense>
            </ErrorBoundary>
          </motion.div>
        ) : view === "freelancing" ? (
          <motion.div 
            key="freelancing-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full overflow-hidden flex flex-col"
          >
            <ErrorBoundary toolName="Start Freelancing" onReset={() => setView("tools")}>
              <Suspense fallback={
                <LoadingScreen 
                  title="Start Freelancing" 
                  subtitle="Initializing freelancing workstation..." 
                  icon={Briefcase} 
                  glowColor="bg-emerald-600/20" 
                  iconBgColor="bg-emerald-500" 
                />
              }>
                <FreelancingApp onBack={() => setView("tools")} />
              </Suspense>
            </ErrorBoundary>
          </motion.div>
        ) : view === "fifa" ? (
          <motion.div 
            key="fifa-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full overflow-hidden flex flex-col"
          >
            <ErrorBoundary toolName="FIFA 2026 World Cup" onReset={() => setView("tools")}>
              <Suspense fallback={
                <LoadingScreen 
                  title="FIFA Match Center" 
                  subtitle="Connecting to Grand Match Center..." 
                  icon={Trophy} 
                  glowColor="bg-amber-600/20" 
                  iconBgColor="bg-amber-500" 
                />
              }>
                <FifaApp 
                  onBack={() => setView("tools")} 
                  onWatchLiveIPTV={(url, cat) => handleLaunchIPTV(url, cat, "fifa")} 
                />
              </Suspense>
            </ErrorBoundary>
          </motion.div>
        ) : view === "ai-helper" ? (
          <motion.div 
            key="ai-helper-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full overflow-hidden flex flex-col"
          >
            <ErrorBoundary toolName="Fahim AI Helper" onReset={() => setView("tools")}>
              <Suspense fallback={
                <LoadingScreen 
                  title="Fahim AI Helper" 
                  subtitle="Initializing DeepSeek Intelligence Core..." 
                  icon={Sparkles} 
                  glowColor="bg-blue-600/20" 
                  iconBgColor="bg-blue-500" 
                />
              }>
                <AIHelperApp 
                  onBack={() => setView("tools")} 
                />
              </Suspense>
            </ErrorBoundary>
          </motion.div>
        ) : view === "translator" ? (
          <motion.div 
            key="translator-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full overflow-hidden flex flex-col"
          >
            <ErrorBoundary toolName="Fahim Translator" onReset={() => setView("tools")}>
              <Suspense fallback={
                <LoadingScreen 
                  title="Fahim Translator" 
                  subtitle="Initializing multi-lingual core..." 
                  icon={Languages} 
                  glowColor="bg-purple-600/20" 
                  iconBgColor="bg-purple-500" 
                />
              }>
                <TranslatorApp 
                  onBack={() => setView("tools")} 
                />
              </Suspense>
            </ErrorBoundary>
          </motion.div>
        ) : view === "api-tester" ? (
          <motion.div 
            key="api-tester-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full overflow-hidden flex flex-col"
          >
            <ErrorBoundary toolName="Fahim API Tester" onReset={() => setView("tools")}>
              <Suspense fallback={
                <LoadingScreen 
                  title="FAHIM API TESTER" 
                  subtitle="Preparing professional playground workstation..." 
                  icon={Terminal} 
                  glowColor="bg-purple-600/25" 
                  iconBgColor="bg-purple-600" 
                />
              }>
                <APITesterApp 
                  onBack={() => setView("tools")} 
                />
              </Suspense>
            </ErrorBoundary>
          </motion.div>
        ) : view === "hacking" ? (
          <motion.div 
            key="hacking-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full overflow-hidden flex flex-col"
          >
            <ErrorBoundary toolName="Siam Hacking Suite" onReset={() => setView("tools")}>
              <Suspense fallback={
                <LoadingScreen 
                  title="Siam Hacking Suite" 
                  subtitle="Establishing dynamic security sandbox workstation..." 
                  icon={Shield} 
                  glowColor="bg-red-600/25" 
                  iconBgColor="bg-red-600" 
                />
              }>
                <HackingApp 
                  onBack={() => setView("tools")} 
                />
              </Suspense>
            </ErrorBoundary>
          </motion.div>
        ) : view === "doc-cloner" ? (
          <motion.div 
            key="doc-cloner-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full overflow-hidden flex flex-col"
          >
            <ErrorBoundary toolName="AI Doc Cloner & Editor" onReset={() => setView("tools")}>
              <Suspense fallback={
                <LoadingScreen 
                  title="AI Doc Cloner & Editor" 
                  subtitle="Initializing A4 layout OCR & template reconstruction engine..." 
                  icon={FileText} 
                  glowColor="bg-indigo-600/20" 
                  iconBgColor="bg-indigo-500" 
                />
              }>
                <DocumentClonerApp 
                  onBack={() => setView("tools")} 
                />
              </Suspense>
            </ErrorBoundary>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {isContactOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          >
            {/* Backdrop click closer */}
            <div className="absolute inset-0" onClick={() => setIsContactOpen(false)} />

            {/* Modal Card content */}
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-sm max-h-[85vh] overflow-y-auto no-scrollbar bg-neutral-950/95 border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl z-10 text-center select-none"
            >
              {/* Blue/indigo glows inside card */}
              <div className="absolute -top-12 -left-12 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-indigo-600/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex justify-end absolute top-4 right-4">
                <button
                  onClick={() => setIsContactOpen(false)}
                  className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-white/55 hover:text-white transition-colors active:scale-90"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="w-11 h-11 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mx-auto mb-4 border border-indigo-500/25">
                <Mail className="w-5 h-5" />
              </div>

              <h3 className="text-lg font-black text-white tracking-tight mb-2">Get In Touch</h3>
              <p className="text-white/45 text-xs mb-6 max-w-xs mx-auto">
                Connect directly to share queries, ideas, or stream feedback with me.
              </p>

              {/* Email box */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors mb-4 text-left">
                <div className="min-w-0 flex-grow pr-3">
                  <span className="block text-[8px] uppercase tracking-wider font-extrabold text-[#38BDF8] mb-0.5">Primary Contact Mail</span>
                  <span className="block text-xs sm:text-sm font-bold text-white/90 truncate select-all">fahimxdm@gmail.com</span>
                </div>
                <button
                  onClick={handleCopyEmail}
                  className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/5 hover:bg-indigo-600/10 border border-white/5 hover:border-indigo-500/20 text-white/70 hover:text-indigo-400 transition-all shrink-0 active:scale-95"
                  title="Copy email to clipboard"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Action: Send Mail */}
              <a
                href="mailto:fahimxdm@gmail.com"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-white hover:bg-neutral-100 text-black text-xs font-black shadow-lg transition-all active:scale-98 mb-6 cursor-pointer"
              >
                <span>Send Real-Time Email</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              {/* Social Connections */}
              <div className="mb-6">
                <span className="block text-[8px] uppercase tracking-wider font-extrabold text-[#38BDF8] mb-2.5 text-left">My Profiles & Socials</span>
                <div className="grid grid-cols-2 gap-2 text-left">
                  <a
                    href="https://github.com/fahimxdm"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-slate-500/30 hover:bg-white/5 text-white/70 hover:text-white transition-all text-xs font-bold"
                  >
                    <Github className="w-4 h-4 text-slate-400" />
                    <span>GitHub</span>
                  </a>
                  <a
                    href="https://facebook.com/fahimxdm"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-blue-500/30 hover:bg-white/5 text-white/70 hover:text-white transition-all text-xs font-bold"
                  >
                    <Facebook className="w-4 h-4 text-blue-500" />
                    <span>Facebook</span>
                  </a>
                  <a
                    href="https://instagram.com/fahimxdm"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-pink-500/30 hover:bg-white/5 text-white/70 hover:text-white transition-all text-xs font-bold"
                  >
                    <Instagram className="w-4 h-4 text-pink-500" />
                    <span>Instagram</span>
                  </a>
                  <a
                    href="https://tiktok.com/@fahimxdm"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-purple-500/30 hover:bg-white/5 text-white/70 hover:text-white transition-all text-xs font-bold"
                  >
                    <Globe className="w-4 h-4 text-purple-400" />
                    <span>TikTok</span>
                  </a>
                  <a
                    href="https://t.me/fahimxdm"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="col-span-2 flex items-center justify-center gap-2 p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 hover:bg-sky-500/20 text-sky-450 hover:text-white transition-all text-xs font-black"
                  >
                    <Send className="w-4 h-4 text-sky-400 animate-pulse" />
                    <span>Telegram channel</span>
                  </a>
                </div>
              </div>

              {/* Funny English warning note */}
              <div className="p-3.5 rounded-2xl bg-red-950/25 border border-red-500/20 text-red-300 text-[10px] leading-relaxed font-bold text-center">
                ⚠️ If you do not even know how to use email, you shouldn't be staying on this site, haha!
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCommunityOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          >
            {/* Backdrop click closer */}
            <div className="absolute inset-0" onClick={() => setIsCommunityOpen(false)} />

            {/* Modal Card content */}
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className={`relative w-full ${isAuthed && activeTab === "admin" && auth.currentUser?.email === "fahimmuntasir12390@gmail.com" ? "max-w-2xl md:max-w-3xl" : "max-w-md"} max-h-[85vh] md:max-h-none flex flex-col bg-neutral-950/95 border border-indigo-500/20 rounded-3xl p-5 md:p-8 shadow-2xl z-10 overflow-hidden transition-all duration-300`}
            >
              {/* Blue/indigo/cyan glows inside card */}
              <div className="absolute -top-12 -left-12 w-32 h-32 bg-indigo-600/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-cyan-600/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex justify-end absolute top-4 right-4 z-20">
                <button
                  onClick={() => setIsCommunityOpen(false)}
                  className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-white/55 hover:text-white transition-colors active:scale-90"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto no-scrollbar pr-0.5 space-y-1 text-center flex flex-col items-center">
                {!isAuthed ? (
                  <div className="select-none w-full flex flex-col items-center">
                    <div className="w-11 h-11 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mx-auto mb-3 border border-indigo-500/25 animate-pulse shrink-0">
                      <Users className="w-5 h-5" />
                    </div>

                    <h3 className="text-lg font-black text-white tracking-tight mb-1">Join Our Community</h3>
                    <p className="text-white/45 text-xs mb-5 max-w-sm mx-auto leading-relaxed">
                    Login or create an account below to unlock access to our Telegram, Discord, and secure downloads.
                  </p>

                  {/* Tabs: Login and Create Account */}
                  <div className="flex p-1 bg-white/[0.03] border border-white/5 rounded-2xl mb-4.5">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode("login");
                        setAuthError("");
                      }}
                      className={`flex-1 py-2 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                        authMode === "login"
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                          : "text-white/40 hover:text-white/70"
                      }`}
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Login</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode("register");
                        setAuthError("");
                      }}
                      className={`flex-1 py-2 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                        authMode === "register"
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                          : "text-white/40 hover:text-white/70"
                      }`}
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Create Account</span>
                    </button>
                  </div>

                  {/* Auth Form Form content */}
                  <form onSubmit={handleAuthSubmit} className="space-y-3.5 text-left">
                    {authError && (
                      <div className="p-3 text-[11px] text-red-400 bg-red-950/20 border border-red-500/30 rounded-xl font-bold">
                        ⚠️ {authError}
                      </div>
                    )}

                    {authMode === "register" && (
                      <div className="space-y-1">
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-white/40">Full Name / Username</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                          <input
                            type="text"
                            required
                            placeholder="e.g. Fahim Siam"
                            value={authName}
                            onChange={(e) => setAuthName(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 focus:border-indigo-500/50 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-white/20 focus:outline-none transition-all"
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-white/40">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                        <input
                          type="email"
                          required
                          placeholder="your-email@example.com"
                          value={authEmail}
                          onChange={(e) => setAuthEmail(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 focus:border-indigo-500/50 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-white/20 focus:outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-white/40">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          placeholder="••••••••"
                          value={authPassword}
                          onChange={(e) => setAuthPassword(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 focus:border-indigo-500/50 rounded-xl pl-9 pr-10 py-2 text-xs text-white placeholder-white/20 focus:outline-none transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 p-1 rounded-md"
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Submit logic */}
                    <button
                      type="submit"
                      disabled={isAuthenticating}
                      className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] transition-all text-xs font-black text-white hover:shadow-lg hover:shadow-indigo-600/15 flex items-center justify-center gap-2 select-none animate-pulse"
                    >
                      {isAuthenticating ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Establishing Secure Link...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-indigo-200 animate-pulse" />
                          <span>Join Community Now</span>
                        </>
                      )}
                    </button>
                  </form>

                  {/* Google Authenticator Section */}
                  <div className="relative my-4 flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/[0.06] shadow-sm"></div>
                    </div>
                    <div className="relative px-3 bg-neutral-950 text-[10px] font-extrabold uppercase tracking-widest text-white/30 text-center select-none">
                      or connect via
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleAuth}
                    disabled={isAuthenticating}
                    className="w-full py-2 rounded-xl bg-white/5 border border-white/5 hover:border-white/15 hover:bg-white/10 active:scale-[0.98] transition-all text-xs font-bold text-white hover:shadow-lg flex items-center justify-center gap-2.5 select-none disabled:opacity-50 cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                    </svg>
                    <span>Google Secure Connect</span>
                  </button>
                </div>
              ) : (
                <div className="text-left space-y-4">
                  {/* Premium Heading */}
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-black text-xs shrink-0 select-none uppercase">
                        {loggedInUser ? loggedInUser.slice(0, 2) : "CN"}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-black text-white tracking-tight leading-none capitalize truncate">
                            {loggedInUser}
                          </h4>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 animate-pulse inline-block" />
                        </div>
                        <p className="text-[9px] text-white/45 leading-none mt-1 truncate font-mono">
                          {auth.currentUser?.email || "anonymous@node.net"}
                        </p>
                      </div>
                    </div>
                    {auth.currentUser?.email === "fahimmuntasir12390@gmail.com" ? (
                      <span className="px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-[8px] font-black uppercase tracking-wider text-red-400 shrink-0 select-none leading-none animate-pulse">
                        Core System Admin
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[8px] font-black uppercase tracking-wider text-indigo-400 shrink-0 select-none leading-none">
                        Active Node
                      </span>
                    )}
                  </div>

                  {/* Admin Tab Selector */}
                  {auth.currentUser?.email === "fahimmuntasir12390@gmail.com" && (
                    <div className="flex bg-neutral-900/60 p-1 rounded-xl border border-white/[0.04]">
                      <button
                        type="button"
                        onClick={() => setActiveTab("profile")}
                        className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          activeTab !== "admin"
                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/10"
                            : "text-white/45 hover:text-white"
                        }`}
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>My Profile</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab("admin")}
                        className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          activeTab === "admin"
                            ? "bg-red-600 text-white shadow-lg shadow-red-600/10"
                            : "text-white/45 hover:text-white"
                        }`}
                      >
                        <Shield className="w-3.5 h-3.5 text-red-400" />
                        <span>🛡️ Admin Central</span>
                      </button>
                    </div>
                  )}

                  {/* Tab Body */}
                  {activeTab === "admin" && auth.currentUser?.email === "fahimmuntasir12390@gmail.com" ? (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      {/* Admin Real-Time Metrics Row */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] flex flex-col justify-between shrink-0 min-w-0 text-left">
                          <span className="text-[8px] text-white/35 font-extrabold uppercase tracking-wider block">Today views</span>
                          <span className="text-sm font-black text-emerald-400 mt-1 flex items-center gap-1 font-mono leading-none">
                            {stats.todayViews}
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block shrink-0" />
                          </span>
                        </div>
                        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] flex flex-col justify-between shrink-0 min-w-0 text-left">
                          <span className="text-[8px] text-white/35 font-extrabold uppercase tracking-wider block">Total views</span>
                          <span className="text-sm font-black text-indigo-400 mt-1 font-mono leading-none">
                            {stats.totalViews}
                          </span>
                        </div>
                        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] flex flex-col justify-between shrink-0 min-w-0 text-left">
                          <span className="text-[8px] text-white/35 font-extrabold uppercase tracking-wider block">Total users</span>
                          <span className="text-sm font-black text-rose-400 mt-1 font-mono leading-none">
                            {stats.totalUsers}
                          </span>
                        </div>
                      </div>

                      {/* Top Countries List */}
                      <div className="p-3.5 rounded-2xl bg-white/[0.01] border border-white/[0.04] text-left">
                        <h4 className="text-[10px] font-black uppercase text-indigo-400 tracking-wider mb-2 flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5" />
                          <span>Top Traffic Regions</span>
                        </h4>
                        <div className="space-y-2 max-h-[100px] overflow-y-auto pr-1">
                          {stats.countries.slice(0, 5).map((c, i) => (
                            <div key={c.name} className="space-y-1">
                              <div className="flex justify-between items-center text-[10px]">
                                <span className="font-bold text-white/80">{i + 1}. {c.name}</span>
                                <span className="font-mono text-white/40">{c.count} views ({c.percent}%)</span>
                              </div>
                              <div className="w-full h-1 bg-white/[0.03] rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${c.percent}%` }} />
                              </div>
                            </div>
                          ))}
                          {stats.countries.length === 0 && (
                            <p className="text-[10px] text-white/30 text-center py-2">No location records on system.</p>
                          )}
                        </div>
                      </div>

                      {/* Real-time Community Registration list */}
                      <div className="p-3.5 rounded-2xl bg-white/[0.01] border border-white/[0.04] text-left">
                        <h4 className="text-[10px] font-black uppercase text-red-400 tracking-wider mb-2 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5" />
                          <span>Real-Time Member Database ({adminUsers.length})</span>
                        </h4>
                        
                        <div className="overflow-y-auto max-h-[140px] pr-1 space-y-1.5 scrollbar-thin">
                          {adminUsers.map((usr) => (
                            <div 
                              key={usr.id} 
                              className="p-2 rounded-xl bg-white/[0.01] border border-white/[0.03] hover:border-white/[0.06] transition-all flex items-center justify-between gap-3"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="w-6.5 h-6.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-black text-[9px] uppercase select-none shrink-0">
                                  {usr.name ? usr.name.slice(0, 2) : "U"}
                                </div>
                                <div className="min-w-0">
                                  <h5 className="text-[10px] font-bold text-white/90 leading-none truncate capitalize">{usr.name || "Unnamed"}</h5>
                                  <p className="text-[8px] text-white/35 leading-none mt-1 truncate select-all font-mono">{usr.email}</p>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="text-[8px] font-mono text-indigo-300 block leading-none">
                                  {usr.registeredAt?.split(",")[0] || "N/A"}
                                </span>
                                <span className="inline-block mt-0.5 text-[7px] text-emerald-400 bg-emerald-500/10 px-1 py-0.2 rounded font-black tracking-wider uppercase scale-90">
                                  Node Link
                                </span>
                              </div>
                            </div>
                          ))}
                          {adminUsers.length === 0 && (
                            <p className="text-[10px] text-white/30 text-center py-3">No registered users found in Firestore database.</p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="space-y-4">
                      {profileSaved && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>Profile information saved successfully!</span>
                        </motion.div>
                      )}

                      {/* Profile Form */}
                      <form onSubmit={handleUpdateProfile} className="space-y-3.5">
                        {/* Display Name Input */}
                        <div className="space-y-1">
                          <label className="block text-xs font-semibold text-white/70">
                            Full Name
                          </label>
                          <div className="relative">
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                            <input
                              type="text"
                              required
                              value={profileDisplayName}
                              onChange={(e) => setProfileDisplayName(e.target.value)}
                              className="w-full bg-white/[0.03] border border-white/10 focus:border-indigo-500/50 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-white/20 focus:outline-none transition-all font-medium"
                              placeholder="Your Display Name"
                            />
                          </div>
                        </div>

                        {/* Email Input (ReadOnly) */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <label className="block text-xs font-semibold text-white/70">
                              Email Address
                            </label>
                            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Shield className="w-3 h-3" /> Verified Account
                            </span>
                          </div>
                          <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                            <input
                              type="text"
                              readOnly
                              disabled
                              value={auth.currentUser?.email || "anonymous@node.net"}
                              className="w-full bg-white/[0.01] border border-white/5 rounded-xl pl-10 pr-4 py-2 text-xs text-white/40 cursor-not-allowed font-medium"
                            />
                          </div>
                        </div>

                        {/* Submit Changes Button */}
                        <button
                          type="submit"
                          disabled={isSavingProfile}
                          className="w-full mt-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] disabled:opacity-50 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer select-none"
                        >
                          {isSavingProfile ? (
                            <>
                              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              <span>Saving Changes...</span>
                            </>
                          ) : (
                            <>
                              <Check className="w-4 h-4" />
                              <span>Save Changes</span>
                            </>
                          )}
                        </button>
                      </form>
                    </div>
                  )}

                  {/* Clean SaaS Footer Section */}
                  <div className="pt-3.5 border-t border-white/[0.06] flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="text-xs text-red-400/80 hover:text-red-400 flex items-center gap-1.5 font-bold transition-all cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log out</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsCommunityOpen(false)}
                      className="text-xs text-white/40 hover:text-white transition-all font-semibold cursor-pointer"
                    >
                      Close Window
                    </button>
                  </div>
                </div>
              )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
