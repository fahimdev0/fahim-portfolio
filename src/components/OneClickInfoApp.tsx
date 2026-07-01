import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Loader2, 
  Phone, 
  Mail, 
  User, 
  Building2, 
  MapPin, 
  AlertCircle, 
  ArrowLeft, 
  Globe, 
  GraduationCap, 
  ExternalLink, 
  ShieldCheck, 
  Award,
  BookOpen,
  Building,
  Info,
  Layers,
  ChevronRight
} from 'lucide-react';

interface Personnel {
  name: string;
  designation: string;
  department: string | null;
  phone: string | null;
  email: string | null;
  photo_url: string | null;
}

interface InstitutionInfo {
  name: string;
  eiin: string;
  type: string;
  location: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  principal?: string;
  district?: string;
  upazila?: string;
  image_url?: string;
}

interface ResultData {
  institution_info: InstitutionInfo;
  personnel: Personnel[];
}

interface OneClickInfoAppProps {
  onBack: () => void;
}

const QUICK_SUGGESTIONS = [
  { name: "Dhaka College", code: "107907" },
  { name: "Viqarunnisa Noon School & College", code: "108355" },
  { name: "Rajshahi College", code: "126490" },
  { name: "Chittagong College", code: "104297" },
  { name: "Comilla Victoria College", code: "105822" }
];

export const OneClickInfoApp = ({ onBack }: OneClickInfoAppProps) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeSubView, setActiveSubView] = useState<'search' | 'result'>('search');
  const [result, setResult] = useState<ResultData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchStep, setSearchStep] = useState<string>('');

  const handleSearch = async (searchQuery: string = input) => {
    const finalQuery = searchQuery.trim();
    if (!finalQuery) return;
    
    setInput(finalQuery);
    setLoading(true);
    setError(null);
    setSearchStep('1. Initiating connection to BANBEIS registry...');
    
    try {
      // Simulate real-time fetch pipeline step logs
      setTimeout(() => setSearchStep('2. Grounding search queries on Google AI network...'), 1200);
      setTimeout(() => setSearchStep('3. Resolving authentic campus photographs & official portal...'), 2600);
      setTimeout(() => setSearchStep('4. Extracting official faculties & personnel directory...'), 4000);

      const response = await fetch('/api/institution-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: finalQuery }),
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch information');
      }
      
      if (!data || !data.institution_info) {
        throw new Error('No data found for this institution.');
      }
      
      setResult(data);
      setActiveSubView('result');
    } catch (error: any) {
      console.error('Error fetching institution info:', error);
      setError(error.message || 'An error occurred while searching.');
      setActiveSubView('search');
    } finally {
      setLoading(false);
      setSearchStep('');
    }
  };

  // Extract principal if listed in personnel to show in spotlight
  const principalInfo = result?.personnel.find(p => 
    p.designation.toLowerCase().includes('principal') || 
    p.designation.toLowerCase().includes('headmaster') || 
    p.designation.toLowerCase().includes('head mistress')
  );

  // Filter out principal from the rest of the faculty to avoid duplication
  const otherFaculty = result?.personnel.filter(p => p !== principalInfo) || [];

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-slate-50 dark:bg-[#070814] text-slate-900 dark:text-slate-100 relative">
      <AnimatePresence mode="wait">
        {/* VIEW 1: SEARCH PAGE */}
        {activeSubView === 'search' && !loading && (
          <motion.div 
            key="search-view"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="flex-grow flex flex-col justify-center items-center p-4 sm:p-8 overflow-y-auto no-scrollbar"
          >
            <div className="max-w-2xl w-full space-y-8 my-auto">
              {/* Back to Hub Header Button */}
              <div className="flex justify-start">
                <button
                  onClick={onBack}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-[#0d0e1f] border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer shadow-xs"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Hub</span>
                </button>
              </div>

              {/* Header Title Accent */}
              <div className="text-center space-y-3">
                <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold tracking-tight">
                  <GraduationCap className="w-4 h-4" />
                  <span>Verified BANBEIS Educational Registry Client</span>
                </div>
                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
                  One Click <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Information</span>
                </h1>
                <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  Extract accurate, real-time public educational directories, helpline contact details, and beautiful campus views instantly.
                </p>
              </div>

              {/* Main Search Input Form Card */}
              <div className="bg-white dark:bg-[#0c0d18] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5" />
                    <span>Search Query</span>
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="Enter EIIN Number (e.g. 104690) or School/College Name..."
                      className="flex-grow px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#05060d] text-slate-950 dark:text-white focus:bg-white dark:focus:bg-[#080914] focus:ring-2 focus:ring-indigo-500/50 outline-none text-sm transition-all shadow-inner placeholder-slate-400 dark:placeholder-slate-600"
                    />
                    <button
                      onClick={() => handleSearch()}
                      disabled={loading || !input.trim()}
                      className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 text-white rounded-xl flex items-center justify-center gap-2 transition-all font-bold tracking-tight shadow-xs cursor-pointer shrink-0"
                    >
                      <Search className="w-4 h-4" />
                      <span>Extract Info</span>
                    </button>
                  </div>
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="flex items-start gap-3 p-3.5 bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl border border-red-500/20">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <p className="text-xs sm:text-sm font-semibold">{error}</p>
                  </div>
                )}

                {/* Quick Suggestion Chips */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-900">
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 block mb-2.5 uppercase tracking-wider">Quick Verified Institutions</span>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_SUGGESTIONS.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSearch(suggestion.code)}
                        className="text-xs px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-500 hover:text-white dark:bg-[#121324] dark:hover:bg-indigo-600 dark:hover:text-white border border-slate-200/50 dark:border-slate-800/60 text-slate-600 dark:text-slate-300 transition-all font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Building className="w-3.5 h-3.5" />
                        <span>{suggestion.name}</span>
                        <ChevronRight className="w-3 h-3 opacity-60" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Information disclaimer card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-white dark:bg-[#0c0d18] rounded-2xl border border-slate-200/60 dark:border-slate-800/60 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">BANBEIS Official Integration</h4>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">Direct connection with Bangladesh Bureau of Educational Information and Statistics for authentic administrative meta.</p>
                  </div>
                </div>
                <div className="p-4 bg-white dark:bg-[#0c0d18] rounded-2xl border border-slate-200/60 dark:border-slate-800/60 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Google API Grounding</h4>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">Real-time web verification & Custom Search indexing pipelines to fetch current campus photographs & public email indices.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* VIEW 2: LOADING SCREEN */}
        {loading && (
          <motion.div 
            key="loading-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-grow flex flex-col justify-center items-center p-6 bg-slate-50 dark:bg-[#070814]"
          >
            <div className="max-w-md w-full text-center space-y-6">
              <div className="relative inline-flex items-center justify-center">
                <div className="w-20 h-20 rounded-full border-4 border-indigo-500/20 border-t-indigo-600 animate-spin"></div>
                <GraduationCap className="w-8 h-8 text-indigo-500 absolute" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Extracting Live Information...</h3>
                <p className="text-xs text-indigo-500 font-bold tracking-wider font-mono uppercase bg-indigo-500/10 px-3 py-1 rounded-full inline-block">
                  {searchStep || "Please wait..."}
                </p>
                <p className="text-xs text-slate-400 max-w-xs mx-auto pt-2">
                  We are looking up official government records, querying Google Search indexes, and organizing faculty rosters for accurate output.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* VIEW 3: RESULTS DETAILS PAGE (Next Page) */}
        {activeSubView === 'result' && result && !loading && (
          <motion.div 
            key="result-view"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex-grow flex flex-col overflow-hidden h-full bg-slate-50 dark:bg-[#05060f]"
          >
            {/* Top Navigation Bar with Clear Back Button */}
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c0d18] flex items-center justify-between shadow-xs shrink-0 z-30">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setActiveSubView('search');
                    setResult(null);
                  }}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-[#121324] dark:hover:bg-slate-800 rounded-xl text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1.5 transition-all cursor-pointer border border-slate-200/55 dark:border-slate-800/80 shadow-xs"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Search</span>
                </button>
                <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>
                <div className="hidden sm:flex items-center gap-2">
                  <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-md">
                    EIIN: {result.institution_info.eiin}
                  </span>
                  <span className="text-xs text-slate-500 font-semibold truncate max-w-[200px]">
                    {result.institution_info.name}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-emerald-500 text-xs font-black bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/25">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Official Live Record</span>
                <span className="sm:hidden">Live</span>
              </div>
            </div>

            {/* Scrollable Main results container */}
            <div className="flex-grow overflow-y-auto no-scrollbar p-4 sm:p-6 space-y-6">
              
              {/* Institution Header Hero Card with beautiful picture */}
              <div className="bg-white dark:bg-[#0c0d18] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden relative">
                {/* Banner Image */}
                <div className="h-56 sm:h-72 w-full overflow-hidden relative bg-slate-900">
                  <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/40 to-transparent z-10"></div>
                  <img 
                    src={result.institution_info.image_url || "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=1200"} 
                    alt="Campus" 
                    className="w-full h-full object-cover scale-102 hover:scale-105 transition-all duration-700"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=1200";
                    }}
                  />
                  
                  {/* Verification & Tech Badge */}
                  <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/90 text-white font-bold text-[10px] sm:text-xs tracking-tight shadow-md backdrop-blur-xs">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    BANBEIS & Search Grounded
                  </div>

                  {/* Absolute overlay content for title */}
                  <div className="absolute bottom-6 left-6 right-6 z-20 text-white space-y-2">
                    <span className="inline-block px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-black uppercase tracking-wider bg-indigo-600 text-white shadow-xs">
                      {result.institution_info.type || "Institution"}
                    </span>
                    <h2 className="text-xl sm:text-4xl font-black tracking-tight leading-tight mb-2 drop-shadow-sm">
                      {result.institution_info.name}
                    </h2>
                    <p className="text-xs sm:text-base text-slate-200 flex items-center gap-1 opacity-90 font-medium">
                      <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
                      {result.institution_info.location}
                    </p>
                  </div>
                </div>

                {/* Grid details under the banner image */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 bg-white dark:bg-[#0c0d18]">
                  {/* Basic Metadata */}
                  <div className="space-y-3.5 md:border-r border-slate-100 dark:border-slate-800/60 md:pr-6">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Metadata Registry</h3>
                    <div className="space-y-2.5">
                      <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center justify-between">
                        <span className="font-semibold text-slate-400">EIIN:</span>
                        <span className="font-mono font-bold text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-md text-xs">{result.institution_info.eiin}</span>
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center justify-between">
                        <span className="font-semibold text-slate-400">Upazila:</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">{result.institution_info.upazila || "N/A"}</span>
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center justify-between">
                        <span className="font-semibold text-slate-400">District:</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">{result.institution_info.district || "N/A"}</span>
                      </p>
                    </div>
                  </div>

                  {/* Primary Office Contact */}
                  <div className="space-y-3.5 md:border-r border-slate-100 dark:border-slate-800/60 md:px-6">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Office Helpline</h3>
                    <div className="space-y-2.5">
                      <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center justify-between">
                        <span className="font-semibold text-slate-400">Phone:</span>
                        {result.institution_info.phone && result.institution_info.phone !== 'N/A' && result.institution_info.phone !== 'null' ? (
                          <a href={`tel:${result.institution_info.phone}`} className="text-indigo-500 hover:underline font-semibold font-mono">{result.institution_info.phone}</a>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-600 text-xs">Not available</span>
                        )}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center justify-between">
                        <span className="font-semibold text-slate-400">Email:</span>
                        {result.institution_info.email && result.institution_info.email !== 'N/A' && result.institution_info.email !== 'null' ? (
                          <a href={`mailto:${result.institution_info.email}`} className="text-indigo-500 hover:underline font-semibold truncate max-w-[150px]">{result.institution_info.email}</a>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-600 text-xs">Not available</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Official Online Portal */}
                  <div className="space-y-3.5 md:pl-6 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Online Web Portal</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                        {result.institution_info.website && result.institution_info.website !== 'N/A' && result.institution_info.website !== 'null' ? (
                          <a 
                            href={result.institution_info.website.startsWith('http') ? result.institution_info.website : `http://${result.institution_info.website}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="inline-flex items-center gap-1.5 text-indigo-500 hover:underline font-bold text-sm"
                          >
                            <Globe className="w-4 h-4 shrink-0" />
                            <span>Visit Portal</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-600 text-xs flex items-center gap-1.5 mt-2">
                            <Globe className="w-4 h-4 text-slate-300 dark:text-slate-700" />
                            No website registered
                          </span>
                        )}
                      </p>
                    </div>
                    {result.institution_info.phone && result.institution_info.phone !== 'N/A' && (
                      <a
                        href={`tel:${result.institution_info.phone}`}
                        className="mt-4 sm:mt-0 w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        Call Office Desk
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Spotlight: Principal/Headmaster's Card if available */}
              {(principalInfo || result.institution_info.principal) && (
                <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/5 dark:from-indigo-950/20 dark:to-purple-950/10 p-6 rounded-2xl border border-indigo-500/20 dark:border-indigo-500/15 relative overflow-hidden">
                  <div className="absolute top-3 right-3 text-indigo-500/20">
                    <Award className="w-24 h-24 stroke-1" />
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-4 flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    <span>Principal / Administration Lead</span>
                  </h3>
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 relative z-10">
                    <div className="w-20 h-20 rounded-full bg-white dark:bg-[#0c0d18] border-2 border-indigo-500 shrink-0 overflow-hidden shadow-md">
                      {principalInfo?.photo_url ? (
                        <img 
                          src={principalInfo.photo_url} 
                          alt={principalInfo.name || "Principal"} 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(principalInfo?.name || 'Principal')}`;
                          }}
                        />
                      ) : (
                        <img 
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(result.institution_info.principal || 'Principal')}`} 
                          alt="Principal"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="text-center sm:text-left space-y-1">
                      <h4 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white leading-tight">
                        {principalInfo?.name || result.institution_info.principal}
                      </h4>
                      <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                        {principalInfo?.designation || "Principal / Head of Institution"}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium pt-1">
                        {principalInfo?.department && principalInfo.department !== "null" ? `Department: ${principalInfo.department}` : "General Administration"}
                      </p>

                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-3 text-xs">
                        {(principalInfo?.phone || result.institution_info.phone) && (
                          <a 
                            href={`tel:${principalInfo?.phone || result.institution_info.phone}`} 
                            className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-indigo-600 font-semibold font-mono"
                          >
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{principalInfo?.phone || result.institution_info.phone}</span>
                          </a>
                        )}
                        {(principalInfo?.email || result.institution_info.email) && (
                          <a 
                            href={`mailto:${principalInfo?.email || result.institution_info.email}`} 
                            className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-indigo-600 font-semibold"
                          >
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span className="truncate max-w-[180px]">{principalInfo?.email || result.institution_info.email}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Faculty / Teacher Directory */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                  <span>Faculties & Administration ({otherFaculty.length})</span>
                </h3>
                
                {otherFaculty.length === 0 ? (
                  <div className="text-center py-12 bg-white dark:bg-[#0c0d18] rounded-2xl border border-slate-200 dark:border-slate-800">
                    <User className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500 dark:text-slate-400">No other personnel directory available for this campus.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {otherFaculty.map((person, idx) => (
                      <div 
                        key={idx} 
                        className="bg-white dark:bg-[#0c0d18] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4 hover:border-indigo-500/30 dark:hover:border-indigo-500/30 transition-all group"
                      >
                        <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center shrink-0 overflow-hidden border border-slate-200 dark:border-slate-800/80 shadow-inner">
                          {person.photo_url ? (
                            <img 
                              src={person.photo_url} 
                              alt={person.name} 
                              className="w-full h-full object-cover" 
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(person.name)}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
                              }}
                            />
                          ) : (
                            <img 
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(person.name)}&backgroundColor=b6e3f4,c0aede,d1d4f9`} 
                              alt={person.name} 
                              className="w-full h-full object-cover" 
                            />
                          )}
                        </div>
                        <div className="flex-grow min-w-0">
                          <h4 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base leading-tight truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {person.name}
                          </h4>
                          <p className="text-xs text-indigo-500 font-bold mt-0.5">{person.designation}</p>
                          <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                            {person.department && person.department !== "null" && person.department !== "N/A" ? person.department : "General academic faculty"}
                          </p>
                          
                          <div className="flex items-center gap-3 mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                            {person.phone && person.phone !== "null" && person.phone !== "N/A" ? (
                              <a 
                                href={`tel:${person.phone}`} 
                                className="text-xs text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 transition-colors"
                                title={`Call ${person.name}`}
                              >
                                <Phone className="w-3.5 h-3.5" />
                                <span className="font-mono text-[10px]">{person.phone}</span>
                              </a>
                            ) : (
                              <span className="text-[10px] text-slate-300 dark:text-slate-600 flex items-center gap-1">
                                <Phone className="w-3.5 h-3.5 opacity-40" />
                                <span>No Phone</span>
                              </span>
                            )}

                            {person.email && person.email !== "null" && person.email !== "N/A" ? (
                              <a 
                                href={`mailto:${person.email}`} 
                                className="text-xs text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 transition-colors ml-auto truncate"
                                title={`Email ${person.name}`}
                              >
                                <Mail className="w-3.5 h-3.5" />
                                <span className="text-[10px] truncate max-w-[100px]">{person.email}</span>
                              </a>
                            ) : (
                              <span className="text-[10px] text-slate-300 dark:text-slate-600 flex items-center gap-1 ml-auto">
                                <Mail className="w-3.5 h-3.5 opacity-40" />
                                <span>No Email</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
