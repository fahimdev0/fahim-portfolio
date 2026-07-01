import { motion, AnimatePresence } from "motion/react";
import { 
  Globe, Search, ExternalLink, Copy, Plus, Github, Shield, Terminal, ArrowLeft, 
  Check, Loader2, Tag, Sparkles, Star, Bookmark, Info, HelpCircle, Eye, Share2, Heart
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { View } from "../types";
import { db, auth, handleFirestoreError, OperationType } from "../lib/firebase";
import { collection, addDoc, onSnapshot, query, serverTimestamp } from "firebase/firestore";

interface FreeSource {
  id: string;
  name: string;
  description: string;
  url: string;
  category: string;
  tags: string[];
  instructions: string[];
  stars?: string;
  author?: string;
  isCustom?: boolean;
}

const DEFAULT_SOURCES: FreeSource[] = [
  {
    id: "ladder-proxy",
    name: "Ladder (Paywall Bypass Proxy)",
    description: "A free, extremely efficient bypass proxy that lets you read paywalled news articles (e.g. Bloomberg, NYT, Medium) by mimicking Google Crawler bot requests. It strips paywall banners and reveals complete original content instantly.",
    url: "https://github.com/everywall/ladder",
    category: "Bypasses",
    tags: ["Proxy", "Bypass", "Paywall", "Googlebot", "Open Source"],
    stars: "5.8k",
    author: "everywall",
    instructions: [
      "Navigate to the GitHub repository at https://github.com/everywall/ladder",
      "Option 1 (Self-Host): Clone the repo and run with Docker: `docker run -p 8080:8080 everywall/ladder`",
      "Option 2 (Quick Bypass): Paste any paywalled article URL into a hosted Ladder proxy instance to view the full content.",
      "Option 3 (Local Binary): Download the pre-compiled binary from the Releases tab and run `./ladder` on port 8080."
    ]
  },
  {
    id: "bypass-paywalls-clean",
    name: "Bypass Paywalls Clean",
    description: "The ultimate web browser extension for Firefox and Chrome-based browsers to bypass paywalls for hundreds of leading international journals, newspapers, and blogs.",
    url: "https://github.com/bypassed-it/bypass-paywalls-chrome",
    category: "Bypasses",
    tags: ["Extension", "Paywall", "Bypass", "Firefox", "Chrome"],
    stars: "12k",
    author: "bypassed-it",
    instructions: [
      "Go to the GitHub repository and download the latest release ZIP file.",
      "Unzip the downloaded file onto your local drive.",
      "In Chrome/Brave/Edge, open `chrome://extensions/` and enable 'Developer Mode' in the top right.",
      "Click 'Load unpacked' and select the unzipped extension directory.",
      "For Firefox, simply download and install the provided `.xpi` file directly."
    ]
  },
  {
    id: "ublock-origin",
    name: "uBlock Origin",
    description: "An efficient, wide-spectrum content blocker. It does not just block ads; it also blocks trackers, malware domains, and custom paywall overlays while keeping memory and CPU footprint exceptionally low.",
    url: "https://github.com/gorhill/uBlock",
    category: "Security",
    tags: ["Adblocker", "Privacy", "Security", "Open Source"],
    stars: "48k",
    author: "gorhill",
    instructions: [
      "Install uBlock Origin from your browser's official extensions web store.",
      "To bypass anti-adblockers, open uBlock Settings -> 'Filter lists' tab.",
      "Enable 'Adguard Base', 'Ublock filters - Annoyances', and 'Fanboy's Annoyances'.",
      "Click 'Apply changes' and reload your target website."
    ]
  },
  {
    id: "free-iptv-m3u",
    name: "Free Global IPTV Playlists",
    description: "A collaborative, crowd-sourced repository of publicly available, legally streamable live TV and sports channels from all around the world, packaged in auto-updating M3U playlist format.",
    url: "https://github.com/iptv-org/iptv",
    category: "Streaming",
    tags: ["IPTV", "M3U", "Live Sports", "Global TV"],
    stars: "84k",
    author: "iptv-org",
    instructions: [
      "Copy the master M3U link: `https://iptv-org.github.io/iptv/index.m3u`",
      "Open your favorite IPTV player (like Fahim IPTV inside this hub!).",
      "Paste the copied URL into the custom playlist field.",
      "Explore thousands of categorized worldwide channels and enjoy live streams."
    ]
  },
  {
    id: "fast-api-proxy",
    name: "Free-API-Proxy (Reverse Proxy)",
    description: "An ultra-fast reverse proxy middleware to access closed APIs (like OpenAI, Claude, Gemini, etc.) and bypass geographic IP restrictions or billing limitations securely.",
    url: "https://github.com/Zisbusy/Free-API-Proxy",
    category: "Developer Tools",
    tags: ["Proxy", "API", "Bypass", "Reverse Proxy"],
    stars: "1.2k",
    author: "Zisbusy",
    instructions: [
      "Clone the repository to your server or deploy instantly on Vercel/Cloudflare Workers.",
      "Configure your base URL and target endpoints in the environment variables.",
      "Use the newly generated proxy endpoint in your client application to fetch API responses without revealing your real server credentials or IP address."
    ]
  }
];

const CATEGORIES = ["All", "Bypasses", "Proxy", "Security", "Streaming", "Developer Tools", "User Added"];

export function FreeSourceApp({ onBack }: { onBack: () => void }) {
  const [sources, setSources] = useState<FreeSource[]>(DEFAULT_SOURCES);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>("ladder-proxy");
  
  // Suggest source form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newSourceName, setNewSourceName] = useState("");
  const [newSourceUrl, setNewSourceUrl] = useState("");
  const [newSourceDesc, setNewSourceDesc] = useState("");
  const [newSourceCat, setNewSourceCat] = useState("Bypasses");
  const [newSourceTags, setNewSourceTags] = useState("");
  const [newSourceInst, setNewSourceInst] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Load user added sources from Firestore in real-time
  useEffect(() => {
    const q = collection(db, "free_sources");
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const customList: FreeSource[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        customList.push({
          id: docSnap.id,
          name: data.name,
          description: data.description,
          url: data.url,
          category: data.category,
          tags: Array.isArray(data.tags) ? data.tags : (data.tags || "").split(",").map((t: string) => t.trim()).filter(Boolean),
          instructions: Array.isArray(data.instructions) ? data.instructions : (data.instructions || "").split("\n").map((i: string) => i.trim()).filter(Boolean),
          stars: data.stars || "User Contribution",
          author: data.author || "Community",
          isCustom: true,
          createdAt: data.createdAt
        } as any);
      });
      
      // Sort user contributions in descending order of creation time
      customList.sort((a: any, b: any) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0);
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0);
        return timeB - timeA;
      });
      
      // Combine defaults with user submitted sources
      setSources([...DEFAULT_SOURCES, ...customList]);
    }, (error) => {
      console.error("Error listening to free_sources collection:", error);
      handleFirestoreError(error, OperationType.LIST, "free_sources");
    });

    return () => unsubscribe();
  }, []);

  const filteredSources = useMemo(() => {
    return sources.filter((src) => {
      // Filter by Category
      if (activeCategory !== "All") {
        if (activeCategory === "User Added") {
          if (!src.isCustom) return false;
        } else if (src.category !== activeCategory) {
          return false;
        }
      }

      // Filter by Search Query
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchName = src.name.toLowerCase().includes(q);
        const matchDesc = src.description.toLowerCase().includes(q);
        const matchTags = src.tags.some(t => t.toLowerCase().includes(q));
        const matchAuthor = src.author?.toLowerCase().includes(q);
        return matchName || matchDesc || matchTags || matchAuthor;
      }

      return true;
    });
  }, [sources, activeCategory, searchQuery]);

  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSuggestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitSuccess(false);

    if (!newSourceName.trim() || !newSourceUrl.trim() || !newSourceDesc.trim()) {
      setSubmitError("Please fill in Name, URL, and Description.");
      return;
    }

    setIsSubmitting(true);
    try {
      const user = auth.currentUser;
      const authorName = user?.displayName || user?.email?.split("@")[0] || "Guest Contributor";
      
      // Split tags and instructions
      const tagsArray = newSourceTags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
        
      const instArray = newSourceInst
        .split("\n")
        .map((i) => i.trim())
        .filter((i) => i.length > 0);

      await addDoc(collection(db, "free_sources"), {
        name: newSourceName,
        url: newSourceUrl,
        description: newSourceDesc,
        category: newSourceCat,
        tags: tagsArray.length > 0 ? tagsArray : ["User Added"],
        instructions: instArray.length > 0 ? instArray : ["Visit URL and explore the files."],
        stars: "Community Spark",
        author: authorName,
        createdAt: serverTimestamp(),
        userId: user?.uid || "anonymous"
      });

      setSubmitSuccess(true);
      // Reset form fields
      setNewSourceName("");
      setNewSourceUrl("");
      setNewSourceDesc("");
      setNewSourceTags("");
      setNewSourceInst("");
      
      setTimeout(() => {
        setIsFormOpen(false);
        setSubmitSuccess(false);
      }, 2000);
    } catch (err: any) {
      console.error("Error saving source:", err);
      setSubmitError(err.message || "Failed to submit. Please try again.");
      handleFirestoreError(err, OperationType.CREATE, "free_sources");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden relative text-white bg-[#030712] select-none font-sans">
      
      {/* Visual background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-[40%] h-[30%] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[30%] h-[35%] bg-blue-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Navigation Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-white/[0.06] backdrop-blur-md bg-black/40 z-10 shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-all active:scale-95 border border-white/5 cursor-pointer"
            title="Back to Hub"
            id="free-source-back-btn"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <h1 className="text-lg sm:text-xl font-black tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-400 bg-clip-text text-transparent">
                Free Source Hub
              </h1>
            </div>
            <p className="text-[10px] sm:text-xs text-white/50 font-medium">
              Curated master list of bypassed proxies, free resources & tools
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold text-xs tracking-tight shadow-[0_4px_15px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.5)] transition-all active:scale-95 duration-150 cursor-pointer"
          id="suggest-source-btn"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Source</span>
        </button>
      </div>

      {/* Main Container Split with Sidebar/Filters & list */}
      <div className="flex-grow flex flex-col md:flex-row overflow-hidden min-h-0 relative z-10">
        
        {/* Category Filter Pills (Mobile Scrollable / Desktop Sidebar) */}
        <div className="w-full md:w-60 shrink-0 border-b md:border-b-0 md:border-r border-white/[0.06] bg-black/20 p-4 flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto no-scrollbar">
          <div className="hidden md:flex items-center gap-2 mb-2 px-2 select-none">
            <Tag className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-black text-white/40 tracking-[0.12em] uppercase">Categories</span>
          </div>
          {CATEGORIES.map((cat) => {
            const isSelected = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold tracking-tight text-left transition-all shrink-0 cursor-pointer flex items-center justify-between ${
                  isSelected 
                    ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.15)]" 
                    : "bg-white/5 border border-transparent text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                <span>{cat}</span>
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 hidden md:block" />}
              </button>
            );
          })}
        </div>

        {/* List & Search Side */}
        <div className="flex-grow flex flex-col overflow-hidden min-h-0 p-4 sm:p-6 bg-[#040815]/50">
          
          {/* Search Box */}
          <div className="mb-6 relative shrink-0">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-white/40">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Search by tool name, keywords, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#111827]/80 border border-white/[0.08] rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all shadow-inner"
              id="free-source-search-input"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-4 flex items-center text-xs font-black text-white/40 hover:text-white/80 transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          {/* List Content */}
          <div className="flex-grow overflow-y-auto pr-1 select-none flex flex-col gap-4 no-scrollbar">
            {filteredSources.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center select-none">
                <HelpCircle className="w-12 h-12 text-white/20 mb-3 animate-bounce" />
                <h3 className="text-base font-bold text-white/75">No free sources found</h3>
                <p className="text-xs text-white/40 max-w-sm mt-1">
                  Try adjusting your search query, selecting another category, or add a new source to the community.
                </p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {filteredSources.map((src, idx) => {
                  const isExpanded = expandedId === src.id;
                  const isCopied = copiedId === src.id;

                  return (
                    <motion.div
                      key={src.id}
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      className={`rounded-2xl border transition-all overflow-hidden ${
                        isExpanded 
                          ? "bg-gradient-to-b from-[#111827] to-[#0b0f19] border-emerald-500/30 shadow-[0_10px_30px_rgba(0,0,0,0.5)]" 
                          : "bg-[#111827]/40 border-white/[0.04] hover:bg-[#111827]/70 hover:border-white/[0.08] shadow-md"
                      }`}
                    >
                      {/* Top Header Card Info */}
                      <div 
                        onClick={() => setExpandedId(isExpanded ? null : src.id)}
                        className="p-5 flex items-start justify-between gap-4 cursor-pointer select-none"
                      >
                        <div className="flex-grow min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1.5">
                            <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-white/5 border border-white/10 text-emerald-400">
                              {src.category}
                            </span>
                            {src.stars && (
                              <span className="flex items-center gap-1 text-[10px] text-amber-400 font-extrabold bg-amber-500/10 px-1.5 py-0.5 rounded-md">
                                <Star className="w-3 h-3 fill-amber-400" />
                                <span>{src.stars}</span>
                              </span>
                            )}
                            {src.isCustom && (
                              <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-blue-500/10 border border-blue-500/20 text-blue-300 animate-pulse">
                                Added by {src.author}
                              </span>
                            )}
                          </div>
                          
                          <h3 className="text-[15px] sm:text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                            <span>{src.name}</span>
                            {src.name.includes("Ladder") && (
                              <Sparkles className="w-4 h-4 text-emerald-400" />
                            )}
                          </h3>

                          <p className="text-[11.5px] sm:text-xs text-white/60 font-medium leading-relaxed mt-1.5 line-clamp-2 md:line-clamp-none">
                            {src.description}
                          </p>

                          {/* Tags row */}
                          <div className="flex items-center gap-1.5 flex-wrap mt-3">
                            {src.tags.map((tag) => (
                              <span 
                                key={tag} 
                                className="text-[10px] font-semibold text-white/40 bg-white/[0.02] border border-white/[0.04] px-2 py-0.5 rounded-full"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(src.url, "_blank");
                            }}
                            className="p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-all hover:scale-105 cursor-pointer"
                            title="Visit Source Link"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Expandable Step-by-Step Instructions */}
                      {isExpanded && (
                        <div className="px-5 pb-5 border-t border-white/[0.05] bg-black/20">
                          
                          <div className="flex items-center gap-2 mt-4 mb-3">
                            <Terminal className="w-4 h-4 text-emerald-400" />
                            <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest">
                              How to setup & use
                            </span>
                          </div>

                          <div className="flex flex-col gap-2.5">
                            {src.instructions.map((inst, sidx) => (
                              <div key={sidx} className="flex gap-3 text-xs text-white/70">
                                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-emerald-400 shrink-0">
                                  {sidx + 1}
                                </span>
                                <p className="font-medium leading-relaxed mt-0.5">{inst}</p>
                              </div>
                            ))}
                          </div>

                          <div className="mt-5 pt-4 border-t border-white/[0.04] flex items-center justify-between flex-wrap gap-3">
                            <div className="flex items-center gap-2 text-[10.5px] text-white/40">
                              <Info className="w-3.5 h-3.5" />
                              <span>Author/Maintainer: <span className="font-bold text-white/60">{src.author || "Community"}</span></span>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleCopyLink(src.url, src.id)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-[11px] font-bold transition-all cursor-pointer"
                              >
                                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                <span>{isCopied ? "Copied Link" : "Copy Source Link"}</span>
                              </button>
                              
                              <button
                                onClick={() => window.open(src.url, "_blank")}
                                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-[11px] transition-all cursor-pointer"
                              >
                                <Github className="w-3.5 h-3.5" />
                                <span>Launch GitHub</span>
                              </button>
                            </div>
                          </div>

                        </div>
                      )}

                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>

        </div>

      </div>

      {/* Suggest Source Modal Form */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0f172a] border border-white/10 w-full max-w-lg rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between bg-black/20">
                <div className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-emerald-400" />
                  <span className="font-extrabold text-sm sm:text-base tracking-tight text-white">Add New Free Source</span>
                </div>
                <button 
                  onClick={() => setIsFormOpen(false)}
                  className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSuggestSubmit} className="p-6 flex flex-col gap-4 max-h-[75vh] overflow-y-auto no-scrollbar">
                {submitError && (
                  <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold leading-relaxed">
                    {submitError}
                  </div>
                )}
                {submitSuccess && (
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold leading-relaxed">
                    Source registered successfully! Syncing to Hub...
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">Tool/Repository Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ladder (Bypass Google Proxy)"
                    value={newSourceName}
                    onChange={(e) => setNewSourceName(e.target.value)}
                    className="bg-black/40 border border-white/[0.08] focus:border-emerald-500/50 focus:outline-none rounded-xl px-4 py-2.5 text-xs text-white"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">Source/GitHub URL</label>
                  <input
                    type="url"
                    required
                    placeholder="https://github.com/everywall/ladder"
                    value={newSourceUrl}
                    onChange={(e) => setNewSourceUrl(e.target.value)}
                    className="bg-black/40 border border-white/[0.08] focus:border-emerald-500/50 focus:outline-none rounded-xl px-4 py-2.5 text-xs text-white"
                  />
                </div>

                <div className="flex md:flex-row flex-col gap-4">
                  <div className="flex-1 flex flex-col gap-1.5">
                    <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">Category</label>
                    <select
                      value={newSourceCat}
                      onChange={(e) => setNewSourceCat(e.target.value)}
                      className="bg-[#0f172a] border border-white/[0.08] focus:border-emerald-500/50 focus:outline-none rounded-xl px-3 py-2.5 text-xs text-white"
                    >
                      <option value="Bypasses">Bypasses</option>
                      <option value="Proxy">Proxy</option>
                      <option value="Security">Security</option>
                      <option value="Streaming">Streaming</option>
                      <option value="Developer Tools">Developer Tools</option>
                    </select>
                  </div>

                  <div className="flex-1 flex flex-col gap-1.5">
                    <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">Tags (comma separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. proxy, bypass, googlebot"
                      value={newSourceTags}
                      onChange={(e) => setNewSourceTags(e.target.value)}
                      className="bg-black/40 border border-white/[0.08] focus:border-emerald-500/50 focus:outline-none rounded-xl px-4 py-2.5 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">Brief Description</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe what this tool does, how it works, and why it's useful."
                    value={newSourceDesc}
                    onChange={(e) => setNewSourceDesc(e.target.value)}
                    className="bg-black/40 border border-white/[0.08] focus:border-emerald-500/50 focus:outline-none rounded-xl p-4 text-xs text-white resize-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">Setup Instructions (one per line)</label>
                  <textarea
                    rows={3}
                    placeholder="Step 1: Clone the repository&#10;Step 2: Run docker command&#10;Step 3: Access locally on port 8080"
                    value={newSourceInst}
                    onChange={(e) => setNewSourceInst(e.target.value)}
                    className="bg-black/40 border border-white/[0.08] focus:border-emerald-500/50 focus:outline-none rounded-xl p-4 text-xs text-white resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white font-extrabold text-xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-1 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Registering...</span>
                      </>
                    ) : (
                      <span>Save & Submit</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>

          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
