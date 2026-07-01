import { LucideIcon, Tv, Briefcase, Shield, Cpu, Zap, Eye, Terminal, Sparkles, Sliders, Trophy, Languages, FileText, Globe, BookOpen } from "lucide-react";

export type RegistryToolCategory =
  | "AI"
  | "Streaming"
  | "Security"
  | "Utilities"
  | "Web Tools"
  | "Sports"
  | "Developer Tools";

export interface RegisteredTool {
  id: string;
  name: string;
  route: string;
  category: RegistryToolCategory;
  version: string;
  status: "Live" | "Beta" | "Coming Soon";
  description: string;
  bnDescription?: string;
  icon: LucideIcon;
  actionText?: string;
  glowColor?: string;
  iconBgColor?: string;
}

export const TOOL_CATEGORIES: RegistryToolCategory[] = [
  "AI",
  "Streaming",
  "Security",
  "Utilities",
  "Web Tools",
  "Sports",
  "Developer Tools"
];

export const TOOL_REGISTRY: RegisteredTool[] = [
  {
    id: "one-click-info",
    name: "One Click Information",
    route: "one-click-info",
    category: "Utilities",
    version: "v1.0",
    status: "Live",
    description: "Get comprehensive details about any school, college or university instantly.",
    icon: BookOpen,
    actionText: "Search",
    glowColor: "bg-indigo-600/20",
    iconBgColor: "bg-indigo-500"
  },
  {
    id: "fahim-ai-helper",
    name: "Fahim AI Helper",
    route: "ai-helper",
    category: "AI",
    version: "v1.0",
    status: "Live",
    description: "Multi-model AI Assistant. Chat, generate code, and answer any questions in real-time.",
    icon: Sparkles,
    actionText: "Chat",
    glowColor: "bg-blue-600/20",
    iconBgColor: "bg-blue-500"
  },
  {
    id: "fahim-doc-cloner",
    name: "AI Doc Cloner & Editor",
    route: "doc-cloner",
    category: "AI",
    version: "v1.0",
    status: "Live",
    description: "Recreate, edit and export any Bangla/English CV, application form, government biodata, affidavit, or custom document on A4 with precise layout retention.",
    icon: FileText,
    actionText: "Clone & Edit",
    glowColor: "bg-indigo-600/20",
    iconBgColor: "bg-indigo-500"
  },
  {
    id: "fifa-2026",
    name: "FIFA World Cup 2026™",
    route: "fifa-2026",
    category: "Sports",
    version: "v1.0",
    status: "Live",
    description: "Official 2026 World Cup Match Center. Follow live events, schedules, scores and stream live on Fahim IPTV.",
    icon: Trophy,
    actionText: "Launch",
    glowColor: "bg-amber-500/20",
    iconBgColor: "bg-amber-500"
  },
  {
    id: "fahim-translator",
    name: "Fahim Translator",
    route: "translator",
    category: "AI",
    version: "v1.0",
    status: "Live",
    description: "High-precision multilingual translation and communication engine.",
    icon: Languages,
    actionText: "Translate",
    glowColor: "bg-purple-600/20",
    iconBgColor: "bg-purple-500"
  },
  {
    id: "fahim-ip-tv",
    name: "Fahim IPTV",
    route: "iptv",
    category: "Streaming",
    version: "v1.0",
    status: "Live",
    description: "Premium IPTV streaming client with global channels and fast category filters.",
    icon: Tv,
    actionText: "Launch",
    glowColor: "bg-blue-600/20",
    iconBgColor: "bg-blue-500"
  },
  {
    id: "start-freelancing",
    name: "Start Freelancing",
    route: "freelancing",
    category: "Utilities",
    version: "v1.0",
    status: "Live",
    description: "Beginner-দের জন্য ফ্রিল্যান্সিং গাইডলাইন, কাজের রিসোর্স এবং ক্লায়েন্ট বিডিং হাব। Start your journey today.",
    bnDescription: "এই টুলের মাঝে পাচ্ছেন ক্যারিয়ার সিলেক্টর, সম্পূর্ণ লার্নিং রোডম্যাপ, রিয়েল প্রস্তাব টেমপ্লেট, এবং আর্নিং ক্যালকুলেটর।",
    icon: Briefcase,
    actionText: "Enter",
    glowColor: "bg-emerald-600/20",
    iconBgColor: "bg-emerald-500"
  },
  {
    id: "fahim-api-tester",
    name: "FAHIM API TESTER",
    route: "fahim-api-tester",
    category: "Developer Tools",
    version: "v1.0",
    status: "Live",
    description: "Test APIs, validate API keys, inspect responses, monitor latency and verify OpenAI-compatible endpoints.",
    icon: Terminal,
    actionText: "Launch",
    glowColor: "bg-purple-600/20",
    iconBgColor: "bg-purple-600"
  },
  {
    id: "ethical-hacking",
    name: "Ethical Hacking Hub",
    route: "ethical-hacking",
    category: "Security",
    version: "v1.0",
    status: "Live",
    description: "Multi-category security testing toolkit including information gathering, SQL Injection, custom wordlist generation, proxy chains, and more.",
    icon: Shield,
    actionText: "Use",
    glowColor: "bg-[#ef4444]/25",
    iconBgColor: "bg-[#ef4444]"
  },
  {
    id: "cyber-sentinel",
    name: "Cyber Sentinel",
    route: "cyber-sentinel",
    category: "Security",
    version: "v0.1",
    status: "Coming Soon",
    description: "Advanced active port auditor and network environment security validation.",
    icon: Shield,
    glowColor: "bg-red-600/20",
    iconBgColor: "bg-red-500"
  },
  {
    id: "helix-core",
    name: "Helix Utilities",
    route: "helix-utilities",
    category: "Utilities",
    version: "v0.1",
    status: "Coming Soon",
    description: "High-speed developer minifiers, secure hash creators, and base64 encoders.",
    icon: Cpu,
    glowColor: "bg-purple-600/20",
    iconBgColor: "bg-purple-500"
  },
  {
    id: "vector-speed",
    name: "Vector Speed",
    route: "vector-speed",
    category: "Web Tools",
    version: "v0.1",
    status: "Coming Soon",
    description: "Real-time network throughput calculation and streaming latency metrics.",
    icon: Zap,
    glowColor: "bg-amber-600/20",
    iconBgColor: "bg-amber-500"
  },
  {
    id: "osint-tracker",
    name: "OSINT Investigator",
    route: "osint-tracker",
    category: "Security",
    version: "v0.1",
    status: "Coming Soon",
    description: "Open source intelligence gathering utility for username, email, and domain tracking.",
    icon: Eye,
    glowColor: "bg-indigo-600/20",
    iconBgColor: "bg-indigo-500"
  },
  {
    id: "ai-copilot",
    name: "AI Automation Sandbox",
    route: "ai-sandbox",
    category: "Utilities",
    version: "v0.1",
    status: "Coming Soon",
    description: "Multi-modal sandbox with prompt engineers and real-time prompt builders.",
    icon: Sparkles,
    glowColor: "bg-pink-600/20",
    iconBgColor: "bg-pink-500"
  },
  {
    id: "cron-automator",
    name: "Task Automator Engine",
    route: "task-automator",
    category: "Utilities",
    version: "v0.1",
    status: "Coming Soon",
    description: "Schedule automated tasks and generate pipeline configs without coding skills.",
    icon: Sliders,
    glowColor: "bg-teal-600/20",
    iconBgColor: "bg-teal-500"
  }
];
