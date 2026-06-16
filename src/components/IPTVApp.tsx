/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from "motion/react";
import { 
  Tv, Search, Heart, History,
  ChevronLeft, Upload, X, Play,
  Menu, Info, Radio, AlertCircle, Sparkles,
  Activity, ShieldCheck, ExternalLink, Award, ChevronDown
} from "lucide-react";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { IPTVChannel, IPTVPlaylist } from "../types";
import { parseM3U } from "../lib/parser";
import { VideoPlayer } from "./VideoPlayer";

const PLAYLISTS_PRESETS = [
  { 
    name: "🏆 Fahim Sports Premium (240+ Channels)", 
    url: "https://raw.githubusercontent.com/SHAJON-404/iptv/refs/heads/main/app/data/sports.m3u" 
  },
  { 
    name: "🇧🇩 Fahim Bangla Live (100+ Channels)", 
    url: "https://raw.githubusercontent.com/SHAJON-404/iptv/refs/heads/main/app/data/bangla.m3u" 
  },
  { 
    name: "🌍 Fahim Global Universal (7500+ Channels)", 
    url: "https://raw.githubusercontent.com/SHAJON-404/iptv/refs/heads/main/app/data/channels.m3u" 
  },
  { 
    name: "⚽ Fahim FIFA Live Sports (7 Channels)", 
    url: "https://raw.githubusercontent.com/SHAJON-404/iptv/refs/heads/main/app/data/fifa.m3u" 
  },
  { 
    name: "BD Tech Expert (Bangla & Sports Live)", 
    url: "https://raw.githubusercontent.com/bdtechexpert/live-tv-playlist/refs/heads/main/live-tv-playlist.m3u" 
  },
  { 
    name: "General IPTV (1000+ Global Channels)", 
    url: "https://iptv-org.github.io/iptv/index.m3u" 
  },
  { 
    name: "Ayna BDIX (Bangla Media)", 
    url: "https://raw.githubusercontent.com/abusaeeidx/Ayna-BDIX-IPTV-Playlist/refs/heads/main/ayna-playlist.m3u" 
  },
  { 
    name: "T-Sports (Sports Live Auto-Update)", 
    url: "https://raw.githubusercontent.com/abusaeeidx/T-Sports-Playlist-Auto-Update/refs/heads/main/combine_playlist.m3u" 
  },
  { 
    name: "Mrgify TV (Bangla & International)", 
    url: "https://raw.githubusercontent.com/abusaeeidx/Mrgify-Tv/refs/heads/main/playlist.m3u" 
  },
  { 
    name: "Filoox BDIX Selected", 
    url: "https://raw.githubusercontent.com/v5on/filoox-bdix-selected/refs/heads/main/playlist.m3u" 
  },
  { 
    name: "Infosat International M3U", 
    url: "https://raw.githubusercontent.com/Koshwefull/Koshwefull/refs/heads/main/infosat.m3u" 
  },
  { 
    name: "Sydul TV", 
    url: "https://raw.githubusercontent.com/sydul104/main04/refs/heads/main/my" 
  }
];

export const IPTVApp = ({ onBack }: { onBack: () => void }) => {
  const [currentPlaylistUrl, setCurrentPlaylistUrl] = useState(PLAYLISTS_PRESETS[0].url);
  const [playlist, setPlaylist] = useState<IPTVPlaylist | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<IPTVChannel | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [history, setHistory] = useState<IPTVChannel[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Real-time Channel Status Checker states
  const [isCheckingStatuses, setIsCheckingStatuses] = useState(false);
  const [channelStatuses, setChannelStatuses] = useState<Record<string, "online" | "offline" | "checking">>({});
  const [checkerStats, setCheckerStats] = useState({ online: 0, offline: 0, total: 0 });

  // High-performance lazy render limit
  const [visibleCount, setVisibleCount] = useState(60);
  const [isPlaylistDropdownOpen, setIsPlaylistDropdownOpen] = useState(false);

  // Load favorites and history from localStorage
  useEffect(() => {
    const savedFavs = localStorage.getItem("fahim_iptv_favorites");
    if (savedFavs) setFavorites(JSON.parse(savedFavs));

    const savedHistory = localStorage.getItem("fahim_iptv_history");
    if (savedHistory) setHistory(JSON.parse(savedHistory));

    // Load initial Fahim preset
    loadPlaylistFromUrl(PLAYLISTS_PRESETS[0].url);
  }, []);

  // Reset limit when filters, categories or playlist changes to keep layout lightning fast
  useEffect(() => {
    setVisibleCount(60);
    // Clear checking statuses on source switch
    setChannelStatuses({});
    setIsCheckingStatuses(false);
  }, [activeCategory, searchQuery, playlist]);

  const saveFavorites = (newFavs: string[]) => {
    setFavorites(newFavs);
    localStorage.setItem("fahim_iptv_favorites", JSON.stringify(newFavs));
  };

  const saveHistory = (channel: IPTVChannel) => {
    const newHistory = [channel, ...history.filter(c => c.url !== channel.url)].slice(0, 20);
    setHistory(newHistory);
    localStorage.setItem("fahim_iptv_history", JSON.stringify(newHistory));
  };

  const loadPlaylistFromUrl = async (url: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch playlist data");
      const text = await response.text();
      const parsed = parseM3U(text);
      setPlaylist(parsed);
      setActiveCategory("All");
    } catch (err) {
      setError("This playlist has failed to load due to CORS limit. Try another channel list or upload your own .m3u file!");
    } finally {
      setLoading(false);
    }
  };

  const runStatusCheck = async () => {
    if (isCheckingStatuses || !playlist || visibleChannels.length === 0) return;
    setIsCheckingStatuses(true);
    
    const targets = [...visibleChannels];
    setCheckerStats({ online: 0, offline: 0, total: targets.length });

    // Mark all target channels as loading/checking in state
    setChannelStatuses(prev => {
      const copy = { ...prev };
      targets.forEach(ch => {
        copy[ch.url] = "checking";
      });
      return copy;
    });

    let currentOnline = 0;
    let currentOffline = 0;

    // Check with safe concurrent rate
    const limit = 8;
    for (let i = 0; i < targets.length; i += limit) {
      const chunk = targets.slice(i, i + limit);
      await Promise.all(
        chunk.map(async (channel) => {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5500);

            // Fetch stream meta-info safely with no-cors so it doesn't get blocked by CORS policy.
            // On-line servers will hit a success response even under opaque restrictions, while offline will reject/timeout.
            await fetch(channel.url, {
              method: "GET",
              mode: "no-cors",
              signal: controller.signal,
              cache: "no-cache"
            });

            clearTimeout(timeoutId);
            setChannelStatuses(prev => ({ ...prev, [channel.url]: "online" }));
            currentOnline++;
            setCheckerStats(prev => ({ ...prev, online: currentOnline }));
          } catch (e) {
            setChannelStatuses(prev => ({ ...prev, [channel.url]: "offline" }));
            currentOffline++;
            setCheckerStats(prev => ({ ...prev, offline: currentOffline }));
          }
        })
      );
    }
    
    setIsCheckingStatuses(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseM3U(text);
        parsed.name = file.name;
        setPlaylist(parsed);
        setActiveCategory("All");
      } catch (err) {
        setError("Failed to parse the uploaded M3U file. Please make sure it is valid.");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
  };

  const filteredChannels = useMemo(() => {
    if (!playlist) return [];
    
    let base = playlist.channels;
    
    if (activeCategory === "Favorites") {
      base = base.filter(c => favorites.includes(c.url));
    } else if (activeCategory === "Recently Watched") {
      base = history;
    } else if (activeCategory !== "All") {
      base = base.filter(c => c.group === activeCategory);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      base = base.filter(c => 
        c.name.toLowerCase().includes(q) || 
        c.group.toLowerCase().includes(q)
      );
    }

    return base;
  }, [playlist, activeCategory, searchQuery, favorites, history]);

  const visibleChannels = useMemo(() => {
    return filteredChannels.slice(0, visibleCount);
  }, [filteredChannels, visibleCount]);

  const categoryCounts = useMemo(() => {
    if (!playlist) return {};
    const counts: Record<string, number> = {};
    playlist.channels.forEach(ch => {
      counts[ch.group] = (counts[ch.group] || 0) + 1;
    });
    return counts;
  }, [playlist]);

  const toggleFavorite = (url: string) => {
    const newFavs = favorites.includes(url) 
      ? favorites.filter(u => u !== url) 
      : [...favorites, url];
    saveFavorites(newFavs);
  };

  const handleChannelSelect = (channel: IPTVChannel) => {
    setSelectedChannel(channel);
    saveHistory(channel);
    // On mobile, auto-shuts sidebar when viewing live media feed
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const handleGridScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const { scrollTop, scrollHeight, clientHeight } = container;
    
    // Automatically fetch and render more chunks if users scroll near the bottom
    if (scrollHeight - scrollTop - clientHeight < 350) {
      if (visibleCount < filteredChannels.length) {
        setVisibleCount(prev => prev + 60);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col font-sans text-white overflow-hidden">
      {/* Premium Glass Atmosphere */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[140px]" />
      </div>

      {/* Header */}
      <header className="relative z-15 border-b border-white/10 bg-black/70 backdrop-blur-xl px-4 md:px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={onBack}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 active:scale-95"
            title="Return to Portfolios"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <Tv className="w-4 h-4 text-white animate-pulse" />
            </div>
            <h1 className="font-display font-black text-lg tracking-wider hidden sm:block bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Fahim IPTV</h1>
          </div>
        </div>

        {/* Preset Selector Dropdown */}
        <div className="relative flex items-center gap-2 max-w-full z-40">
          <Radio className="w-3.5 h-3.5 text-blue-400 animate-pulse shrink-0" />
          <div className="relative">
            <button
              onClick={() => setIsPlaylistDropdownOpen(!isPlaylistDropdownOpen)}
              className="bg-neutral-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white/95 hover:border-white/25 transition-all font-bold flex items-center gap-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 cursor-pointer max-w-[170px] sm:max-w-xs"
            >
              <span className="truncate text-left shrink">
                {PLAYLISTS_PRESETS.find(p => p.url === currentPlaylistUrl)?.name || "Select Playlist"}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-white/40 transition-transform ${isPlaylistDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isPlaylistDropdownOpen && (
              <>
                {/* Backdrop click closer spacer */}
                <div 
                  className="fixed inset-0 z-40 cursor-default" 
                  onClick={() => setIsPlaylistDropdownOpen(false)}
                />
                
                {/* Custom dropdown elements constrained inside UI with absolute centering and responsive sizes */}
                <div 
                  className="absolute left-1/2 -translate-x-1/2 sm:left-auto sm:-right-2 sm:translate-x-0 mt-2 w-[85vw] max-w-[320px] bg-neutral-950 border border-white/15 rounded-2xl p-2 shadow-2xl backdrop-blur-2xl space-y-1 z-55 overflow-y-auto max-h-[300px] no-scrollbar animate-in fade-in duration-100"
                >
                  <div className="px-2 py-1.5 text-[9px] uppercase tracking-wider font-extrabold text-white/40 border-b border-white/5 mb-1 flex items-center justify-between">
                    <span>Playlist Databases</span>
                    <span className="text-indigo-400">Secure M3U</span>
                  </div>
                  {PLAYLISTS_PRESETS.map((preset) => {
                    const isActive = preset.url === currentPlaylistUrl;
                    return (
                      <button
                        key={preset.url}
                        onClick={() => {
                          setCurrentPlaylistUrl(preset.url);
                          loadPlaylistFromUrl(preset.url);
                          setIsPlaylistDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-2 text-left px-2.5 py-2.5 rounded-xl text-[11px] font-bold transition-all relative ${
                          isActive 
                            ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/25" 
                            : "text-white/70 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <span className="line-clamp-2 leading-snug shrink">
                          {preset.name}
                        </span>
                        {isActive && (
                          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Global actions: upload custom M3U */}
        <div className="flex items-center gap-2 shrink-0">
          <label className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer text-xs font-semibold select-none active:scale-95">
            <Upload className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden md:inline">Upload M3U</span>
            <input 
              type="file" 
              accept=".m3u" 
              onChange={handleFileUpload} 
              className="hidden" 
            />
          </label>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 md:flex hidden"
            title="Toggle Sidebar"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="relative z-10 flex-grow flex overflow-hidden">
        {/* Sidebar / Categories - Hidden or Collapsible */}
        <motion.aside 
          initial={false}
          animate={{ width: isSidebarOpen ? 260 : 0, opacity: isSidebarOpen ? 1 : 0 }}
          className={`shrink-0 h-full bg-neutral-950/95 md:bg-white/[0.01] border-r border-white/5 backdrop-blur-2xl md:backdrop-blur-none overflow-hidden transition-all duration-200 hidden md:block`}
        >
          <div className="p-4 space-y-1 overflow-y-auto h-full no-scrollbar w-[260px]">
             <div className="px-3 py-2 text-[10px] uppercase tracking-widest font-black text-white/30 flex items-center justify-between mb-2">
               <span>Categories list</span>
               <span className="bg-white/5 px-2 py-0.5 rounded text-[9px] lowercase font-normal">{playlist?.channels.length || 0} tv feeds</span>
             </div>
             
             {/* Default category bookmarks */}
             {[
               { id: "All", name: "All Channels", icon: Tv, count: playlist?.channels.length || 0 },
               { id: "Favorites", name: "Favorites Feed", icon: Heart, count: favorites.length },
               { id: "Recently Watched", name: "Recently Watched", icon: History, count: history.length }
             ].map(item => (
               <button
                 key={item.id}
                 onClick={() => setActiveCategory(item.id)}
                 className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all group ${activeCategory === item.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}
               >
                 <item.icon className={`w-4 h-4 ${activeCategory === item.id ? 'text-white' : 'text-white/40 group-hover:text-white'}`} />
                 <span className="truncate">{item.name}</span>
                 <span className="ml-auto text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-white/50 group-hover:text-white">
                   {item.count}
                 </span>
               </button>
             ))}

             <div className="h-[2px] bg-white/5 my-4" />

             {/* Dynamic category tabs */}
             {playlist?.categories.filter(c => c !== "All" && c !== "Favorites" && c !== "Recently Watched").map(cat => {
               const count = categoryCounts[cat] || 0;
               return (
                 <button
                   key={cat}
                   onClick={() => setActiveCategory(cat)}
                   className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${activeCategory === cat ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}
                 >
                   <Tv className="w-3.5 h-3.5 text-white/30 group-hover:text-white" />
                   <span className="truncate">{cat}</span>
                   <span className="ml-auto text-[10px] bg-white/5 px-2 py-0.5 rounded-full text-white/30 group-hover:text-white">
                     {count}
                   </span>
                 </button>
               );
             })}
          </div>
        </motion.aside>

        {/* Main Content Area */}
        <main className="flex-grow flex flex-col overflow-hidden relative">
          
          {/* Mobile Category Horizontal Scrolling View */}
          <div className="md:hidden w-full overflow-x-auto no-scrollbar flex items-center gap-1.5 px-4 py-2.5 border-b border-white/5 bg-white/[0.01]">
            {[
              { id: "All", name: "All Channels", count: playlist?.channels.length || 0 },
              { id: "Favorites", name: "Favorites", count: favorites.length },
              { id: "Recently Watched", name: "History", count: history.length },
              ...(playlist?.categories.filter(c => c !== "All" && c !== "Favorites" && c !== "Recently Watched").map(c => ({
                id: c,
                name: c,
                count: categoryCounts[c] || 0
              })) || [])
            ].map(item => (
              <button
                key={`mob-cat-${item.id}`}
                onClick={() => setActiveCategory(item.id)}
                className={`flex items-center gap-1 whitespace-nowrap px-3.5 py-1.5 rounded-full text-[11px] font-bold transition-all ${
                  activeCategory === item.id 
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                    : "bg-white/5 text-white/50 border border-white/5 hover:text-white"
                }`}
              >
                <span>{item.name}</span>
                <span className="text-[9px] opacity-40">({item.count})</span>
              </button>
            ))}
          </div>

          {/* Search bar inside header / main area on mobile */}
          <div className="p-3 md:p-4 border-b border-white/5 bg-white/[0.01]">
            <div className="flex flex-col gap-3">
              <div className="relative max-w-lg">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input 
                  type="text" 
                  placeholder={`Search ${filteredChannels.length} ${activeCategory === 'All' ? 'global' : activeCategory} stream feeds...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-2.5 pl-11 pr-4 text-sm font-medium focus:outline-none focus:border-indigo-500/50 transition-all text-white placeholder-white/30"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Fahim's Premium Curated Info Banner */}
              <div className="flex items-start gap-2 p-2 sm:p-3.5 rounded-xl sm:rounded-2xl bg-indigo-950/20 border border-indigo-500/20 text-[10px] sm:text-xs text-white/70">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <span className="font-extrabold text-white text-[9px] sm:text-[11px] uppercase tracking-wider bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20 mr-1.5 inline-block mb-0.5 sm:mb-0">
                    FAHIM PREMIUM SECURE STREAMING
                  </span>
                  <span className="leading-snug">
                    Welcome to <strong className="text-indigo-400">Fahim's Live TV</strong>. Access live television, sports, movies & entertainment feeds with status checks.
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-grow flex flex-col md:flex-row overflow-hidden relative">
             
             {/* Mobile-First Floating/Sticky Player: Always stuck to top if playing on phone screen */}
             {selectedChannel && (
               <div className="md:hidden w-full shrink-0 bg-neutral-950 border-b border-white/15 sticky top-0 z-40">
                 <div className="p-3 flex items-center justify-between bg-black/40">
                   <div className="flex items-center gap-2 overflow-hidden max-w-[80%]">
                     <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                     <span className="text-xs font-bold truncate text-white">{selectedChannel.name}</span>
                   </div>
                   <button 
                     onClick={() => setSelectedChannel(null)}
                     className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all active:scale-95"
                   >
                     <X className="w-4 h-4" />
                   </button>
                 </div>
                 <div className="w-full aspect-video">
                   <VideoPlayer url={selectedChannel.url} poster={selectedChannel.logo} />
                 </div>
               </div>
             )}

             {/* Channel Grid Container: Handles lazy dynamic scrolling */}
             <div 
               onScroll={handleGridScroll}
               className={`flex-grow overflow-y-auto no-scrollbar p-3 md:p-6 transition-all ${selectedChannel ? 'md:w-1/2' : 'w-full'}`}
             >
                {loading ? (
                  <div className="h-full min-h-[300px] flex flex-col items-center justify-center space-y-4">
                    <div className="w-14 h-14 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                    <div className="text-center space-y-1">
                      <p className="text-white/60 font-bold text-sm tracking-wide">Syncing Channel List...</p>
                      <p className="text-white/30 text-xs">Parsing HLS feeds and dynamic categories</p>
                    </div>
                  </div>
                ) : error ? (
                  <div className="h-full min-h-[300px] flex flex-col items-center justify-center p-8 text-center max-w-sm mx-auto">
                    <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4 border border-red-500/20">
                      <AlertCircle className="w-7 h-7 text-red-500" />
                    </div>
                    <h3 className="text-base font-bold text-white mb-2">Feed Connection Error</h3>
                    <p className="text-white/40 text-xs leading-relaxed mb-6">{error}</p>
                    <button 
                      onClick={() => loadPlaylistFromUrl(PLAYLISTS_PRESETS[0].url)}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 transition-all text-white rounded-full font-bold text-xs shadow-lg shadow-indigo-600/20 active:scale-95"
                    >
                      Reload Default Bangla Streams
                    </button>
                  </div>
                ) : visibleChannels.length === 0 ? (
                  <div className="h-full min-h-[250px] flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4 text-white/30">
                      <Tv className="w-6 h-6" />
                    </div>
                    <p className="text-white/50 text-sm font-bold">No TV Channels Found</p>
                    <p className="text-white/30 text-xs max-w-xs mt-1">Try dropping queries, changing category, or selecting another preset source link.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Live Stream Status Checker Panel */}
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                          <h3 className="font-bold text-xs uppercase tracking-wider text-white">Live Status Checker / Scanner</h3>
                        </div>
                        <p className="text-[10px] text-white/50 leading-normal">
                          Audits and verifies physical stream servers in real-time. Scan your active page to identify active channels.
                        </p>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3">
                        {isCheckingStatuses ? (
                          <div className="flex items-center gap-2 bg-indigo-600/20 border border-indigo-500/30 px-3 py-1.5 rounded-xl">
                            <div className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                            <span className="text-[11px] font-bold text-indigo-400 animate-pulse">
                              Auditing ({checkerStats.online + checkerStats.offline}/{checkerStats.total})...
                            </span>
                          </div>
                        ) : (
                          <button
                            onClick={runStatusCheck}
                            className="px-4 py-2 hover:bg-indigo-500 bg-indigo-600 text-white rounded-xl font-bold text-xs transition-all active:scale-95 shadow-md border border-white/5"
                          >
                            Scan current visible streams ({visibleChannels.length})
                          </button>
                        )}

                        {checkerStats.total > 0 && (
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              {checkerStats.online} Online
                            </span>
                            <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                              {checkerStats.offline} Offline
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-white/40 border-b border-white/5 pb-2">
                      <span className="font-semibold uppercase tracking-wider">{activeCategory} Category</span>
                      <span>Showing {visibleChannels.length} of {filteredChannels.length} feeds</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                      {visibleChannels.map((channel, idx) => {
                        const status = channelStatuses[channel.url];
                        return (
                          <motion.div
                            layout
                            key={channel.id || `${channel.url}-${idx}`}
                            onClick={() => handleChannelSelect(channel)}
                            className={`group relative flex flex-col items-center p-3 rounded-2xl border cursor-pointer transition-all ${
                              selectedChannel?.url === channel.url 
                                ? 'bg-indigo-600/15 border-indigo-500/60 ring-2 ring-indigo-500/30' 
                                : 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/[0.08]'
                            }`}
                          >
                             {/* Logos Container */}
                             <div className="relative w-full aspect-video bg-neutral-900 rounded-xl overflow-hidden mb-2.5 flex items-center justify-center">
                               {channel.logo ? (
                                 <img 
                                   src={channel.logo} 
                                   alt={channel.name} 
                                   referrerPolicy="no-referrer"
                                   className="w-full h-full object-contain p-2 max-h-[85%] group-hover:scale-105 transition-transform duration-300" 
                                 />
                               ) : (
                                 <div className="flex flex-col items-center gap-1 text-white/10 group-hover:text-white/30 transition-colors">
                                   <Radio className="w-7 h-7" />
                                 </div>
                               )}
                               <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                  <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-xl scale-75 group-hover:scale-100 transition-all duration-300">
                                    <Play className="w-4 h-4 fill-current ml-0.5" />
                                  </div>
                               </div>
                               
                               {/* Real-time Status Badge */}
                               {status === "online" && (
                                 <div className="absolute top-1.5 left-1.5 bg-emerald-600 px-1.5 py-0.5 rounded text-[8px] font-bold text-white flex items-center gap-1 z-10 shadow-lg shadow-emerald-600/20">
                                   <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
                                   ONLINE
                                 </div>
                               )}
                               {status === "offline" && (
                                 <div className="absolute top-1.5 left-1.5 bg-rose-600 px-1.5 py-0.5 rounded text-[8px] font-bold text-white flex items-center gap-1 z-10 shadow-lg shadow-rose-600/20">
                                   <span className="w-1 h-1 rounded-full bg-white" />
                                   OFFLINE
                                 </div>
                               )}
                               {status === "checking" && (
                                 <div className="absolute top-1.5 left-1.5 bg-amber-500 px-1.5 py-0.5 rounded text-[8px] font-bold text-neutral-950 flex items-center gap-1 z-10 animate-pulse">
                                   <span className="w-1 h-1 rounded-full bg-neutral-950 animate-ping" />
                                   SCANNING
                                 </div>
                               )}
                               {!status && (
                                 <div className="absolute bottom-1.5 left-1.5 bg-black/60 px-1.5 py-0.5 rounded text-[8px] font-semibold text-white/60 tracking-wider">
                                   LIVE
                                 </div>
                               )}
                             </div>

                             {/* Name Label */}
                             <p className="w-full text-[11px] font-bold text-center truncate px-1 text-white/80 group-hover:text-indigo-400 transition-colors">
                               {channel.name}
                             </p>

                             {/* Add Favorites Toggle Pin */}
                             <button 
                               onClick={(e) => {
                                 e.stopPropagation();
                                 toggleFavorite(channel.url);
                               }}
                               className={`absolute top-2 right-2 p-1.5 rounded-lg backdrop-blur-md transition-all ${
                                 favorites.includes(channel.url) ? 'bg-red-500 text-white' : 'bg-black/65 text-white/40 opacity-0 group-hover:opacity-100 hover:bg-indigo-600 hover:text-white'
                               }`}
                               title={favorites.includes(channel.url) ? "Remove from Favorites" : "Bookmark Channel"}
                             >
                               <Heart className={`w-3 h-3 ${favorites.includes(channel.url) ? 'fill-current' : ''}`} />
                             </button>
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* Infinite continuous scrolling visual hook */}
                    {filteredChannels.length > visibleCount && (
                      <div className="col-span-full py-8 flex flex-col items-center justify-center gap-2 border-t border-white/5 mt-8">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                        <span className="text-[10px] text-white/30 font-bold uppercase tracking-wider">Scroll Down or Tap to Load More Streams</span>
                        <button 
                          onClick={() => setVisibleCount(prev => prev + 60)}
                          className="mt-2 px-5 py-2.5 rounded-full bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white text-xs font-bold transition-all border border-indigo-500/20 active:scale-95"
                        >
                          Show {Math.min(60, filteredChannels.length - visibleCount)} More of {filteredChannels.length - visibleCount} Channels
                        </button>
                      </div>
                    )}
                  </div>
                )}
             </div>

             {/* Desktop Premium Sidebar Video Player Area */}
             <AnimatePresence>
               {selectedChannel && (
                 <motion.div 
                   initial={{ x: '100%', opacity: 0 }}
                   animate={{ x: 0, opacity: 1 }}
                   exit={{ x: '100%', opacity: 0 }}
                   transition={{ type: "spring", damping: 25, stiffness: 120 }}
                   className="hidden md:flex absolute right-0 top-0 bottom-0 md:relative md:inset-auto md:w-1/2 h-full z-30 bg-neutral-950 flex-col border-l border-white/10 shadow-[2px_0_40px_rgba(0,0,0,0.8)]"
                 >
                   <div className="p-4 flex items-center justify-between border-b border-white/5 bg-white/[0.01]">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center shrink-0">
                          <Radio className="w-4 h-4 text-indigo-400 animate-pulse" />
                        </div>
                        <div className="truncate">
                          <h4 className="text-xs font-bold truncate text-white">{selectedChannel.name}</h4>
                          <span className="text-[9px] text-[#A5B4FC] font-black uppercase tracking-widest">{selectedChannel.group}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => setSelectedChannel(null)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-white/60 hover:text-white transition-all active:scale-95"
                      >
                        <X className="w-4 h-4" />
                      </button>
                   </div>
                   
                   <div className="flex-grow p-4 md:p-6 flex items-center justify-center bg-black/20">
                     <VideoPlayer url={selectedChannel.url} poster={selectedChannel.logo} />
                   </div>

                   <div className="p-6 bg-white/[0.01] space-y-4 border-t border-white/5">
                      <div className="flex gap-4">
                         <button 
                           onClick={() => toggleFavorite(selectedChannel.url)}
                           className={`flex-grow flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-xs transition-all ${favorites.includes(selectedChannel.url) ? 'bg-red-500/15 text-red-500 border border-red-500/20' : 'bg-white/5 border border-white/15 hover:bg-white/10'}`}
                         >
                           <Heart className={`w-4 h-4 ${favorites.includes(selectedChannel.url) ? 'fill-current' : ''}`} />
                           {favorites.includes(selectedChannel.url) ? 'Remove Favorite' : 'Add to Favorites'}
                         </button>
                      </div>
                      
                      <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
                         <div className="flex items-center justify-between mb-1.5">
                           <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Network Speed Optimization</p>
                           <span className="text-[9px] bg-green-500/10 text-green-400 font-bold px-1.5 py-0.5 rounded">Active</span>
                         </div>
                         <div className="flex items-start gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping mt-1.5 shrink-0" />
                           <p className="text-[11px] text-white/50 leading-relaxed">
                             Streaming feed parsed successfully. HLS.js adaptive fallback buffer size configured at 90 seconds.
                           </p>
                         </div>
                      </div>
                   </div>
                 </motion.div>
               )}
             </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};
