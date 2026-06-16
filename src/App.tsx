/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Tv, Shield, Zap, Globe, Github, ExternalLink, ChevronLeft, LayoutGrid, Terminal, Cpu, Mail, Copy, Check, X, Users, Send, Youtube, MessageSquare, Lock, User, Eye, EyeOff, Sparkles, LogIn, UserPlus, Settings, Sliders, KeyRound, LogOut, CheckCircle2, ShieldCheck, Database } from "lucide-react";
import { useState, useMemo, useEffect, FormEvent } from "react";
import { View, Tool, ToolCategory } from "./types";
import { LoadingScreen } from "./components/LoadingScreen";
import { IPTVApp } from "./components/IPTVApp";

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
        <span className="font-display font-bold text-xs sm:text-sm text-white/85 tracking-tight group-hover:text-blue-400 transition-colors">Fahim M. Siam</span>
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
          className="px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-indigo-500/30 bg-indigo-600/15 hover:bg-indigo-600/25 hover:border-indigo-400/40 text-indigo-400 hover:text-indigo-300 transition-all text-[10px] sm:text-xs font-extrabold select-none active:scale-95 duration-100 flex items-center gap-1 sm:gap-1.5"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse hidden min-[360px]:inline-block" />
          <span>Join<span className="hidden sm:inline"> Our</span> Community</span>
        </button>
        <button 
          onClick={onContactClick}
          className="px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all text-[10px] sm:text-xs font-bold select-none text-white/90 active:scale-95 duration-100"
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
  const [isCommunityOpen, setIsCommunityOpen] = useState(false);
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

  return (
    <div className="relative min-h-screen flex flex-col font-sans overflow-x-hidden selection:bg-blue-500/30">
      <BackgroundGlows />
      {view === "hero" && <SpiderWeb />}
      <Header currentView={view} setView={setView} onContactClick={() => setIsContactOpen(true)} onCommunityClick={() => setIsCommunityOpen(true)} />

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
              className={`relative w-full ${isAuthed && activeTab === "admin" && auth.currentUser?.email === "fahimmuntasir12390@gmail.com" ? "max-w-2xl md:max-w-3xl" : "max-w-md"} bg-neutral-950/95 border border-indigo-500/20 rounded-3xl p-6 md:p-8 shadow-2xl z-10 overflow-hidden transition-all duration-300 text-center`}
            >
              {/* Blue/indigo/cyan glows inside card */}
              <div className="absolute -top-12 -left-12 w-32 h-32 bg-indigo-600/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-cyan-600/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex justify-end absolute top-4 right-4">
                <button
                  onClick={() => setIsCommunityOpen(false)}
                  className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-white/55 hover:text-white transition-colors active:scale-90"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {!isAuthed ? (
                <div className="select-none">
                  <div className="w-11 h-11 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mx-auto mb-3 border border-indigo-500/25 animate-pulse">
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
