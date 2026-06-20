/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from "motion/react";
import { 
  Tv, Search, Heart, History,
  ChevronLeft, Upload, X, Play,
  Menu, Info, Radio, AlertCircle, Sparkles,
  Activity, ShieldCheck, ExternalLink, Award, ChevronDown,
  Home, LayoutGrid, AlertTriangle
} from "lucide-react";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { IPTVChannel, IPTVPlaylist } from "../types";
import { parseM3U } from "../lib/parser";
import { VideoPlayer } from "./VideoPlayer";

// Helper function to extract channel metadata (country flag, country code, HD status)
const getChannelBadges = (channel: IPTVChannel) => {
  const nameLower = channel.name.toLowerCase();
  const isHD = nameLower.includes("hd") || nameLower.includes("fhd") || nameLower.includes("1080p") || nameLower.includes("4k") || nameLower.includes("uhd") || nameLower.includes("hevc");
  const is4K = nameLower.includes("4k") || nameLower.includes("uhd");
  
  // Custom smart country detection logic
  let country = "INT";
  let flag = "🌐";
  const text = (channel.name + " " + channel.group).toLowerCase();
  if (text.includes("bangla") || text.includes("bd ") || text.includes("bd-") || text.includes("bangladesh") || text.includes("dhaka") || text.includes("somoy")) {
    country = "BD";
    flag = "🇧🇩";
  } else if (text.includes("india") || text.includes("hindi") || text.includes("jalsha") || text.includes("kolkata") || text.includes("sony") || text.includes("star") || text.includes("zee")) {
    country = "IN";
    flag = "🇮🇳";
  } else if (text.includes("usa") || text.includes("us ") || text.includes("united states") || text.includes("america") || text.includes("hbo")) {
    country = "USA";
    flag = "🇺🇸";
  } else if (text.includes("uk ") || text.includes("united kingdom") || text.includes("british") || text.includes("bbc") || text.includes("gb")) {
    country = "UK";
    flag = "🇬🇧";
  } else if (text.includes("sports") || text.includes("football") || text.includes("fifa") || text.includes("cricket") || text.includes("t-sports")) {
    country = "Sports";
    flag = "⚽";
  } else {
    // Check if name has an emoji flag already
    const emojiRegex = /[\uD83C][\uDDE6-\uDDFF][\uD83C][\uDDE6-\uDDFF]/g;
    const match = channel.name.match(emojiRegex);
    if (match) {
      flag = match[0];
      country = "Local";
    }
  }
  
  return { isHD, is4K, country, flag };
};

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

// Premium, Netflix-Style mobile content card optimized for card ergonomics and smooth scrolling
const MobileChannelCard = React.memo(({ 
  channel, 
  idx, 
  selectedChannel, 
  handleChannelSelect, 
  status, 
  favorites, 
  toggleFavorite 
}: { 
  channel: IPTVChannel; 
  idx: number; 
  selectedChannel: IPTVChannel | null; 
  handleChannelSelect: (c: IPTVChannel) => void; 
  status: "online" | "offline" | "checking" | undefined; 
  favorites: string[]; 
  toggleFavorite: (url: string) => void; 
}) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const isFav = favorites.includes(channel.url);
  const isSelected = selectedChannel?.url === channel.url;
  const { isHD, is4K, country, flag } = getChannelBadges(channel);

  return (
    <motion.div
      whileTap={{ scale: 0.95 }}
      onClick={() => handleChannelSelect(channel)}
      className={`group relative flex flex-col p-2.5 rounded-2xl cursor-pointer select-none transition-all duration-300 ${
        isSelected 
          ? 'bg-indigo-600/20 border border-indigo-500 ring-1 ring-indigo-500/30' 
          : 'bg-[#141414] hover:bg-[#1f1f1f] border border-white/[0.04]'
      }`}
    >
      {/* Aspect Video Card Box */}
      <div className="relative w-full aspect-[4/3] bg-[#0c0c0c] rounded-xl overflow-hidden flex items-center justify-center border border-white/5">
        <div className={`absolute inset-0 transition-opacity duration-300 ${isSelected ? 'opacity-15 bg-indigo-500' : 'opacity-0'}`} />
        
        {channel.logo && !imgError ? (
          <>
            {!imgLoaded && (
              <div className="absolute inset-0 bg-white/[0.02] animate-pulse flex items-center justify-center">
                <Radio className="w-5 h-5 text-white/10" />
              </div>
            )}
            <img 
              src={channel.logo} 
              alt={channel.name} 
              referrerPolicy="no-referrer"
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
              className={`w-full h-full object-contain p-2 max-h-[85%] transition-all duration-300 ${
                imgLoaded ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
              }`} 
            />
          </>
        ) : (
          <div className="flex flex-col items-center gap-1.5 text-white/10 group-hover:text-indigo-400/40 transition-colors">
            <Radio className="w-7 h-7" />
            <span className="text-[8px] font-bold text-white/20 tracking-widest uppercase">STREAM</span>
          </div>
        )}

        {/* Floating Overlays */}
        <div className="absolute inset-x-2 top-2 flex items-center justify-between pointer-events-none z-10">
          {status === "online" ? (
            <span className="bg-emerald-500 text-[8px] font-black tracking-wider text-white px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow-md shadow-emerald-500/20">
              <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
              ON
            </span>
          ) : status === "offline" ? (
            <span className="bg-rose-600 text-[8px] font-black tracking-wider text-white px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow-md shadow-rose-600/20">
              <span className="w-1 h-1 rounded-full bg-white" />
              OFF
            </span>
          ) : status === "checking" ? (
            <span className="bg-amber-500 text-[8px] font-black tracking-wider text-neutral-950 px-1.5 py-0.5 rounded-md flex items-center gap-1 animate-pulse">
              CHECKING
            </span>
          ) : (
            <span className="bg-red-600 text-[8px] font-black tracking-wider text-white px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow-md shadow-red-600/20">
              <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
              LIVE
            </span>
          )}

          {isHD && (
            <span className="bg-white/10 backdrop-blur-md border border-white/10 text-[8px] font-black tracking-widest text-white px-1.5 py-0.5 rounded-md">
              {is4K ? '4K' : 'HD'}
            </span>
          )}
        </div>

        {/* Flag badge */}
        <div className="absolute inset-x-2 bottom-2 flex items-center justify-between pointer-events-none z-10">
          <span className="bg-black/75 backdrop-blur-md text-[9px] font-extrabold text-white px-1.5 py-0.5 rounded-md flex items-center gap-1">
            <span>{flag}</span>
            <span className="text-[7px] tracking-wider opacity-80">{country}</span>
          </span>
        </div>
      </div>

      {/* Metadata label */}
      <div className="mt-2 text-left">
        <h3 className="text-[11px] font-extrabold truncate text-white leading-tight pr-6 group-hover:text-indigo-400 transition-colors">
          {channel.name}
        </h3>
        <p className="text-[9px] text-white/40 truncate font-semibold">
          {channel.group || "Channels"}
        </p>
      </div>

      {/* Heart bookmark element */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          toggleFavorite(channel.url);
        }}
        className={`absolute bottom-1 right-1 p-1.5 rounded-full backdrop-blur-md transition-all active:scale-90 ${
          isFav 
            ? 'bg-rose-600 text-white shadow-md' 
            : 'bg-white/5 text-white/30 hover:bg-white/10 hover:text-white'
        }`}
        title="Bookmark"
      >
        <Heart className={`w-3 h-3 ${isFav ? 'fill-current' : ''}`} />
      </button>
    </motion.div>
  );
});

const ChannelCard = React.memo(({ 
  channel, 
  idx, 
  selectedChannel, 
  handleChannelSelect, 
  status, 
  favorites, 
  toggleFavorite 
}: { 
  channel: IPTVChannel; 
  idx: number; 
  selectedChannel: IPTVChannel | null; 
  handleChannelSelect: (c: IPTVChannel) => void; 
  status: "online" | "offline" | "checking" | undefined; 
  favorites: string[]; 
  toggleFavorite: (url: string) => void; 
}) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const isFav = favorites.includes(channel.url);
  const isSelected = selectedChannel?.url === channel.url;

  return (
    <motion.div
      layout
      whileTap={{ scale: 0.96 }}
      onClick={() => handleChannelSelect(channel)}
      className={`group relative flex flex-col items-center p-2.5 sm:p-3 rounded-2xl border cursor-pointer select-none transition-all ${
        isSelected 
          ? 'bg-indigo-600/20 border-indigo-500/80 ring-2 ring-indigo-500/20' 
          : 'bg-white/[0.03] border-white/5 hover:border-white/10 hover:bg-white/[0.08]'
      }`}
    >
       {/* Logos Container */}
       <div className="relative w-full aspect-video bg-neutral-900 rounded-xl overflow-hidden mb-2.5 flex items-center justify-center">
         {channel.logo && !imgError ? (
           <>
             {/* Shimmer skeleton while loading */}
             {!imgLoaded && (
               <div className="absolute inset-0 bg-white/[0.04] animate-pulse flex items-center justify-center">
                 <Radio className="w-5 h-5 text-white/10" />
               </div>
             )}
             <img 
               src={channel.logo} 
               alt={channel.name} 
               referrerPolicy="no-referrer"
               onLoad={() => setImgLoaded(true)}
               onError={() => setImgError(true)}
               className={`w-full h-full object-contain p-2 max-h-[85%] group-hover:scale-105 transition-all duration-300 ${
                 imgLoaded ? 'opacity-100' : 'opacity-0'
               }`} 
             />
           </>
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
       <p className="w-full text-[11px] font-bold text-center truncate px-1 text-white/85 group-hover:text-indigo-400 transition-colors">
         {channel.name}
       </p>

       {/* Add Favorites Toggle Pin */}
       <button 
         onClick={(e) => {
           e.stopPropagation();
           toggleFavorite(channel.url);
         }}
         className={`absolute top-2 right-2 p-1.5 rounded-lg backdrop-blur-md transition-all ${
           isFav ? 'bg-red-500 text-white' : 'bg-black/65 text-white/40 md:opacity-0 md:group-hover:opacity-100 hover:bg-indigo-600 hover:text-white'
         }`}
         title={isFav ? "Remove from Favorites" : "Bookmark Channel"}
       >
         <Heart className={`w-3 h-3 ${isFav ? 'fill-current' : ''}`} />
       </button>
    </motion.div>
  );
});

const PLAYLISTS_PRESETS = [
  { 
    name: "🌍 Fahim Global Universal (7500+ Channels)", 
    url: "https://raw.githubusercontent.com/SHAJON-404/iptv-playlist/refs/heads/main/app/data/channels.m3u" 
  },
  { 
    name: "🏆 Fahim Sports Premium (240+ Channels)", 
    url: "https://raw.githubusercontent.com/SHAJON-404/iptv-playlist/refs/heads/main/app/data/sports.m3u" 
  },
  { 
    name: "🇧🇩 Fahim Bangla Live (100+ Channels)", 
    url: "https://raw.githubusercontent.com/SHAJON-404/iptv-playlist/refs/heads/main/app/data/bangla.m3u" 
  },
  { 
    name: "⚽ Fahim FIFA Live Sports (7 Channels)", 
    url: "https://raw.githubusercontent.com/SHAJON-404/iptv-playlist/refs/heads/main/app/data/fifa.m3u" 
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

export const IPTVApp = ({ 
  onBack,
  initialPlaylistUrl,
  initialActiveCategory
}: { 
  onBack: () => void;
  initialPlaylistUrl?: string;
  initialActiveCategory?: string;
}) => {
  const [currentPlaylistUrl, setCurrentPlaylistUrl] = useState(() => initialPlaylistUrl || PLAYLISTS_PRESETS[0].url);
  const [playlist, setPlaylist] = useState<IPTVPlaylist | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<IPTVChannel | null>(null);
  const [activeCategory, setActiveCategory] = useState(() => initialActiveCategory || "All");
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [history, setHistory] = useState<IPTVChannel[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playlistWarning, setPlaylistWarning] = useState<string | null>(null);
  
  // Real-time Channel Status Checker states
  const [isCheckingStatuses, setIsCheckingStatuses] = useState(false);
  const [channelStatuses, setChannelStatuses] = useState<Record<string, "online" | "offline" | "checking">>({});
  const [checkerStats, setCheckerStats] = useState({ online: 0, offline: 0, total: 0 });

  // High-performance lazy render limit
  const [visibleCount, setVisibleCount] = useState(60);
  const [isPlaylistDropdownOpen, setIsPlaylistDropdownOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<"home" | "browse" | "favorites" | "history">("home");

  // Netflix-style curated vertical sections computed from the currently loaded playlist
  const homeSections = useMemo(() => {
    if (!playlist) return { popular: [], sports: [], news: [], entertainment: [] };
    
    const chans = playlist.channels || [];
    
    // Choose the trending first 10 assets
    const popular = chans.slice(0, 10);
    
    // Extract live sports
    const sports = chans.filter(c => {
      const text = (c.name + " " + c.group).toLowerCase();
      return text.includes("sports") || text.includes("cricket") || text.includes("football") || text.includes("t-sports") || text.includes("fifa") || text.includes("world cup");
    }).slice(0, 10);
    
    // Extract live news channels
    const news = chans.filter(c => {
      const text = (c.name + " " + c.group).toLowerCase();
      return text.includes("news") || text.includes("somoy") || text.includes("jamuna") || text.includes("independent") || text.includes("republic") || text.includes("bbc") || text.includes("cnn");
    }).slice(0, 10);
    
    // Extract movies & premium entertainment
    const entertainment = chans.filter(c => {
      const text = (c.name + " " + c.group).toLowerCase();
      return text.includes("movies") || text.includes("cinema") || text.includes("jalsha") || text.includes("zee") || text.includes("drama") || text.includes("box office") || text.includes("star");
    }).slice(0, 10);

    return { popular, sports, news, entertainment };
  }, [playlist]);

  // Choose a high-quality featured channel for the hero showcase banner
  const featuredChannel = useMemo(() => {
    if (!playlist || playlist.channels.length === 0) return null;
    const chans = playlist.channels;
    
    // Try to find a sports or hd broadcast first, otherwise fall back to first channel
    const sports = chans.find(c => c.name.toLowerCase().includes("sports") || c.name.toLowerCase().includes("t-sports"));
    if (sports) return sports;
    
    const pro = chans.find(c => c.name.toLowerCase().includes("pro") || c.name.toLowerCase().includes("hd"));
    if (pro) return pro;
    
    return chans[0];
  }, [playlist]);

  // Load favorites and history from localStorage
  useEffect(() => {
    const savedFavs = localStorage.getItem("fahim_iptv_favorites");
    if (savedFavs) setFavorites(JSON.parse(savedFavs));

    const savedHistory = localStorage.getItem("fahim_iptv_history");
    if (savedHistory) setHistory(JSON.parse(savedHistory));

    // Load initial Fahim preset
    const targetUrl = initialPlaylistUrl || PLAYLISTS_PRESETS[0].url;
    setCurrentPlaylistUrl(targetUrl);
    if (initialActiveCategory) {
      setActiveCategory(initialActiveCategory);
    }
    loadPlaylistFromUrl(targetUrl);
  }, [initialPlaylistUrl, initialActiveCategory]);

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

const DEFAULT_CHANNELS: IPTVChannel[] = [
  { id: "redbull-sports", name: "🏆 Red Bull TV Sports Stream", group: "FIFA Sports", url: "https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8", logo: "https://i.ibb.co/xL3nJbB/fifa-icon.png" },
  { id: "aljazeera", name: "📺 Al Jazeera English Live", group: "Global TV", url: "https://live-hls-web-aje.getaj.net/AJE/index.m3u8", logo: "https://i.ibb.co/xL3nJbB/fifa-icon.png" },
  { id: "dw-news", name: "📰 DW News English Feed", group: "Global TV", url: "https://dwamdstream102.akamaized.net/hls/live/2014190/dwstream102/index.m3u8", logo: "https://i.ibb.co/xL3nJbB/fifa-icon.png" },
  { id: "france24", name: "⚡ France 24 English", group: "Global TV", url: "https://static.france24.com/live/F24_EN_LO_HLS/live_web.m3u8", logo: "https://i.ibb.co/xL3nJbB/fifa-icon.png" }
];

  const loadPlaylistFromUrl = async (url: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(getCorsSafeUrl(url));
      if (!response.ok) throw new Error("Failed to fetch playlist data");
      const text = await response.text();
      const parsed = parseM3U(text);
      
      // Ensure IDs are present
      parsed.channels = parsed.channels.map(c => ({
        ...c,
        id: c.id || Math.random().toString(36).substring(2, 11)
      }));

      setPlaylist(parsed);
      setActiveCategory("All");
      setVisibleCount(60);
      setPlaylistWarning(null);
    } catch (err) {
      console.error("Playlist load error, falling back to defaults", err);
      setPlaylist({ 
        name: "Default Playlist", 
        channels: DEFAULT_CHANNELS, 
        categories: ["All", "Favorites", "Recently Watched", "FIFA Sports", "Global TV"] 
      });
      setActiveCategory("All");
      setVisibleCount(60);
      setError(null);
      setPlaylistWarning("The selected remote playlist is currently offline or CORS-restricted. Loaded default high-quality sports & news channels instead.");
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
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return base.filter(c => 
        c.name.toLowerCase().includes(q) || 
        c.group.toLowerCase().includes(q)
      );
    }

    if (activeCategory === "Favorites") {
      base = base.filter(c => favorites.includes(c.url));
    } else if (activeCategory === "Recently Watched") {
      base = history;
    } else if (activeCategory !== "All") {
      base = base.filter(c => c.group === activeCategory);
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
      <header className={`relative z-15 border-b border-white/10 bg-black/70 backdrop-blur-xl px-3 md:px-6 py-2.5 md:py-4 flex items-center justify-between gap-4 ${selectedChannel ? 'hidden md:flex' : 'flex'}`}>
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={onBack}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 active:scale-95"
            title="Return to Portfolios"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-red-600 flex items-center justify-center shadow-lg shadow-red-650/40 border border-red-500/25 active:scale-95 transition-all">
              <span className="font-display font-black text-white text-[16px] tracking-tighter select-none leading-none filter drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]">F</span>
            </div>
            <h1 className="font-display font-black text-lg tracking-tighter hidden sm:block bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent uppercase">
              FAHIM <span className="text-white font-medium">IPTV</span>
            </h1>
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
             {(playlist?.categories || []).filter(c => c !== "All" && c !== "Favorites" && c !== "Recently Watched").map(cat => {
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
          
          {/* Search bar inside header / main area on mobile & category chips */}
          <div className={`p-3.5 md:p-4 border-b border-white/5 bg-white/[0.01] ${selectedChannel ? 'hidden md:block' : 'block'}`}>
            <div className="flex flex-col gap-3">
              {/* Full Width Search Input */}
              <div className="relative w-full md:max-w-lg">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-white/30" />
                <input 
                  type="text" 
                  placeholder={`Search ${playlist?.channels.length || ""} premium stream feeds...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#141414] border border-white/10 rounded-2xl py-3 pl-11 pr-10 text-xs font-semibold focus:outline-none focus:border-indigo-500 transition-all text-white placeholder-white/30"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white bg-white/5 p-1 rounded-full text-xs"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Dynamic Category Chips below Search (Mobile only) */}
              {!selectedChannel && (
                <div className="md:hidden w-full overflow-x-auto no-scrollbar flex items-center gap-1.5 py-1">
                  {[
                    { id: "All", name: "All Channels", count: playlist?.channels.length || 0 },
                    { id: "Favorites", name: "Favorites", count: favorites.length },
                    { id: "Recently Watched", name: "History", count: history.length },
                    ...((playlist?.categories || []).filter(c => c !== "All" && c !== "Favorites" && c !== "Recently Watched").map(c => ({
                      id: c,
                      name: c,
                      count: categoryCounts[c] || 0
                    })))
                  ].map(item => (
                    <button
                      key={`mob-cat-chips-${item.id}`}
                      onClick={() => {
                        setActiveCategory(item.id);
                        if (mobileTab !== "browse" && item.id !== "Favorites" && item.id !== "Recently Watched") {
                          setMobileTab("browse");
                        }
                        if (item.id === "Favorites") {
                          setMobileTab("favorites");
                        }
                        if (item.id === "Recently Watched") {
                          setMobileTab("history");
                        }
                      }}
                      className={`flex items-center gap-1.5 whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                        (activeCategory === item.id) || (item.id === "Favorites" && mobileTab === "favorites") || (item.id === "Recently Watched" && mobileTab === "history")
                          ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/25" 
                          : "bg-[#141414] text-white/50 border-white/5 hover:text-white"
                      }`}
                    >
                      <span>{item.name}</span>
                      <span className="text-[10px] opacity-40">({item.count})</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Fahim's Premium Curated Info Banner (Desktop Only) */}
              <div className="hidden md:flex items-start gap-2 p-3.5 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 text-xs text-white/70">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <span className="font-extrabold text-white text-[11px] uppercase tracking-wider bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20 mr-1.5 inline-block mb-0">
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
               <div className="md:hidden w-full shrink-0 bg-[#0F0F0F] border-b border-white/10 sticky top-0 z-40">
                 {/* Video Player */}
                 <div className="w-full aspect-video relative">
                   <VideoPlayer url={selectedChannel.url} poster={selectedChannel.logo} />
                 </div>

                 {/* Video Metadata & Controls (Like YouTube Mobile) */}
                 <div className="p-3.5 bg-[#0F0F0F] flex flex-col gap-2">
                   <div className="flex items-start justify-between gap-3">
                     <div className="overflow-hidden min-w-0 pr-2">
                       <h1 className="text-sm font-extrabold text-white leading-tight">
                         {selectedChannel.name}
                       </h1>
                       <div className="flex items-center gap-1.5 mt-1">
                         <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                         <span className="text-[10px] text-white/40 uppercase font-black tracking-widest">{selectedChannel.group}</span>
                       </div>
                     </div>
                     <button 
                       onClick={() => setSelectedChannel(null)}
                       className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all active:scale-90 shrink-0"
                       title="Close Player"
                     >
                       <X className="w-4 h-4" />
                     </button>
                   </div>

                   <div className="flex items-center gap-2 mt-2">
                     <button 
                       onClick={() => toggleFavorite(selectedChannel.url)}
                       className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-bold text-xs transition-colors ${
                         favorites.includes(selectedChannel.url) 
                           ? 'bg-rose-600/15 text-rose-400 border border-rose-500/20' 
                           : 'bg-white/5 border border-white/10 text-white/80 hover:bg-white/10'
                       }`}
                     >
                       <Heart className={`w-3.5 h-3.5 ${favorites.includes(selectedChannel.url) ? 'fill-current' : ''}`} />
                       <span>{favorites.includes(selectedChannel.url) ? 'Favorited' : 'Add to Favorites'}</span>
                     </button>

                     {channelStatuses[selectedChannel.url] && (
                       <span className={`px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                         channelStatuses[selectedChannel.url] === 'online' 
                           ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                           : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                       }`}>
                         <span className={`w-1 h-1 rounded-full ${channelStatuses[selectedChannel.url] === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                         {channelStatuses[selectedChannel.url]}
                       </span>
                     )}
                   </div>
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
                      Reload Default Global Streams
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
                    {playlistWarning && (
                      <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3 text-left">
                        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        <div className="flex-grow">
                          <p className="text-xs font-bold text-amber-400">Connection Note</p>
                          <p className="text-[11px] text-zinc-300 mt-1 leading-relaxed">{playlistWarning}</p>
                        </div>
                        <button onClick={() => setPlaylistWarning(null)} className="text-zinc-500 hover:text-white transition-colors shrink-0">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    {/* Mobile IPTV Redesigned View */}
                    <div className="md:hidden">
                      {searchQuery ? (
                        /* SEARCH MODE VIEW */
                        <div className="space-y-4">
                          <div className="flex items-center justify-between text-[10px] text-white/40 font-bold uppercase tracking-wider">
                            <span>Search Results</span>
                            <span>{visibleChannels.length} feeds found</span>
                          </div>
                          
                          {visibleChannels.length === 0 ? (
                            <div className="h-[250px] flex flex-col items-center justify-center p-6 text-center">
                              <Radio className="w-10 h-10 text-white/20 mb-3 animate-pulse" />
                              <p className="text-white/60 font-black text-xs uppercase tracking-wider">No Matches found</p>
                              <p className="text-white/40 text-[10px] mt-1">Try typing another query or keyword.</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-3 pb-24">
                              {visibleChannels.map((channel, idx) => (
                                <MobileChannelCard
                                  key={`mob-search-${channel.id || channel.url}-${idx}`}
                                  channel={channel}
                                  idx={idx}
                                  selectedChannel={selectedChannel}
                                  handleChannelSelect={handleChannelSelect}
                                  status={channelStatuses[channel.url]}
                                  favorites={favorites}
                                  toggleFavorite={toggleFavorite}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        /* TAB FLOW: Home / Browse / Favorites / History */
                        <>
                          {mobileTab === "home" && (
                            <div className="space-y-6">
                              {/* Netflix-Style Billboard Hero Card */}
                              {featuredChannel && (
                                <div 
                                  onClick={() => handleChannelSelect(featuredChannel)}
                                  className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden border border-white/5 shadow-2xl group cursor-pointer bg-[#0a0a0a] flex flex-col justify-end"
                                >
                                  {/* Gloss & Gradient Atmosphere */}
                                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
                                  <div className="absolute inset-0 z-0 flex items-center justify-center p-8 bg-black/45">
                                    {featuredChannel.logo ? (
                                      <img 
                                        src={featuredChannel.logo} 
                                        alt={featuredChannel.name} 
                                        className="w-24 h-24 object-contain opacity-55"
                                        referrerPolicy="no-referrer"
                                      />
                                    ) : (
                                      <Tv className="w-16 h-16 text-white/10" />
                                    )}
                                  </div>

                                  {/* Contents Cover Panel */}
                                  <div className="absolute inset-x-4 bottom-4 z-20 flex flex-col gap-1.5">
                                    <div className="flex items-center gap-1.5">
                                      <span className="bg-red-600 text-[8px] font-black tracking-widest px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow-md shadow-red-600/30">
                                        <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
                                        LIVE SPECIAL
                                      </span>
                                      <span className="bg-white/10 backdrop-blur-md text-white/90 text-[8px] px-1.5 py-0.5 rounded border border-white/5 font-extrabold flex items-center gap-1">
                                        <span>{getChannelBadges(featuredChannel).flag}</span>
                                        <span>{getChannelBadges(featuredChannel).country}</span>
                                      </span>
                                    </div>

                                    <h2 className="text-base font-black text-white tracking-tight truncate">
                                      {featuredChannel.name}
                                    </h2>
                                    
                                    <p className="text-[10px] text-white/60 font-bold truncate tracking-wide">
                                      Category: {featuredChannel.group || "Feeds"}
                                    </p>

                                    <button className="w-full mt-1.5 bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-all">
                                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                                      <span>Stream Now</span>
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* CURATED SECTION ROWS */}
                              {/* Row 1: Trending Live Streams */}
                              {homeSections.popular.length > 0 && (
                                <div className="space-y-2.5">
                                  <h3 className="text-xs font-black uppercase tracking-wider text-white/90 flex items-center gap-1.5">
                                    <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                                    🔥 Trending Streams
                                  </h3>
                                  <div className="flex gap-3 overflow-x-auto no-scrollbar scroll-smooth px-0.5 py-0.5">
                                    {homeSections.popular.map((channel, idx) => (
                                      <div key={`mob-trend-${channel.id || channel.url}-${idx}`} className="w-[145px] shrink-0">
                                        <MobileChannelCard
                                          channel={channel}
                                          idx={idx}
                                          selectedChannel={selectedChannel}
                                          handleChannelSelect={handleChannelSelect}
                                          status={channelStatuses[channel.url]}
                                          favorites={favorites}
                                          toggleFavorite={toggleFavorite}
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Row 2: Live Sports & Games */}
                              {homeSections.sports.length > 0 && (
                                <div className="space-y-2.5">
                                  <h3 className="text-xs font-black uppercase tracking-wider text-white/90 flex items-center gap-1.5">
                                    <Award className="w-3.5 h-3.5 text-indigo-400" />
                                    🏆 Live Sports & Stadiums
                                  </h3>
                                  <div className="flex gap-3 overflow-x-auto no-scrollbar scroll-smooth px-0.5 py-0.5">
                                    {homeSections.sports.map((channel, idx) => (
                                      <div key={`mob-sports-${channel.id || channel.url}-${idx}`} className="w-[145px] shrink-0">
                                        <MobileChannelCard
                                          channel={channel}
                                          idx={idx}
                                          selectedChannel={selectedChannel}
                                          handleChannelSelect={handleChannelSelect}
                                          status={channelStatuses[channel.url]}
                                          favorites={favorites}
                                          toggleFavorite={toggleFavorite}
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Row 3: Global News Live */}
                              {homeSections.news.length > 0 && (
                                <div className="space-y-2.5">
                                  <h3 className="text-xs font-black uppercase tracking-wider text-white/90 flex items-center gap-1.5">
                                    <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                                    📰 24/7 News Broadcasters
                                  </h3>
                                  <div className="flex gap-3 overflow-x-auto no-scrollbar scroll-smooth px-0.5 py-0.5">
                                    {homeSections.news.map((channel, idx) => (
                                      <div key={`mob-news-${channel.id || channel.url}-${idx}`} className="w-[145px] shrink-0">
                                        <MobileChannelCard
                                          channel={channel}
                                          idx={idx}
                                          selectedChannel={selectedChannel}
                                          handleChannelSelect={handleChannelSelect}
                                          status={channelStatuses[channel.url]}
                                          favorites={favorites}
                                          toggleFavorite={toggleFavorite}
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Row 4: Movies & Shows */}
                              {homeSections.entertainment.length > 0 && (
                                <div className="space-y-3 pb-24">
                                  <h3 className="text-xs font-black uppercase tracking-wider text-white/90 flex items-center gap-1.5">
                                    <Tv className="w-3.5 h-3.5 text-[#A5B4FC]" />
                                    🍿 Cinema, Movies & Serials
                                  </h3>
                                  <div className="flex gap-3 overflow-x-auto no-scrollbar scroll-smooth px-0.5 py-0.5">
                                    {homeSections.entertainment.map((channel, idx) => (
                                      <div key={`mob-ent-${channel.id || channel.url}-${idx}`} className="w-[145px] shrink-0">
                                        <MobileChannelCard
                                          channel={channel}
                                          idx={idx}
                                          selectedChannel={selectedChannel}
                                          handleChannelSelect={handleChannelSelect}
                                          status={channelStatuses[channel.url]}
                                          favorites={favorites}
                                          toggleFavorite={toggleFavorite}
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {mobileTab === "browse" && (
                            <div className="space-y-4">
                              <div className="flex items-center justify-between text-[11px] text-white/40 font-bold uppercase tracking-wider">
                                <span>{activeCategory} Category</span>
                                <span>{visibleChannels.length} streams</span>
                              </div>
                              
                              {visibleChannels.length === 0 ? (
                                <div className="h-[250px] flex flex-col items-center justify-center p-6 text-center border border-white/5 rounded-2xl bg-white/[0.01]">
                                  <Tv className="w-10 h-10 text-white/20 mb-3" />
                                  <p className="text-white/60 font-black text-xs uppercase">Empty Category</p>
                                  <p className="text-white/40 text-[10px] mt-1">Try switching categories or custom sources.</p>
                                </div>
                              ) : (
                                <div className="grid grid-cols-2 gap-3 pb-24">
                                  {visibleChannels.map((channel, idx) => (
                                    <MobileChannelCard
                                      key={`mob-browse-${channel.id || channel.url}-${idx}`}
                                      channel={channel}
                                      idx={idx}
                                      selectedChannel={selectedChannel}
                                      handleChannelSelect={handleChannelSelect}
                                      status={channelStatuses[channel.url]}
                                      favorites={favorites}
                                      toggleFavorite={toggleFavorite}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {mobileTab === "favorites" && (
                            <div className="space-y-4">
                              <div className="flex items-center justify-between text-[11px] text-white/40 font-bold uppercase tracking-wider">
                                <span className="text-rose-400">Bookmarked channels ({favorites.length})</span>
                              </div>
                              
                              {favorites.length === 0 ? (
                                <div className="h-[250px] flex flex-col items-center justify-center p-6 text-center border border-white/5 rounded-3xl bg-[#141414]/40">
                                  <Heart className="w-10 h-10 text-white/20 mb-3" />
                                  <p className="text-white/60 font-black text-xs uppercase tracking-wider">No Bookmarks Saved</p>
                                  <p className="text-white/40 text-[10px] mt-1 max-w-[200px] leading-relaxed font-semibold">Tap the heart bubble on any live feed to keep it here.</p>
                                </div>
                              ) : (
                                <div className="grid grid-cols-2 gap-3 pb-24">
                                  {(playlist?.channels || []).filter(c => favorites.includes(c.url)).slice(0, 100).map((channel, idx) => (
                                    <MobileChannelCard
                                      key={`mob-fav-${channel.id || channel.url}-${idx}`}
                                      channel={channel}
                                      idx={idx}
                                      selectedChannel={selectedChannel}
                                      handleChannelSelect={handleChannelSelect}
                                      status={channelStatuses[channel.url]}
                                      favorites={favorites}
                                      toggleFavorite={toggleFavorite}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {mobileTab === "history" && (
                            <div className="space-y-4">
                              <div className="flex items-center justify-between text-[11px] text-white/40 font-bold uppercase tracking-wider">
                                <span className="text-amber-400">Stream History ({history.length})</span>
                              </div>
                              
                              {history.length === 0 ? (
                                <div className="h-[250px] flex flex-col items-center justify-center p-6 text-center border border-white/5 rounded-3xl bg-[#141414]/40">
                                  <History className="w-10 h-10 text-white/20 mb-3" />
                                  <p className="text-white/60 font-black text-xs uppercase tracking-wider font-display">No History Found</p>
                                  <p className="text-white/40 text-[10px] mt-1 max-w-[200px] leading-relaxed">Feeds you open will automatically be memorized here.</p>
                                </div>
                              ) : (
                                <div className="grid grid-cols-2 gap-3 pb-24">
                                  {history.map((channel, idx) => (
                                    <MobileChannelCard
                                      key={`mob-hist-${channel.id || channel.url}-${idx}`}
                                      channel={channel}
                                      idx={idx}
                                      selectedChannel={selectedChannel}
                                      handleChannelSelect={handleChannelSelect}
                                      status={channelStatuses[channel.url]}
                                      favorites={favorites}
                                      toggleFavorite={toggleFavorite}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Desktop Premium Dashboard (Entirely Unchanged) */}
                    <div className="hidden md:block space-y-6">
                      {/* Live Stream Status Checker Panel */}
                      <div className="hidden md:flex p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex-col md:flex-row md:items-center justify-between gap-4">
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

                      <div className="hidden md:flex items-center justify-between text-[11px] text-white/40 border-b border-white/5 pb-2">
                        <span className="font-semibold uppercase tracking-wider">
                          {searchQuery ? "Search Results (All Categories)" : `${activeCategory} Category`}
                        </span>
                        <span>Showing {visibleChannels.length} of {filteredChannels.length} feeds</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                        {visibleChannels.map((channel, idx) => (
                          <ChannelCard
                            key={channel.id || `${channel.url}-${idx}`}
                            channel={channel}
                            idx={idx}
                            selectedChannel={selectedChannel}
                            handleChannelSelect={handleChannelSelect}
                            status={channelStatuses[channel.url]}
                            favorites={favorites}
                            toggleFavorite={toggleFavorite}
                          />
                        ))}
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

          {/* Fixed Premium Bottom Navigation for Mobile */}
          <div className="md:hidden shrink-0 w-full bg-[#121212]/95 backdrop-blur-md border-t border-white/10 px-6 py-2.5 flex items-center justify-between z-50">
            {[
              { id: "home", label: "Home", icon: Home },
              { id: "browse", label: "Browse", icon: LayoutGrid },
              { id: "favorites", label: "Favorites", icon: Heart, badge: favorites.length },
              { id: "history", label: "History", icon: History, badge: history.length }
            ].map(tab => {
              const IconComp = tab.icon;
              const isActive = mobileTab === tab.id;
              return (
                <button
                  key={`btm-nav-${tab.id}`}
                  onClick={() => {
                    setMobileTab(tab.id as any);
                    if (tab.id === "favorites") {
                      setActiveCategory("Favorites");
                    } else if (tab.id === "history") {
                      setActiveCategory("Recently Watched");
                    } else if (tab.id === "browse") {
                      setActiveCategory("All");
                    }
                  }}
                  className="flex flex-col items-center justify-center relative py-1 px-3 transition-all duration-300 active:scale-90"
                >
                  <div className="relative">
                    <IconComp className={`w-5 h-5 transition-transform ${isActive ? 'text-indigo-400 scale-110' : 'text-white/40'}`} />
                    {tab.badge !== undefined && tab.badge > 0 && (
                      <span className="absolute -top-1.5 -right-2 bg-red-600 text-white font-extrabold text-[8px] px-1.5 py-0.5 rounded-full shadow-md scale-95">
                        {tab.badge}
                      </span>
                    )}
                  </div>
                  <span className={`text-[9px] mt-1 font-black uppercase tracking-wider transition-colors ${isActive ? 'text-indigo-400' : 'text-white/30'}`}>
                    {tab.label}
                  </span>
                  
                  {isActive && (
                    <motion.div 
                      layoutId="activeBtmIndicator"
                      className="absolute -bottom-2 w-5 h-1 bg-indigo-500 rounded-full"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
};
