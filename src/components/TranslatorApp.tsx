import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, Languages, Loader2, Copy, Check, CheckCircle2, ArrowRight } from "lucide-react";

export const TranslatorApp = ({ onBack }: { onBack: () => void }) => {
  const [inputText, setInputText] = useState("");
  const [replyStyle, setReplyStyle] = useState("Professional");
  const [isTranslating, setIsTranslating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const styles = ["Professional", "Casual", "Aggressive", "Negotiation", "Friendly"];

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    
    setIsTranslating(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: inputText,
          style: replyStyle
        })
      });

      if (!response.ok) {
        if (response.status === 525 || response.status === 503) {
          throw new Error("API server is currently offline or unreachable. Please check the backend proxy.");
        }
        throw new Error("Translation request failed. Status: " + response.status);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error.message || data.error);
      }
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to translate. Please try again.");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const CopyButton = ({ text, id }: { text: string, id: string }) => {
    const isCopied = copiedField === id;
    return (
      <button
        onClick={() => handleCopy(text, id)}
        className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-white/50 hover:text-white/80 transition-colors flex items-center justify-center shrink-0"
        title="Copy"
      >
        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    );
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#09090b] text-white">
      {/* Header */}
      <header className="h-[60px] sm:h-[70px] shrink-0 bg-transparent flex items-center justify-between px-4 sm:px-6 relative z-10 w-full pt-2">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors border border-white/5"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-white/70" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-[10px] bg-gradient-to-tr from-purple-600/20 to-purple-500/20 border border-purple-500/20 flex items-center justify-center">
              <Languages className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-sm sm:text-base font-bold text-white leading-tight">Fahim Translator</h1>
              <span className="text-[10px] sm:text-[11px] text-white/50 font-medium">Smart Context Engine</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Workspace */}
      <div className="flex-1 overflow-y-auto w-full max-w-4xl mx-auto flex flex-col px-4 sm:px-6 py-4 gap-6 sm:gap-8 min-h-0 no-scrollbar">
        
        {/* Input Area */}
        <div className="flex flex-col w-full shrink-0">
          <h2 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500/50" />
            Source Text
          </h2>
          <div className="relative group">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste text or message here in any language..."
              className="w-full min-h-[140px] bg-[#121214] border border-white/10 rounded-2xl p-4 sm:p-5 text-white placeholder-white/30 outline-none resize-none focus:border-purple-500/50 focus:shadow-[0_0_20px_rgba(168,85,247,0.1)] transition-all leading-relaxed"
            />
            
            {/* Style Selector inside input area bottom right */}
            <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between pointer-events-none">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pointer-events-auto pr-4">
                {styles.map(s => (
                  <button
                    key={s}
                    onClick={() => setReplyStyle(s)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors ${
                      replyStyle === s 
                      ? "bg-purple-600 text-white" 
                      : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/80"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <button
                onClick={handleTranslate}
                disabled={!inputText.trim() || isTranslating}
                className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center transition-all pointer-events-auto ${
                  inputText.trim() && !isTranslating 
                  ? "bg-white text-black shadow-lg hover:scale-105" 
                  : "bg-white/5 text-white/20 cursor-not-allowed"
                }`}
              >
                {isTranslating ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Results Area */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm font-medium"
            >
              {error}
            </motion.div>
          )}

          {isTranslating && (
             <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="flex flex-col items-center justify-center py-12 gap-4 text-white/50"
             >
               <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
               <p className="text-sm font-medium animate-pulse">Analyzing context & translating...</p>
             </motion.div>
          )}

          {!isTranslating && result && result.mode === "translation" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-4 sm:gap-6 w-full"
            >
              <div className="bg-[#121214] border border-white/10 rounded-2xl overflow-hidden flex flex-col group">
                <div className="px-4 py-2.5 bg-black/40 border-b border-white/5 flex items-center justify-between">
                  <span className="text-[10px] sm:text-xs font-bold text-white/40 uppercase tracking-wider">Polished English</span>
                  <CopyButton text={result.polished_version || ""} id="polished" />
                </div>
                <div className="p-4 sm:p-5 text-sm sm:text-base leading-relaxed text-white font-medium">
                  {result.polished_version}
                </div>
              </div>

              <div className="bg-[#121214] border border-white/10 rounded-2xl overflow-hidden flex flex-col group opacity-80">
                <div className="px-4 py-2.5 bg-black/40 border-b border-white/5 flex items-center justify-between">
                  <span className="text-[10px] sm:text-xs font-bold text-white/40 uppercase tracking-wider">Direct Translation</span>
                  <CopyButton text={result.direct_translation || ""} id="direct" />
                </div>
                <div className="p-4 sm:p-5 text-sm sm:text-base leading-relaxed text-white/80">
                  {result.direct_translation}
                </div>
              </div>
            </motion.div>
          )}

          {!isTranslating && result && result.mode === "communication" && (
             <motion.div
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="flex flex-col gap-4 sm:gap-6 w-full"
             >
               <div className="bg-[#121214] border border-purple-500/20 rounded-2xl overflow-hidden flex flex-col shadow-[0_0_20px_rgba(168,85,247,0.05)] relative">
                 <div className="px-4 py-2.5 bg-black/40 border-b border-white/5 flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                     <span className="text-[10px] sm:text-xs font-bold text-white/40 uppercase tracking-wider">Smart Reply ({replyStyle})</span>
                   </div>
                   <CopyButton text={result.smart_reply || ""} id="smart" />
                 </div>
                 <div className="p-4 sm:p-5 text-sm sm:text-base leading-relaxed text-white font-medium">
                   {result.smart_reply}
                 </div>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full">
                 <div className="bg-[#121214] border border-white/10 rounded-2xl overflow-hidden flex flex-col group opacity-80">
                   <div className="px-4 py-2 bg-black/40 border-b border-white/5 flex items-center justify-between">
                     <span className="text-[10px] sm:text-xs font-bold text-white/40 uppercase tracking-wider">Meaning & Intent</span>
                   </div>
                   <div className="p-4 text-sm leading-relaxed text-white/80">
                     {result.meaning}
                   </div>
                 </div>

                 <div className="bg-[#121214] border border-white/10 rounded-2xl overflow-hidden flex flex-col group opacity-70">
                   <div className="px-4 py-2 bg-black/40 border-b border-white/5 flex items-center justify-between">
                     <span className="text-[10px] sm:text-xs font-bold text-white/40 uppercase tracking-wider">Direct Translation</span>
                     <CopyButton text={result.direct_translation || ""} id="comm_direct" />
                   </div>
                   <div className="p-4 text-sm leading-relaxed text-white/70">
                     {result.direct_translation}
                   </div>
                 </div>
               </div>
             </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
