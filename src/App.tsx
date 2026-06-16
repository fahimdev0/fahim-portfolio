/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Tv, Shield, Zap, Globe, Github, ExternalLink, ChevronLeft, LayoutGrid, Terminal, Cpu, Mail, Copy, Check, X } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { View, Tool, ToolCategory } from "./types";
import { LoadingScreen } from "./components/LoadingScreen";
import { IPTVApp } from "./components/IPTVApp";
import { SpiderWeb } from "./components/SpiderWeb";

const AVATAR_URL = "https://i.postimg.cc/KjWv0jtW/Chat-GPT-Image-Jun-16-2026-05-25-46-PM.png";

const TOOLS: Tool[] = [
  {
    id: "fahim-ip-tv",
    name: "Fahim IPTV",
    description: "Premium IPTV streaming platform.",
    icon: Tv,
    category: "Streaming",
  },
];

const CATEGORIES: ToolCategory[] = ["All", "Streaming", "Security", "Utilities", "Web Tools"];

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

const Header = ({ currentView, setView, onContactClick }: { currentView: View; setView: (v: View) => void; onContactClick: () => void }) => {
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
        <span className="font-display font-bold text-xs sm:text-sm text-white/85 tracking-tight group-hover:text-blue-400 transition-colors">Fahim M. Siam</span>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-4">
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
          onClick={onContactClick}
          className="px-3 py-1.5 sm:px-5 sm:py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all text-[10px] sm:text-xs font-bold select-none text-white/90 active:scale-95 duration-100"
        >
          Get In Touch
        </button>
      </div>
    </motion.header>
  );
};

const ToolCard = ({ tool, featured = false, handleLaunchIPTV }: { tool: Tool; featured?: boolean, handleLaunchIPTV: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      whileHover={{ y: featured ? -4 : -2, borderColor: featured ? "rgba(59, 130, 246, 0.4)" : "rgba(255, 255, 255, 0.1)" }}
      className={`group relative flex flex-col p-3.5 sm:p-4.5 rounded-2xl transition-all min-h-[170px] sm:min-h-[185px] h-auto ${
        featured 
          ? "bg-white/[0.07] border border-white/20 shadow-[0_0_40px_-15px_rgba(59,130,246,0.3)]" 
          : "bg-white/[0.03] border border-white/5 opacity-60"
      }`}
    >
      <div className="flex items-start justify-between mb-2 sm:mb-3">
        <div className={`w-8 h-8 sm:w-9.5 sm:h-9.5 rounded-xl flex items-center justify-center ${featured ? "bg-indigo-600 text-white" : "bg-white/10 text-white/40"}`}>
          <tool.icon className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <span className={`px-2 py-0.5 rounded-lg text-[8px] sm:text-[9px] font-bold uppercase tracking-widest ${featured ? "bg-indigo-500/20 text-indigo-300" : "bg-white/5 text-white/20"}`}>
          {tool.category}
        </span>
      </div>
      
      <div className="flex-grow">
        <h3 className={`text-xs sm:text-sm font-display font-black mb-1 sm:mb-1.5 leading-tight ${featured ? "text-white" : "text-white/40"}`}>
          {tool.name}
        </h3>
        <p className="text-white/45 text-[10px] sm:text-[11px] leading-relaxed line-clamp-2">
          {tool.description}
        </p>
      </div>

      {featured && (
        <button 
          onClick={() => tool.id === 'fahim-ip-tv' && handleLaunchIPTV()}
          className="mt-3 sm:mt-4 w-full flex items-center justify-center gap-1.5 py-2 sm:py-2.5 rounded-xl bg-white hover:bg-neutral-100 text-black text-[10px] sm:text-xs font-black shadow-lg transition-all transform active:scale-95"
        >
          <span>Launch IPTV</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </motion.div>
  );
};

const ComingSoonCard = () => (
  <div className="flex flex-col p-3.5 sm:p-4.5 rounded-2xl bg-white/[0.02] border border-white/[0.05] min-h-[170px] sm:min-h-[185px] h-auto opacity-40">
    <div className="w-8 h-8 sm:w-9.5 sm:h-9.5 rounded-xl bg-white/5 flex items-center justify-center text-white/10 mb-2 sm:mb-3">
      <Zap className="w-4 h-4" />
    </div>
    <div className="flex-grow">
      <h3 className="text-xs sm:text-sm font-display font-black text-white/25 mb-1 leading-tight">Coming Soon</h3>
      <p className="text-white/15 text-[10px] sm:text-[11px] leading-relaxed">New tools are currently under development.</p>
    </div>
  </div>
);

const ToolGrid = ({ activeCategory, handleLaunchIPTV }: { activeCategory: ToolCategory; handleLaunchIPTV: () => void }) => {
  const filteredTools = useMemo(() => {
    if (activeCategory === "All") return TOOLS;
    return TOOLS.filter(t => t.category === activeCategory);
  }, [activeCategory]);

  const showComingSoon = activeCategory === "All" || filteredTools.length === 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full max-w-5xl">
      <AnimatePresence mode="popLayout">
        {filteredTools.map((tool) => (
          <motion.div
            key={tool.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <ToolCard tool={tool} featured={tool.id === "fahim-ip-tv"} handleLaunchIPTV={handleLaunchIPTV} />
          </motion.div>
        ))}
        {showComingSoon && (
          <motion.div key="soon-1" layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}><ComingSoonCard /></motion.div>
        )}
        {showComingSoon && (
          <motion.div key="soon-2" layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}><ComingSoonCard /></motion.div>
        )}
        {showComingSoon && (
          <motion.div key="soon-3" layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}><ComingSoonCard /></motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Filters = ({ active, onChange }: { active: ToolCategory; onChange: (c: ToolCategory) => void }) => {
  return (
    <div className="w-full flex justify-center mb-8 px-4 sm:px-6">
      <div className="overflow-x-auto no-scrollbar flex items-center gap-1.5 p-1 bg-white/[0.03] border border-white/5 rounded-full backdrop-blur-sm max-w-full">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[11px] font-bold transition-all ${
              active === cat
                ? "bg-white text-black shadow-lg"
                : "text-white/30 hover:text-white/60 hover:bg-white/5"
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
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleLaunchIPTV = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setView("iptv");
      setIsTransitioning(false);
    }, 2500);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("fahimxdm@gmail.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative min-h-screen flex flex-col font-sans overflow-x-hidden selection:bg-blue-500/30">
      <BackgroundGlows />
      {view === "hero" && <SpiderWeb />}
      <Header currentView={view} setView={setView} onContactClick={() => setIsContactOpen(true)} />

      <AnimatePresence mode="wait">
        {isTransitioning && <LoadingScreen key="loader" />}
        {view === "hero" ? (
          <motion.main
            key="hero"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 flex-grow flex flex-col items-center justify-center w-full h-[85vh] max-h-[90vh] sm:h-auto sm:max-h-none px-4 sm:px-6 text-center pt-20 sm:pt-28 pb-4 sm:pb-12 overflow-hidden"
          >
            <div className="w-full max-w-4xl py-2 sm:py-20 flex flex-col items-center justify-center">
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
                className="font-display text-[2.85rem] min-[360px]:text-[3.25rem] sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight mb-3 sm:mb-6 bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent leading-[1.1] sm:leading-none"
              >
                Fahim Muntasir Siam
              </motion.h1>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mb-5 sm:mb-8"
              >
                <h2 className="text-base sm:text-xl md:text-2xl font-display font-bold text-indigo-400 mb-2 sm:mb-4">
                  Ethical Hacker & Developer
                </h2>
                <p className="text-white/75 text-[12px] min-[360px]:text-sm sm:text-base md:text-xl max-w-sm sm:max-w-2xl mx-auto leading-relaxed px-2 font-medium">
                  Building useful tools, modern web experiences, automation systems and secure digital products.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="w-full flex justify-center"
              >
                <button 
                  onClick={() => setView("tools")}
                  className="group relative w-[80%] max-w-[280px] sm:w-auto px-6 py-3.5 sm:px-8 sm:py-4 rounded-xl bg-white text-black font-display font-black text-sm sm:text-lg overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl"
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 flex-grow flex flex-col items-center px-4 sm:px-6 pt-24 sm:pt-32 pb-16 sm:pb-20 overflow-y-auto"
          >
            <div className="text-center mb-1.5 sm:mb-2 max-w-2xl select-none mt-2 sm:mt-0">
              <h1 className="font-display text-2xl sm:text-4xl font-black text-white mb-1.5">
                Fahim's All Tools
              </h1>
              <p className="text-white/45 text-xs sm:text-sm mb-6 sm:mb-8 max-w-sm sm:max-w-md mx-auto">
                Explore my tools, platforms and projects.
              </p>
            </div>

            <Filters active={category} onChange={setCategory} />
            <ToolGrid activeCategory={category} handleLaunchIPTV={handleLaunchIPTV} />
          </motion.main>
        ) : view === "iptv" ? (
          <motion.div 
            key="iptv-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100]"
          >
            <IPTVApp onBack={() => setView("tools")} />
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
              className="relative w-full max-w-sm bg-neutral-950/95 border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl z-10 overflow-hidden text-center select-none"
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

              {/* Funny English warning note */}
              <div className="p-3.5 rounded-2xl bg-red-950/25 border border-red-500/20 text-red-300 text-[10px] leading-relaxed font-bold text-center">
                ⚠️ If you do not even know how to use email, you shouldn't be staying on this site, haha!
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="relative z-10 p-6 text-center text-white/10 text-[10px] font-medium tracking-widest uppercase">
        © {new Date().getFullYear()} — Built with Precision
      </footer>
    </div>
  );
}
