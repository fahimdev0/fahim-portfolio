import React, { useState, useEffect, useMemo } from "react";
import { 
  Trophy, 
  Search, 
  ArrowLeft, 
  Play, 
  Tv, 
  Clock, 
  Sparkles, 
  Activity, 
  Award, 
  Heart, 
  Loader2, 
  Radio, 
  Check, 
  Plus, 
  Link as LinkIcon, 
  Smartphone,
  ChevronRight,
  TrendingUp,
  Volume2,
  Tv2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { VideoPlayer } from "./VideoPlayer";
import { parseM3U } from "../lib/parser";
import { IPTVChannel } from "../types";

interface FifaAppProps {
  onBack: () => void;
  onWatchLiveIPTV?: (playlistUrl?: string, category?: string) => void;
}

const getCorsSafeUrl = (url: string): string => {
  if (!url) return url;
  let target = url.trim();
  if (target.includes("raw.githubusercontent.com")) {
    try {
      const parsedUrl = new URL(target);
      const pathParts = parsedUrl.pathname.split("/").filter(Boolean);
      if (pathParts.length >= 3) {
        const user = pathParts[0];
        const repo = pathParts[1];
        let branch = pathParts[2];
        let pathIdx = 3;
        if (branch === "refs" && pathParts[3] === "heads") {
          branch = pathParts[4];
          pathIdx = 5;
        }
        const remainingPath = pathParts.slice(pathIdx).join("/");
        return `https://cdn.jsdelivr.net/gh/${user}/${repo}@${branch}/${remainingPath}`;
      }
    } catch (e) {
      console.error("CORS conversion error", e);
    }
  }
  return target;
};

// Highly reliable premium sports stream presets
const SPORTS_PRESETS: IPTVChannel[] = [
  {
    id: "unite8",
    name: "⚽ Fahim FIFA Live Sports (UNITE 8)",
    group: "FIFA Sports",
    url: "http://160.22.105.17:5080/LiveApp/streams/unite8.m3u8",
    logo: "https://i.ibb.co/xL3nJbB/fifa-icon.png"
  },
  {
    id: "redbull-sports",
    name: "🏆 Red Bull TV Sports Stream",
    group: "Featured",
    url: "https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8",
    logo: "https://i.ibb.co/xL3nJbB/fifa-icon.png"
  },
  {
    id: "aljazeera-live",
    name: "📺 Al Jazeera English",
    group: "Global TV",
    url: "https://live-hls-web-aje.getaj.net/AJE/index.m3u8",
    logo: "https://i.ibb.co/xL3nJbB/fifa-icon.png"
  }
];

export const FifaApp = ({ onBack, onWatchLiveIPTV }: FifaAppProps) => {
  const [channels, setChannels] = useState<IPTVChannel[]>(SPORTS_PRESETS);
  const [selectedChannel, setSelectedChannel] = useState<IPTVChannel>(SPORTS_PRESETS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Navigation & Search State
  const [activeTab, setActiveTab] = useState<"all" | "fifa" | "global" | "favs" | "custom">("fifa");
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem("fahim_sports_favs");
    return saved ? JSON.parse(saved) : ["unite8"];
  });

  // Custom Live Link Tester States
  const [customName, setCustomName] = useState("");
  const [customUrl, setCustomUrl] = useState("");
  const [customSuccess, setCustomSuccess] = useState(false);

  // Generate dynamic stats to make stream feel premium and real
  const spectators = useMemo(() => {
    // Generate simulated viewing numbers based on channel name length
    const factor = selectedChannel ? selectedChannel.name.length : 12;
    return Math.floor((factor * 697) + (Math.sin(factor) * 200) + 4000).toLocaleString();
  }, [selectedChannel]);

  // Load playlists from user's specified FIFA source url
  useEffect(() => {
    const fetchFifaPlaylist = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(getCorsSafeUrl("https://raw.githubusercontent.com/SHAJON-404/iptv/refs/heads/main/app/data/fifa.m3u"));
        if (!response.ok) throw new Error("CORS restricted or source server is offline");
        const m3uText = await response.text();
        const parsed = parseM3U(m3uText);
        
        if (parsed.channels && parsed.channels.length > 0) {
          // Merge fetched channels with premium fallbacks
          const merged = [...SPORTS_PRESETS];
          parsed.channels.forEach(ch => {
            const isDup = merged.some(m => m.url === ch.url);
            if (!isDup) {
              // Standardize group names to fit sports
              const nameLower = ch.name.toLowerCase();
              if (nameLower.includes("fifa") || nameLower.includes("world cup") || nameLower.includes("unite8")) {
                ch.group = "FIFA Sports";
              } else if (nameLower.includes("tv") || nameLower.includes("news")) {
                ch.group = "Global TV";
              } else {
                ch.group = "Featured";
              }
              merged.push(ch);
            }
          });
          setChannels(merged);
          
          // Auto select first dynamic channel if found
          const firstDynamic = merged.find(c => c.id !== "unite8");
          if (firstDynamic) {
            setSelectedChannel(SPORTS_PRESETS[0]); // Default to Fahim FIFA UNITE 8
          }
        }
      } catch (err) {
        console.warn("M3U Playlist fetch skipped due to safety limit. Relying on integrated Sports Presets Catalog.", err);
        // Fallback to high-quality internal options
        setChannels(SPORTS_PRESETS);
      } finally {
        setLoading(false);
      }
    };

    fetchFifaPlaylist();
  }, []);

  // Sync favorites in localStorage
  useEffect(() => {
    localStorage.setItem("fahim_sports_favs", JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Channel selections handler
  const handleSelectChannel = (channel: IPTVChannel) => {
    setSelectedChannel(channel);
    // Smooth scroll to top player for mobile viewports
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Add custom user link
  const handleAddCustomLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !customUrl.trim()) return;

    const newChannel: IPTVChannel = {
      id: "custom_" + Math.random().toString(36).substring(2, 9),
      name: `📡 ${customName.trim()}`,
      group: "Custom TV",
      url: customUrl.trim(),
      logo: "https://i.ibb.co/xL3nJbB/fifa-icon.png"
    };

    setChannels(prev => [newChannel, ...prev]);
    setSelectedChannel(newChannel);
    setCustomSuccess(true);
    setCustomName("");
    setCustomUrl("");
    setTimeout(() => setCustomSuccess(false), 3000);
    setActiveTab("all");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Computed filter options
  const filteredChannels = useMemo(() => {
    return channels.filter(ch => {
      // 1. Tab Match
      if (activeTab === "fifa" && ch.group !== "FIFA Sports") return false;
      if (activeTab === "global" && ch.group !== "Global TV") return false;
      if (activeTab === "favs" && !favorites.includes(ch.id)) return false;
      if (activeTab === "custom" && !ch.id.startsWith("custom_")) return false;

      // 2. Search Query Match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return ch.name.toLowerCase().includes(q) || ch.url.toLowerCase().includes(q);
      }

      return true;
    });
  }, [channels, activeTab, searchQuery, favorites]);

  return (
    <div className="w-full h-screen bg-[#07070a] text-zinc-100 flex flex-col font-sans relative overflow-hidden selection:bg-amber-500 selection:text-black">
      {/* Immersive stadium neon backdrop glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] h-[350px] bg-gradient-to-b from-amber-500/10 to-transparent blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="absolute top-[400px] right-4 w-48 h-48 bg-emerald-500/5 blur-[90px] rounded-full pointer-events-none z-0" />

      {/* Main Container - strictly optimized for mobile viewport */}
      <div className="w-full max-w-md mx-auto px-4 z-10 flex flex-col h-full pt-3">
        
        {/* Fixed Header, Player and Tabs Section */}
        <div className="shrink-0 flex flex-col">
          <header className="w-full flex items-center justify-between border-b border-zinc-800/40 pb-3 mb-3 select-none">
            <div className="flex items-center gap-2">
              <button 
                onClick={onBack}
                className="p-2 rounded-xl bg-zinc-900/90 active:scale-95 text-zinc-400 hover:text-white border border-zinc-800/60 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="flex flex-col text-left">
                <span className="text-[9px] font-black text-amber-500 tracking-wider uppercase leading-none">SPORTS BROADCAST</span>
                <span className="text-sm font-black text-white flex items-center gap-1 mt-0.5">
                  FAHIM IPTV SPORTS <span className="text-[9px] bg-amber-500/20 text-amber-400 font-extrabold px-1.5 py-0.5 rounded leading-none">LIVE</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span className="text-[10px] font-mono font-bold text-red-400 bg-red-950/40 border border-red-500/25 px-2 py-0.5 rounded-full">
                LIVE BROADCAST
              </span>
            </div>
          </header>

          <section className="w-full flex flex-col mb-3">
            <div className="w-full rounded-2xl overflow-hidden bg-black border border-amber-500/20 shadow-[0_8px_32px_rgba(245,158,11,0.06)] relative aspect-video">
              {selectedChannel ? (
                <VideoPlayer 
                  key={selectedChannel.url} 
                  url={selectedChannel.url} 
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 gap-2">
                  <Tv className="w-8 h-8 text-zinc-600 animate-pulse" />
                  <span className="text-xs">Select a sports channel below</span>
                </div>
              )}
            </div>

            {selectedChannel && (
              <div className="mt-2.5 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/60 text-left">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-white flex items-center gap-1.5 truncate pr-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    {selectedChannel.name}
                  </h3>
                  <span className="text-[10px] bg-amber-500/20 text-amber-400 font-black px-2 py-0.5 rounded-md uppercase shrink-0">
                    {selectedChannel.group}
                  </span>
                </div>
              </div>
            )}
          </section>

          <section className="flex flex-col gap-3 mb-3">
            <div className="flex items-center gap-1 p-0.5 bg-zinc-950/80 border border-zinc-800/40 rounded-xl overflow-x-auto no-scrollbar scroll-smooth select-none shrink-0">
              {[
                { id: "fifa", label: "⚽ FIFA SPORTS" },
                { id: "all", label: "🔥 ALL SPORTS" },
                { id: "global", label: "📺 GLOBAL TV" },
                { id: "favs", label: "⭐ FAVORITES" },
                { id: "custom", label: "🛠️ TEST LINK" }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`whitespace-nowrap px-3.5 py-2.5 rounded-lg text-[10px] font-black tracking-tight leading-none transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-amber-500 text-black font-extrabold shadow-md shadow-amber-500/10"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab !== "custom" && (
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="w-4 h-4 text-zinc-500" />
                </span>
                <input
                  type="text"
                  placeholder="Search live sports channels..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full h-10 bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 focus:border-amber-500/40 rounded-xl pl-9 pr-4 text-xs font-semibold text-white placeholder-zinc-500 focus:outline-none transition-all"
                />
              </div>
            )}
          </section>
        </div>

        {/* 3. SCROLLABLE CHANNEL LIST CONTAINER */}
        <section className="flex-grow overflow-y-auto no-scrollbar pb-6">
          
          {/* CUSTOM TEST LINK TAB */}
          {activeTab === "custom" && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-zinc-900/30 border border-zinc-800/60"
            >
              {/* ... (keep existing form content unchanged) ... */}
              <div className="flex items-center gap-2 mb-3">
                <Tv2 className="w-5 h-5 text-amber-500" />
                <h3 className="text-xs font-black text-white uppercase tracking-wider">
                  Test Live Stream URL (.m3u8)
                </h3>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed mb-4">
                Test custom live streams directly inside this premium broadcast player. Input any HLS .m3u8 or IPTV URL below.
              </p>

              <form onSubmit={handleAddCustomLink} className="flex flex-col gap-3">
                <div>
                  <label className="block text-[10px] font-black text-zinc-400 uppercase mb-1.5 pl-0.5">Stream Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. T-Sports HD Live"
                    value={customName}
                    onChange={e => setCustomName(e.target.value)}
                    className="w-full h-10 px-3 text-xs bg-black/60 border border-zinc-800 focus:border-amber-500 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:ring-0 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-zinc-400 uppercase mb-1.5 pl-0.5">Stream URL (.m3u8)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LinkIcon className="w-3.5 h-3.5 text-zinc-500" />
                    </span>
                    <input
                      type="url"
                      required
                      placeholder="https://example.com/stream/index.m3u8"
                      value={customUrl}
                      onChange={e => setCustomUrl(e.target.value)}
                      className="w-full h-10 pl-9 pr-3 text-xs bg-black/60 border border-zinc-800 focus:border-amber-500 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:ring-0 transition-all font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full h-10 mt-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-450 text-black font-extrabold text-xs transition-all active:scale-95 flex items-center justify-center gap-1 shadow-md cursor-pointer border-0"
                >
                  <Plus className="w-4 h-4 text-black" />
                  ADD & PLAY LIVE CHANNEL
                </button>
              </form>

              {customSuccess && (
                <div className="mt-3.5 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-550/20 text-[10px] text-emerald-400 text-center font-bold">
                  Channel loaded successfully! Set to primary broadcast screen.
                </div>
              )}
            </motion.div>
          )}

          {/* LIVE CHANNELS LIST GRID */}
          {activeTab !== "custom" && (
            <div className="flex flex-col gap-2.5">
              
              <div className="flex items-center justify-between text-[11px] text-zinc-500 font-bold px-1 select-none">
                <span>CHANNELS MATCHED ({filteredChannels.length})</span>
                <span className="flex items-center gap-1 text-[10px] text-zinc-400">
                  <Smartphone className="w-3 h-3 text-amber-500" /> Touch to Stream
                </span>
              </div>

              {loading && filteredChannels.length === 0 ? (
                <div className="h-44 w-full flex flex-col items-center justify-center gap-2 text-zinc-500 text-xs">
                  <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
                  <span>Fetching live sports feeds...</span>
                </div>
              ) : filteredChannels.length === 0 ? (
                <div className="p-10 text-center text-xs text-zinc-500 bg-zinc-900/10 border border-zinc-800/15 rounded-2xl">
                  No active channels found under this tab category.
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {filteredChannels.map(ch => {
                    const isSelected = selectedChannel && selectedChannel.id === ch.id;
                    const isFav = favorites.includes(ch.id);

                    return (
                      <div
                        key={ch.id}
                        onClick={() => handleSelectChannel(ch)}
                        className={`p-3.5 rounded-2xl bg-zinc-950 hover:bg-zinc-900/60 border transition-all active:scale-[0.99] cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected 
                            ? "border-amber-500 relative shadow-[0_2px_12px_rgba(245,158,11,0.06)]" 
                            : "border-zinc-800/70"
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-0 left-0 bottom-0 w-1 bg-amber-500 rounded-l-2xl" />
                        )}

                        <div className="flex items-center gap-3.5 text-left truncate flex-grow">
                          <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center border border-zinc-800/70 overflow-hidden shrink-0">
                            {ch.logo ? (
                              <img 
                                src={ch.logo} 
                                alt="" 
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                className="w-full h-full object-cover select-none"
                                referrerPolicy="no-referrer"
                              />
                            ) : null}
                            <span className="text-[10px] font-black text-amber-500 font-mono tracking-tight uppercase">
                              {ch.name.slice(1, 4).trim() || "TV"}
                            </span>
                          </div>

                          <div className="flex flex-col truncate">
                            <span className="text-xs font-black text-zinc-100 truncate flex items-center gap-1.5">
                              {ch.name}
                            </span>
                            <span className="text-[10px] text-zinc-500 mt-0.5 truncate font-medium">
                              Live Stream HLS Feed • {ch.group}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={(e) => toggleFavorite(ch.id, e)}
                            className={`p-2 rounded-xl transition-all cursor-pointer ${
                              isFav 
                                ? "bg-amber-500/15 border border-amber-500/30 text-amber-500" 
                                : "bg-transparent text-zinc-550 hover:text-zinc-350 border border-transparent"
                            }`}
                          >
                            <Heart className={`w-3.5 h-3.5 ${isFav ? "fill-amber-500" : ""}`} />
                          </button>

                          <div className={`p-2 rounded-xl border transition-all ${
                            isSelected 
                              ? "bg-amber-500 border-amber-500 text-black shadow-md" 
                              : "bg-zinc-900 border-zinc-800/60 text-zinc-400"
                          }`}>
                            {isSelected ? (
                              <Check className="w-3.5 h-3.5" />
                            ) : (
                              <Play className="w-3.5 h-3.5" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </section>
      </div>
    </div>
  );
};
