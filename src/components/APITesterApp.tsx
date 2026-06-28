import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeft,
  Terminal,
  Play,
  Activity,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Database,
  Unplug
} from "lucide-react";

export const APITesterApp = ({ onBack }: { onBack: () => void }) => {
  const [url, setUrl] = useState("https://jsonplaceholder.typicode.com/posts/1");
  const [method, setMethod] = useState("GET");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    status: "online" | "offline" | "slow" | null;
    statusCode: number | string;
    latency: number;
    size: string;
    error?: string;
  } | null>(null);

  const handlePing = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/proxy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          url,
          method,
          headers: {
            "Accept": "application/json"
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Server responded with HTTP ${response.status}`);
      }

      const resData = await response.json();
      
      if (resData.status === 0 || !resData.status) {
        setResult({
          status: "offline",
          statusCode: "No Response",
          latency: 0,
          size: "0 Bytes",
          error: resData.details || "Connection refused or URL unreachable."
        });
      } else {
        const latency = resData.latency || 0;
        let finalStatus: "online" | "offline" | "slow" = "online";
        
        if (resData.status >= 400) {
          finalStatus = "offline";
        } else if (latency > 1500) {
          finalStatus = "slow";
        }

        let sizeText = "Unknown";
        if (typeof resData.size === "number") {
          sizeText = resData.size > 1024 
            ? `${(resData.size / 1024).toFixed(2)} KB` 
            : `${resData.size} Bytes`;
        }

        setResult({
          status: finalStatus,
          statusCode: resData.status,
          latency,
          size: sizeText,
          error: resData.status >= 400 ? `Returned error status code: HTTP ${resData.status}` : undefined
        });
      }
    } catch (err: any) {
      setResult({
        status: "offline",
        statusCode: "Error",
        latency: 0,
        size: "0 Bytes",
        error: err.message || "Failed to reach host gateway."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#050508] text-white overflow-hidden max-w-[100vw] relative select-none">
      
      {/* Decorative clean ambient glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-purple-900/10 rounded-full blur-3xl pointer-events-none" />

      {/* Premium minimal header */}
      <header className="h-[60px] sm:h-[70px] shrink-0 border-b border-white/5 bg-[#07070c]/60 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 relative z-15 w-full">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-xl bg-purple-950/20 border border-purple-500/20 hover:bg-purple-900/30 flex items-center justify-center transition-all cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 text-purple-400" />
          </button>
          <div>
            <span className="block text-[10px] font-black uppercase text-purple-400 tracking-wider font-mono">
              FAHIMX UTILITIES
            </span>
            <h1 className="text-sm sm:text-base font-black tracking-tight text-white leading-tight uppercase font-display">
              API Health Checker
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest font-mono">
            ENGINE STATUS LIVE
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow w-full max-w-xl mx-auto px-4 py-8 flex flex-col justify-center gap-6 relative z-10">
        
        {/* Intro */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(147,51,234,0.1)]">
            <Activity className="w-6 h-6 text-purple-400 animate-pulse" />
          </div>
          <h2 className="text-xl font-black text-white tracking-tight uppercase font-display">
            Instant API Status Scanner
          </h2>
          <p className="text-xs text-white/50 mt-1 max-w-sm mx-auto leading-relaxed">
            Enter any public, private, or local API endpoint to test dynamic online status with continuous bypass.
          </p>
        </div>

        {/* Input workspace card */}
        <div className="p-5 rounded-2xl bg-[#09090e]/90 border border-white/5 shadow-xl flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] uppercase font-black tracking-widest text-purple-400 font-mono">
              Target API Endpoint
            </label>
            <div className="flex gap-2">
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="h-11 px-3 bg-[#111116] border border-white/10 hover:border-purple-500/30 rounded-xl text-xs font-black text-purple-300 transition-colors focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://api.example.com/v1/health"
                className="flex-grow h-11 px-4 bg-[#111116] border border-white/10 hover:border-purple-500/30 rounded-xl text-xs font-medium text-white placeholder-white/20 transition-all focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>

          <button
            onClick={handlePing}
            disabled={isLoading}
            className="w-full h-11 rounded-xl font-black uppercase tracking-wider bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white flex items-center justify-center gap-2 text-xs transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_16px_rgba(168,85,247,0.15)]"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Pinging Endpoint...</span>
              </>
            ) : (
              <>
                <span>Check Status</span>
                <Play className="w-3.5 h-3.5 fill-white" />
              </>
            )}
          </button>
        </div>

        {/* Dynamic clean output display */}
        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-4 animate-fadeIn"
            >
              {/* Massive status badge */}
              <div className={`p-6 rounded-2xl border text-center relative overflow-hidden transition-all duration-300 ${
                result.status === "online"
                  ? "bg-emerald-950/20 border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.05)]"
                  : result.status === "slow"
                  ? "bg-amber-950/20 border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.05)]"
                  : "bg-red-950/20 border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.05)]"
              }`}>
                {/* Large responsive icon */}
                <div className="flex justify-center mb-3">
                  {result.status === "online" ? (
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                      <CheckCircle className="w-7 h-7" />
                    </div>
                  ) : result.status === "slow" ? (
                    <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 animate-pulse">
                      <Clock className="w-7 h-7" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-400">
                      <Unplug className="w-7 h-7" />
                    </div>
                  )}
                </div>

                <span className="block text-[10px] uppercase font-black tracking-widest text-white/40 font-mono mb-1">
                  Diagnostics Results
                </span>
                
                <h3 className={`text-2xl font-black tracking-tight uppercase font-display select-text ${
                  result.status === "online"
                    ? "text-emerald-400"
                    : result.status === "slow"
                    ? "text-amber-400"
                    : "text-red-400"
                }`}>
                  {result.status === "online" 
                    ? "🟢 ONLINE" 
                    : result.status === "slow" 
                    ? "🟡 SLOW RESPONSE" 
                    : "🔴 OFFLINE"}
                </h3>

                {result.error && (
                  <p className="text-[11px] font-mono text-white/60 mt-2 max-w-sm mx-auto select-text leading-relaxed">
                    {result.error}
                  </p>
                )}
              </div>

              {/* Status details numbers */}
              <div className="grid grid-cols-3 gap-2.5 text-center font-mono">
                <div className="p-3.5 rounded-xl bg-[#09090e] border border-white/5">
                  <span className="text-[9px] text-white/40 block mb-1 uppercase tracking-widest">HTTP STATUS</span>
                  <strong className={`text-xs font-black select-text ${
                    result.status === "online" ? "text-emerald-400" : "text-red-400"
                  }`}>
                    {result.statusCode}
                  </strong>
                </div>

                <div className="p-3.5 rounded-xl bg-[#09090e] border border-white/5">
                  <span className="text-[9px] text-white/40 block mb-1 uppercase tracking-widest">RESPONSE TIME</span>
                  <strong className="text-xs font-black text-purple-400 select-text">
                    {result.latency > 0 ? `${result.latency} ms` : "---"}
                  </strong>
                </div>

                <div className="p-3.5 rounded-xl bg-[#09090e] border border-white/5">
                  <span className="text-[9px] text-white/40 block mb-1 uppercase tracking-widest">DATA SIZE</span>
                  <strong className="text-xs font-black text-indigo-400 select-text">
                    {result.size}
                  </strong>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* Simple dynamic disclaimer footer */}
      <footer className="mt-auto py-4 border-t border-white/5 flex justify-center text-[10px] text-white/30 tracking-wider uppercase font-mono">
        FahimX API Workspace Gateway
      </footer>

    </div>
  );
};
