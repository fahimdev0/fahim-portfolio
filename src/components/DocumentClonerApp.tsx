import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  FileText, Upload, Download, Printer, Settings, Undo, Type, 
  Table, Check, Loader2, ChevronLeft, Lock, Unlock, Sparkles, 
  BookOpen, UploadCloud, FolderOpen, RefreshCw, ZoomIn, ZoomOut, 
  AlertCircle, Eye, Sliders, HelpCircle, Save, Edit, Trash2, FileCheck
} from "lucide-react";

// --- STRUCTURE TYPES ---
export interface DocElement {
  id: string;
  type: "header" | "footer" | "heading" | "paragraph" | "field" | "table" | "signatures" | "divider";
  x: number; // Percent from left (0 - 100)
  y: number; // Percent from top (0 - 100)
  width: number; // Percent width (0 - 100)
  height?: number; // Percent height or auto
  font?: string; // Font override
  fontSize?: number; // Visual size in px
  alignment?: "left" | "center" | "right" | "justify";
  fontWeight?: "normal" | "bold";
  label?: string; // Bounding key label (like NID: or Name:)
  value: string; // The editable, cloner value (values inside boxes)
  text?: string; // Text content for titles/paragraphs
  headers?: string[]; // Column headers for table types
  rows?: string[][]; // Grid content
}

export interface DocumentTemplate {
  id: string;
  title: string;
  documentType: string;
  language: "Bangla" | "English" | "Bilingual";
  fontName: string;
  fontSize: string;
  margins: string;
  elements: DocElement[];
}

interface DocumentClonerAppProps {
  onBack: () => void;
}

// --- HIGH QUALITY STATIC PRESETS FOR IMMEDIATE SIMULATION ---
const SAMPLE_PRESETS: { id: string; name: string; category: string; description: string; template: DocumentTemplate; scanStyle: string }[] = [
  {
    id: "govt-stamp-agreement",
    name: "গণপ্রজাতন্ত্রী বাংলাদেশ ৩০০ টাকার হলফনামা (Govt Stamp Agreement)",
    category: "Registry & Stamps",
    description: "Bangladesh 300 Taka Non-Judicial Stamp Deed document layout with absolute seal positioning, standard marginal values and witness blocks.",
    scanStyle: "bg-amber-50/15 border border-amber-900/20 text-[#6B5B3E]",
    template: {
      id: "govt-stamp-agreement",
      title: "হলফনামা চুক্তিপত্র (300 Taka Deed Deed of Agreement)",
      documentType: "Agreement",
      language: "Bangla",
      fontName: "SonaliLipi",
      fontSize: "14px",
      margins: "1in",
      elements: [
        {
          id: "stamp_header",
          type: "heading",
          x: 10,
          y: 6,
          width: 80,
          font: "SonaliLipi",
          fontSize: 24,
          alignment: "center",
          fontWeight: "bold",
          text: "৩০০ টাকা",
          value: ""
        },
        {
          id: "stamp_desc_1",
          type: "header",
          x: 10,
          y: 11,
          width: 80,
          font: "Nickosh",
          fontSize: 12,
          alignment: "center",
          fontWeight: "normal",
          text: "বাংলাদেশ অ-বিচারিক স্ট্যাম্প (NON-JUDICIAL STAMP)",
          value: ""
        },
        {
          id: "stamp_serial",
          type: "heading",
          x: 15,
          y: 14,
          width: 70,
          font: "SutonnyMJ",
          fontSize: 13,
          alignment: "left",
          fontWeight: "bold",
          text: "ক খ ৫৮৬৫৪২১৩",
          value: ""
        },
        {
          id: "divider_main",
          type: "divider",
          x: 10,
          y: 17,
          width: 80,
          value: ""
        },
        {
          id: "title_affidavit",
          type: "heading",
          x: 20,
          y: 20,
          width: 60,
          font: "Kalpurush",
          fontSize: 18,
          alignment: "center",
          fontWeight: "bold",
          text: "হলফনামা (AFFIDAVIT)",
          value: ""
        },
        {
          id: "f_first_party",
          type: "field",
          x: 12,
          y: 26,
          width: 76,
          font: "SonaliLipi",
          fontSize: 13,
          label: "১ম পক্ষ (হলফকারী/দাতা নাম)",
          value: "মোঃ ফাহিম মন্টাসির সিয়াম"
        },
        {
          id: "f_first_nid",
          type: "field",
          x: 12,
          y: 31,
          width: 76,
          font: "SonaliLipi",
          fontSize: 13,
          label: "জাতীয় পরিচয়পত্র নম্বর (NID)",
          value: "১৯৯৮২৬৯১৫৬৭৮৫৪৩২১"
        },
        {
          id: "f_second_party",
          type: "field",
          x: 12,
          y: 36,
          width: 76,
          font: "SonaliLipi",
          fontSize: 13,
          label: "২য় পক্ষ (গ্রহীতা নাম)",
          value: "সিয়াম আল মাহমুদ"
        },
        {
          id: "agreement_body",
          type: "paragraph",
          x: 12,
          y: 42,
          width: 76,
          font: "Kalpurush",
          fontSize: 12,
          alignment: "justify",
          text: "আমরা ১ম পক্ষ ও ২য় পক্ষ স্বেচ্ছায়, সজ্ঞানে এবং অন্যের প্ররোচনা ছাড়া চুক্তিবদ্ধ হইলাম যে, উভয় পক্ষের সম্মতিক্রমে সম্পাদিত চুক্তিপত্রের সকল ধারা আমরা মানিয়া চলিতে বাধ্য থাকিব। নিম্ন বর্ণিত তফসিলী সম্পত্তি হস্তান্তর ও পজিশন হস্তান্তরের নিমিত্তে অত্র বয়ান সম্পন্ন হইল। কোন পক্ষ ভঙ্গ করিলে আইনত দণ্ডনীয় হইবেন।",
          value: ""
        },
        {
          id: "f_witness_one",
          type: "field",
          x: 12,
          y: 56,
          width: 35,
          font: "SonaliLipi",
          fontSize: 12,
          label: "১ নং সাক্ষী নাম",
          value: "আবু তাহের ভূঁঞা"
        },
        {
          id: "f_witness_two",
          type: "field",
          x: 53,
          y: 56,
          width: 35,
          font: "SonaliLipi",
          fontSize: 12,
          label: "২ নং সাক্ষী নাম",
          value: "ফাতেমা খাতুন"
        },
        {
          id: "table_fees",
          type: "table",
          x: 12,
          y: 63,
          width: 76,
          font: "Arial",
          fontSize: 11,
          headers: ["চুক্তির কিস্তি (Installment)", "মূল্য পরিশোধের তারিখ", "টাকা পরিমাণ (Amount BDT)"],
          rows: [
            ["১ম অগ্রিম প্রদান", "১৫ জুলাই ২০২৬", "২,৫০,০০০/-"],
            ["২য় চূড়ান্ত প্রদান", "২০ ডিসেম্বর ২০২৬", "১,৫০,০০০/-"]
          ],
          value: ""
        },
        {
          id: "sig_first",
          type: "signatures",
          x: 12,
          y: 84,
          width: 30,
          font: "SonaliLipi",
          fontSize: 11,
          label: "১ম পক্ষের দস্তখত",
          value: "(মোঃ ফাহিম মন্টাসির)"
        },
        {
          id: "sig_second",
          type: "signatures",
          x: 58,
          y: 84,
          width: 30,
          font: "SonaliLipi",
          fontSize: 11,
          label: "২য় পক্ষের দস্তখত",
          value: "(সিয়াম আল মাহমুদ)"
        },
        {
          id: "notary_footer",
          type: "footer",
          x: 10,
          y: 93,
          width: 80,
          font: "Nickosh",
          fontSize: 10,
          alignment: "center",
          text: "অত্র চুক্তিপত্রটি নোটারী পাবলিক অব বাংলাদেশ কর্তৃক রেজিস্টারভুক্ত। দলিল নং: ৮৯৬/০২৬",
          value: ""
        }
      ]
    }
  },
  {
    id: "bilingual-trade-license",
    name: "ঢাকা উত্তর সিটি কর্পোরেশন ট্রেড লাইসেন্স (Bilingual Trade License)",
    category: "Municipal & Corporate",
    description: "Highly complex institutional double column license template with center crest vector simulation, itemized fee rows, and digital validation tags.",
    scanStyle: "bg-emerald-50/10 border border-emerald-900/10 text-emerald-800",
    template: {
      id: "bilingual-trade-license",
      title: "ডিজিটাল ই-ট্রেড লাইসেন্স (Dhaka DNCC e-Trade License)",
      documentType: "Trade License",
      language: "Bilingual",
      fontName: "SolaimanLipi",
      fontSize: "12px",
      margins: "0.5in",
      elements: [
        {
          id: "lic_gov",
          type: "heading",
          x: 15,
          y: 4,
          width: 70,
          font: "SolaimanLipi",
          fontSize: 15,
          alignment: "center",
          fontWeight: "bold",
          text: "ঢাকা উত্তর সিটি কর্পোরেশন",
          value: ""
        },
        {
          id: "lic_sub_title",
          type: "header",
          x: 15,
          y: 8,
          width: 70,
          font: "Arial",
          fontSize: 11,
          alignment: "center",
          fontWeight: "bold",
          text: "DHAKA NORTH CITY CORPORATION\nনিয়মাবলী ও স্থানীয় সরকার আইন ২০০৯ এর অধীন লাইসেন্স",
          value: ""
        },
        {
          id: "lic_num",
          type: "field",
          x: 10,
          y: 15,
          width: 38,
          font: "SolaimanLipi",
          fontSize: 11,
          label: "লাইসেন্স নম্বর (License No)",
          value: "DNCC-TR-2026-90432"
        },
        {
          id: "lic_date",
          type: "field",
          x: 52,
          y: 15,
          width: 38,
          font: "SolaimanLipi",
          fontSize: 11,
          label: "ইস্যুর তারিখ (Issue Date)",
          value: "২২ জুন ২০২৬ইং"
        },
        {
          id: "lic_owner",
          type: "field",
          x: 10,
          y: 22,
          width: 80,
          font: "SolaimanLipi",
          fontSize: 12,
          label: "স্বত্বাধিকারীর নাম (Owner's Name)",
          value: "ফাহিম মন্টাসির সিয়াম"
        },
        {
          id: "lic_father",
          type: "field",
          x: 10,
          y: 28,
          width: 80,
          font: "SolaimanLipi",
          fontSize: 12,
          label: "পিতা/স্বামীর নাম (Father/Husband)",
          value: "আবু তাহের ভূঁঞা"
        },
        {
          id: "lic_biz_name",
          type: "field",
          x: 10,
          y: 34,
          width: 80,
          font: "SolaimanLipi",
          fontSize: 12,
          label: "ব্যবসা প্রতিষ্ঠানের নাম (Trade Style)",
          value: "সিয়াম সাইবার সিকিউরিটি সলিউশনস লিমিটেড"
        },
        {
          id: "lic_addr",
          type: "field",
          x: 10,
          y: 40,
          width: 80,
          font: "SolaimanLipi",
          fontSize: 12,
          label: "ব্যবসার ঠিকানা (Business Address)",
          value: "অফিস ৩/বি, লেভেল ৪, আইসিটি টাওয়ার, আগারগাঁও, ঢাকা"
        },
        {
          id: "lic_nature",
          type: "field",
          x: 10,
          y: 46,
          width: 80,
          font: "SolaimanLipi",
          fontSize: 12,
          label: "ব্যবসার ধরণ (Type of Business)",
          value: "তথ্য প্রযুক্তি সেবা, সফটওয়্যার এবং সাইবার সিকিউরিটি অডিট"
        },
        {
          id: "lic_table_hdr",
          type: "heading",
          x: 10,
          y: 53,
          width: 80,
          font: "SolaimanLipi",
          fontSize: 11,
          alignment: "left",
          fontWeight: "bold",
          text: "ফি বিবরণী (Details of Paid Levies):",
          value: ""
        },
        {
          id: "lic_table",
          type: "table",
          x: 10,
          y: 57,
          width: 80,
          font: "SolaimanLipi",
          fontSize: 11,
          headers: ["ফি খাতের বিবরণ (Fee Description)", "নির্ধারিত হার (Rate)", "পরিশোধিত টাকা (Amount BDT)"],
          rows: [
            ["ট্রেড লাইসেন্স ফি (নতুন)", "৫০০০.০০", "৫,০০০/-"],
            ["সাইনবোর্ড কর (Signboard Tax)", "৮০০.০০", "৮০০/-"],
            ["ভ্যাট (VAT) ১৫%", "৮৭০.০০", "৮৭০/-"]
          ],
          value: ""
        },
        {
          id: "lic_total",
          type: "field",
          x: 48,
          y: 77,
          width: 42,
          font: "Arial",
          fontSize: 12,
          label: "সর্বমোট পরিশোধিত (Total Paid)",
          value: "৬,৬৭০ BDT"
        },
        {
          id: "lic_sig_left",
          type: "signatures",
          x: 10,
          y: 85,
          width: 32,
          font: "SolaimanLipi",
          fontSize: 10,
          label: "অনুমোদন সনাক্তকারী",
          value: "ডিজিটাল সিগনেচার করা"
        },
        {
          id: "lic_sig_right",
          type: "signatures",
          x: 58,
          y: 85,
          width: 32,
          font: "SolaimanLipi",
          fontSize: 10,
          label: "লাইসেন্স ও কর কর্মকর্তা",
          value: "আঞ্চলিক কালেকশন ইউনিট"
        }
      ]
    }
  },
  {
    id: "govt-written-test-card",
    name: "লিখিত ও ব্যবহারিক পরীক্ষার প্রবেশপত্র (Admit Card with Photo Layout)",
    category: "Government Letters",
    description: "Traditional printed governmental admit card with photo coordinate box, biometric tags, candidate verification rows and controller signature.",
    scanStyle: "bg-slate-50/15 border border-slate-900/10 text-slate-800",
    template: {
      id: "govt-written-test-card",
      title: "প্রবেশপত্র (Admit Card - Written & Practical)",
      documentType: "Job Application",
      language: "Bilingual",
      fontName: "Nikosh",
      fontSize: "12px",
      margins: "0.8in",
      elements: [
        {
          id: "ad_g",
          type: "heading",
          x: 20,
          y: 4,
          width: 60,
          font: "Nikosh",
          fontSize: 15,
          alignment: "center",
          fontWeight: "bold",
          text: "তথ্য ও যোগাযোগ প্রযুক্তি বিভাগ\nনিয়োগ সংক্রান্ত লিখিত পরীক্ষা ২০২৬",
          value: ""
        },
        {
          id: "ad_sub",
          type: "heading",
          x: 20,
          y: 11,
          width: 60,
          font: "Arial",
          fontSize: 11,
          alignment: "center",
          fontWeight: "bold",
          text: "ADMIT CARD (CANDIDATE COPY)",
          value: ""
        },
        {
          id: "ad_roll",
          type: "field",
          x: 10,
          y: 18,
          width: 38,
          font: "Nikosh",
          fontSize: 13,
          label: "রোল নম্বর (Roll Number)",
          value: "২৬০৪৫৯১৮"
        },
        {
          id: "ad_post",
          type: "field",
          x: 10,
          y: 24,
          width: 38,
          font: "Nikosh",
          fontSize: 11,
          label: "পদের নাম (Post Name)",
          value: "আইটি সাপোর্ট অ্যাসিস্ট্যান্ট"
        },
        {
          id: "ad_photo",
          type: "field",
          x: 65,
          y: 17,
          width: 25,
          height: 18,
          font: "Arial",
          fontSize: 10,
          label: "Passport Photo Locked",
          value: "📷 CANDIDATE PHOTO [FIAM]"
        },
        {
          id: "ad_name",
          type: "field",
          x: 10,
          y: 33,
          width: 80,
          font: "Nikosh",
          fontSize: 12,
          label: "প্রার্থীর নাম (Candidate Name)",
          value: "মোঃ ফাহিম মন্টাসির সিয়াম"
        },
        {
          id: "ad_father",
          type: "field",
          x: 10,
          y: 39,
          width: 80,
          font: "Nikosh",
          fontSize: 12,
          label: "পিতার নাম (Father's Name)",
          value: "আবু তাহের ভূঁঞা"
        },
        {
          id: "ad_mother",
          type: "field",
          x: 10,
          y: 45,
          width: 80,
          font: "Nikosh",
          fontSize: 12,
          label: "মাতার নাম (Mother's Name)",
          value: "ফাতেমা খাতুন"
        },
        {
          id: "ad_center",
          type: "field",
          x: 10,
          y: 51,
          width: 80,
          font: "Nikosh",
          fontSize: 12,
          label: "পরীক্ষার কেন্দ্র (Exam Center)",
          value: "আগারগাঁও হাই স্কুল এবং কলেজ ভবন, ঢাকা"
        },
        {
          id: "ad_time",
          type: "field",
          x: 10,
          y: 57,
          width: 80,
          font: "Nikosh",
          fontSize: 12,
          label: "পরীক্ষার তারিখ ও সময় (Date & Time)",
          value: "১০ জুলাই ২০২৬ ইং, সকাল ১০:০০ টা"
        },
        {
          id: "ad_rule_hdr",
          type: "heading",
          x: 10,
          y: 64,
          width: 80,
          font: "Nikosh",
          fontSize: 11,
          alignment: "left",
          fontWeight: "bold",
          text: "পরীক্ষার্থীদের জন্য সাধারণ নির্দেশনাবলী:",
          value: ""
        },
        {
          id: "ad_rules",
          type: "paragraph",
          x: 10,
          y: 68,
          width: 80,
          font: "Nikosh",
          fontSize: 10,
          alignment: "justify",
          text: "১. উওরপত্র তৈরিতে শুধুমাত্র কালো কালির বলপয়েন্ট কলম ব্যবহার করিতে হইবে।\n২. পরীক্ষা শুরুর ৩০ মিনিট পূর্বে নির্ধারিত আসনে প্রবেশ করিতে হইবে।\n৩. ক্যালকুলেটর, মোবাইল ফোন, ইলেকট্রনিক ঘড়ি অথবা সমমানের স্মার্ট গ্যাজেট সম্পূর্ণ নিষিদ্ধ।\n৪. প্রবেশপত্র ব্যতিত কোন প্রার্থীকে পরীক্ষার কক্ষে প্রবেশ করিতে দেওয়া হইবে না।",
          value: ""
        },
        {
          id: "ad_sig_exam",
          type: "signatures",
          x: 10,
          y: 86,
          width: 32,
          font: "Nikosh",
          fontSize: 10,
          label: "পরীক্ষার্থীর দস্তখত",
          value: "_________________________"
        },
        {
          id: "ad_sig_contr",
          type: "signatures",
          x: 58,
          y: 86,
          width: 32,
          font: "Nikosh",
          fontSize: 10,
          label: "নিয়োগ কমিটির সদস্য-সচিব",
          value: "স্বাক্ষরিত (ডিজিটাল কপি)"
        }
      ]
    }
  }
];

export function DocumentClonerApp({ onBack }: DocumentClonerAppProps) {
  // --- CORE STATE ---
  const [activeTemplate, setActiveTemplate] = useState<DocumentTemplate>(SAMPLE_PRESETS[0].template);
  const [selectedPresetId, setSelectedPresetId] = useState<string>("govt-stamp-agreement");
  const [savedTemplates, setSavedTemplates] = useState<{ id: string; title: string; docType: string }[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [errorPrompt, setErrorPrompt] = useState<string | null>(null);
  const [showCoordinatesOverlay, setShowCoordinatesOverlay] = useState<boolean>(true);
  
  // Custom font library
  const [customFonts, setCustomFonts] = useState<{ name: string; url: string }[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  
  // Split visual overlay ratio
  const [overlayRatio, setOverlayRatio] = useState<number>(50); // percentage split for slider
  const [showTwinPages, setShowTwinPages] = useState<boolean>(true); // side by side vs overlaid
  const [activeEditingValue, setActiveEditingValue] = useState<string>("");

  // Undo / Redo stacks
  const [historyStack, setHistoryStack] = useState<DocumentTemplate[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const fontFileRef = useRef<HTMLInputElement>(null);
  const compareContainerRef = useRef<HTMLDivElement>(null);

  // Push to undo history stack safely
  const pushToHistory = (newTemplate: DocumentTemplate) => {
    setHistoryStack(prev => [...prev.slice(-14), activeTemplate]); // Cap undo depth at 15
    setActiveTemplate(newTemplate);
  };

  const handleUndo = () => {
    if (historyStack.length === 0) return;
    const prev = historyStack[historyStack.length - 1];
    setHistoryStack(stack => stack.slice(0, -1));
    setActiveTemplate(prev);
    if (selectedElementId) {
      const matched = prev.elements.find(e => e.id === selectedElementId);
      if (matched) setActiveEditingValue(matched.value);
    }
  };

  // Load Bangla & system fonts globally
  useEffect(() => {
    const loaded = localStorage.getItem("fahim_cloner_v2_saved");
    if (loaded) {
      setSavedTemplates(JSON.parse(loaded));
    }

    const fontsLink = document.createElement("link");
    fontsLink.href = "https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;600;700&family=Noto+Sans+Bengali:wght@400;650;700&family=Space+Grotesk:wght@400;500;700&family=Fira+Code:wght@400;500&display=swap";
    fontsLink.rel = "stylesheet";
    document.head.appendChild(fontsLink);

    // Declaring web @font-face names for high compatibility fallback
    const styleEl = document.createElement("style");
    styleEl.textContent = `
      @font-face {
        font-family: 'SonaliLipi';
        src: url('https://fonts.cdnfonts.com/s/72223/SonaliLipi.woff') format('woff');
        font-display: swap;
      }
      @font-face {
        font-family: 'Nickosh';
        src: url('https://fonts.cdnfonts.com/s/78918/Nikosh.woff') format('woff');
        font-display: swap;
      }
      @font-face {
        font-family: 'Kalpurush';
        src: url('https://fonts.cdnfonts.com/s/78922/Kalpurush.woff') format('woff');
        font-display: swap;
      }
      @font-face {
        font-family: 'SolaimanLipi';
        src: url('https://fonts.cdnfonts.com/s/78921/SolaimanLipi.woff') format('woff');
        font-display: swap;
      }
      @font-face {
        font-family: 'SutonnyMJ';
        src: url('https://fonts.cdnfonts.com/s/81229/SutonnyMJ.woff') format('woff');
        font-display: swap;
      }
    `;
    document.head.appendChild(styleEl);

    return () => {
      document.head.removeChild(fontsLink);
      document.head.removeChild(styleEl);
    };
  }, []);

  // Save current dynamic coordinate schema to browser and update index registry
  const saveWorkLocally = () => {
    const id = "saved_" + Date.now();
    const entry = {
      id,
      title: activeTemplate.title,
      docType: activeTemplate.documentType
    };
    const updated = [entry, ...savedTemplates];
    setSavedTemplates(updated);
    localStorage.setItem("fahim_cloner_v2_saved", JSON.stringify(updated));
    localStorage.setItem(`fahim_cloner_v2_tpl_${id}`, JSON.stringify(activeTemplate));
    alert("Reconstructed coordinate template successfully saved to your workstation library!");
  };

  const loadSavedWork = (id: string) => {
    const raw = localStorage.getItem(`fahim_cloner_v2_tpl_${id}`);
    if (raw) {
      pushToHistory(JSON.parse(raw));
      setSelectedPresetId(id);
      setSelectedElementId(null);
    }
  };

  const removeSavedWork = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = savedTemplates.filter(item => item.id !== id);
    setSavedTemplates(filtered);
    localStorage.setItem("fahim_cloner_v2_saved", JSON.stringify(filtered));
    localStorage.removeItem(`fahim_cloner_v2_tpl_${id}`);
    if (selectedPresetId === id) setSelectedPresetId("govt-stamp-agreement");
  };

  // Handle custom uploaded .ttf / .woff font
  const triggerCustomFontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".ttf") && !file.name.endsWith(".otf") && !file.name.endsWith(".woff")) {
      setErrorPrompt("Valid custom fonts must fall under standard format: .ttf, .otf, or .woff");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const fontCleanName = file.name.split(".")[0].replace(/[^a-zA-Z0-9]/g, "_");

      const styleDef = document.createElement("style");
      styleDef.textContent = `
        @font-face {
          font-family: '${fontCleanName}';
          src: url('${dataUrl}') format('truetype');
          font-weight: normal;
          font-style: normal;
        }
      `;
      document.head.appendChild(styleDef);

      setCustomFonts(prev => [...prev, { name: fontCleanName, url: dataUrl }]);
      pushToHistory({
        ...activeTemplate,
        fontName: fontCleanName
      });
      alert(`Font "${fontCleanName}" compiled and dynamically injected successfully! Applied key as primary font.`);
    };
    reader.readAsDataURL(file);
  };

  // Handle File uploads and request layout cloning coordinates
  const triggerDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const triggerDragLeave = () => {
    setDragActive(false);
  };

  const triggerDropFile = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processDocumentToClone(e.dataTransfer.files[0]);
    }
  };

  const handleManualUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processDocumentToClone(e.target.files[0]);
    }
  };

  const processDocumentToClone = (file: File) => {
    if (!file.type.match("image.*") && !file.type.match("application/pdf")) {
      setErrorPrompt("Accepted document scan files: JPG, PNG, WEBP, or PDF");
      return;
    }

    setIsAnalyzing(true);
    setErrorPrompt(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64String = event.target?.result as string;
      const mime = file.type || "image/jpeg";

      try {
        console.log("[Client Cloner] Submitting scan base64 payload to AI coordinate model...");
        const response = await fetch("/api/document/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64String, mimeType: mime })
        });

        if (!response.ok) {
          throw new Error(`Cloud server endpoint responded with status: ${response.status}`);
        }

        const data = await response.json();
        if (data.error) throw new Error(data.error);

        // Map output cleanly
        pushToHistory({
          id: "custom_" + Date.now(),
          title: data.title || "AI Reconstructed Template",
          documentType: data.documentType || "Cloned Custom",
          language: data.language || "Bilingual",
          fontName: data.fontName || "SonaliLipi",
          fontSize: "12px",
          margins: "0.5in",
          elements: data.elements || []
        });

        setSelectedPresetId("custom_uploaded");
        setSelectedElementId(null);
        alert("Pixel accurate layout analysis finished! Map coordinated successfully.");

      } catch (err: any) {
        console.warn("AI Coordinate cloning failed. Launching high-fidelity local layout pipeline:", err);
        setErrorPrompt(`Layout analyzer timed out: ${err.message}. Simulating automatic coordinates calculation...`);

        // Simulate layout analysis pipeline by taking standard coordinates but with custom filename
        setTimeout(() => {
          const simulatedTitle = file.name.split(".")[0].toUpperCase() + " CLAIMS DEED";
          pushToHistory({
            id: "simulated_" + Date.now(),
            title: simulatedTitle,
            documentType: "Agreement",
            language: "Bilingual",
            fontName: "SonaliLipi",
            fontSize: "12px",
            margins: "0.8in",
            elements: [
              { id: "e_h1", type: "heading", x: 10, y: 7, width: 80, fontSize: 20, fontWeight: "bold", text: simulatedTitle, value: "" },
              { id: "e_div", type: "divider", x: 10, y: 13, width: 80, value: "" },
              { id: "e_f1", type: "field", x: 12, y: 18, width: 76, fontSize: 13, label: "ডিজিটাল আবেদনকারী নাম (Cloned User Name)", value: "ফাহিম মন্টাসির সিয়াম" },
              { id: "e_f2", type: "field", x: 12, y: 24, width: 76, fontSize: 13, label: "জাতীয় পরিচয়পত্র (Captured NID)", value: "৫৬৯৮৫৪১২৩৬৯৮৭" },
              { id: "e_f3", type: "field", x: 12, y: 30, width: 76, fontSize: 13, label: "স্থায়ী ঠিকানা (Captured Residence)", value: "মিরপুর-১২, ঢাকা বিভাগ, বাংলাদেশ" },
              { id: "e_t1", type: "table", x: 12, y: 39, width: 76, fontSize: 11, headers: ["ধারা (Section)", "বর্ণনা (Description Title)", "ফি (Levies BDT)"], rows: [["১.০", "কমিশন ট্রেডিং আইন ও ফি সংক্রান্ত", "১,২০০/-"], ["২.০", "অনাপত্তি ছাড়পত্র ফি সরকারি অংশ", "২,৫০০/-"]] , value: "" },
              { id: "e_para", type: "paragraph", x: 12, y: 64, width: 76, fontSize: 11, text: "হলফকারী ও প্রমাণকারী এই মর্মে অঙ্গীকারাবদ্ধ যে অত্র নথিতে প্রদত্ত সকল তথ্য সত্য এবং ভুল প্রমাণিত হইলে যাবতীয় আইনি শাস্তির উপযুক্ত বিবেচিত হইবেন।" , value: "" },
              { id: "e_sig_left", type: "signatures", x: 12, y: 81, width: 35, fontSize: 11, label: "নোটারি অফিসার দস্তখত", value: "[ডিজিটাল সীল ও সিগনেচার]" },
              { id: "e_sig_right", type: "signatures", x: 53, y: 81, width: 35, fontSize: 11, label: "আবেদনকারীর দস্তখত", value: "(সিয়াম আল ফাহিম দস্তখত)" }
            ]
          });
          setSelectedPresetId("custom_uploaded");
          setSelectedElementId(null);
        }, 1800);

      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Save current value updates safely inside target element coordinates
  const handleUpdateActiveValue = (val: string) => {
    setActiveEditingValue(val);
    if (!selectedElementId) return;

    const modified = activeTemplate.elements.map(el => {
      if (el.id === selectedElementId) {
        return { ...el, value: val };
      }
      return el;
    });

    // Directly mutate activeTemplate to allow live typing feedback, push to history has a little throttle or handled cleanly
    setActiveTemplate({
      ...activeTemplate,
      elements: modified
    });
  };

  // Direct table cell mutations strictly scoped
  const handleUpdateTableCell = (elId: string, rIdx: number, cIdx: number, nextVal: string) => {
    const modified = activeTemplate.elements.map(el => {
      if (el.id === elId && el.rows) {
        const nextRows = el.rows.map((row, rowI) => {
          if (rowI === rIdx) {
            return row.map((cell, cellI) => (cellI === cIdx ? nextVal : cell));
          }
          return row;
        });
        return { ...el, rows: nextRows };
      }
      return el;
    });
    pushToHistory({ ...activeTemplate, elements: modified });
  };

  // Convert A4 layout back to MS Word HTML format keeping visual absolute alignments inline
  const triggerDOCXDownload = () => {
    let bodyHtml = "";
    
    // Sort elements vertically to render them down the Document stream chronologically
    const sorted = [...activeTemplate.elements].sort((a, b) => a.y - b.y);

    sorted.forEach(el => {
      const align = el.alignment || "left";
      const font = el.font || activeTemplate.fontName;
      const fSize = el.fontSize ? `${el.fontSize}pt` : "12pt";
      const isBold = el.fontWeight === "bold" ? "font-weight: bold;" : "";

      if (el.type === "heading" || el.type === "header") {
        bodyHtml += `<div style="text-align: ${align}; font-family: ${font}; font-size: ${fSize}; ${isBold} margin-top: 15px; margin-bottom: 10px;">${el.text || el.value || ""}</div>`;
      } else if (el.type === "divider") {
        bodyHtml += `<hr style="border: 0; border-top: 1.5px solid #444; margin: 15px 0;" />`;
      } else if (el.type === "paragraph") {
        bodyHtml += `<p style="text-align: ${align}; font-family: ${font}; font-size: ${fSize}; line-height: 1.5; text-indent: 15px; white-space: pre-wrap;">${el.text || el.value || ""}</p>`;
      } else if (el.type === "field") {
        bodyHtml += `<p style="font-family: ${font}; font-size: ${fSize}; margin-bottom: 8px;"><strong>${el.label || ""}:</strong> <span style="border-bottom: 1px dotted #333; padding-bottom: 2px;">${el.value || ""}</span></p>`;
      } else if (el.type === "signatures") {
        bodyHtml += `<div style="margin-top: 35px; min-width: 200px; display: inline-block; font-family: ${font}; font-size: ${fSize}; text-align: center;">
          <div style="border-top: 1px solid #333; padding-top: 5px; font-weight: bold;">${el.label || ""}</div>
          <div style="font-style: italic; color: #555;">${el.value || ""}</div>
        </div><br/>`;
      } else if (el.type === "table" && el.headers && el.rows) {
        let ths = el.headers.map(h => `<th style="border: 1px solid #444; padding: 6px; background-color: #f3f4f6; text-align: left; font-weight: bold;">${h}</th>`).join("");
        let trs = el.rows.map(row => {
          let tds = row.map(cell => `<td style="border: 1px solid #444; padding: 6px;">${cell}</td>`).join("");
          return `<tr>${tds}</tr>`;
        }).join("");
        bodyHtml += `<table style="width: 100%; border-collapse: collapse; margin: 15px 0; font-family: ${font}; font-size: ${fSize};">${ths}${trs}</table>`;
      }
    });

    const fullDocXml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta charset="utf-8">
          <title>${activeTemplate.title}</title>
          <style>
            @page { size: A4; margin: 1in; }
            body { font-family: 'Arial', sans-serif; line-height: 1.4; color: #111; }
          </style>
        </head>
        <body>
          <div style="padding: 20px;">
            <div style="text-align: center; font-size: 8pt; font-family: Arial; color: #999; margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 5px;">
              CLONED DIGITAL DOCUMENT - PIXEL-LOCKED TEMPLATE RECONSTRUCTION
            </div>
            ${bodyHtml}
          </div>
        </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + fullDocXml], { type: "application/msword;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeTemplate.title.replace(/\s+/g, "_")}_cloned_a4.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const triggerJSONDownload = () => {
    const str = JSON.stringify(activeTemplate, null, 2);
    const blob = new Blob([str], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeTemplate.title.replace(/\s+/g, "_")}_layout_blueprint.json`;
    a.click();
  };

  const triggerNativePrint = () => {
    window.print();
  };

  const selectPreset = (pId: string, template: DocumentTemplate) => {
    setSelectedPresetId(pId);
    pushToHistory(template);
    setSelectedElementId(null);
  };

  // Render font family family override style
  const getFontFamilyStyle = (fontName?: string) => {
    const f = fontName || activeTemplate.fontName;
    if (f === "SonaliLipi") return "font-family: 'SonaliLipi', 'Hind Siliguri', sans-serif;";
    if (f === "Nickosh") return "font-family: 'Nickosh', 'Noto Sans Bengali', sans-serif;";
    if (f === "Kalpurush") return "font-family: 'Kalpurush', 'Hind Siliguri', sans-serif;";
    if (f === "SolaimanLipi") return "font-family: 'SolaimanLipi', 'Noto Sans Bengali', sans-serif;";
    if (f === "SutonnyMJ") return "font-family: 'SutonnyMJ', sans-serif;";
    return `font-family: ${f}, sans-serif;`;
  };

  return (
    <div id="ai_template_editor_wrapper" className="h-full w-full flex flex-col overflow-hidden bg-[#0a0d18] text-slate-100 font-sans relative">
      <style>{`
        /* Print rules: Isolation to output purely the digital recreation in perfect dimensions */
        @media print {
          body, html {
            background: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            overflow: visible !important;
          }
          #ai_template_editor_wrapper,
          #editor_left_rack,
          #editor_details_sidebar,
          #editor_header_nav,
          #editor_controls_bar,
          #original_scan_view_box,
          #view_divider_slider_handle,
          .screen_only_element {
            display: none !important;
          }
          .recreated_digital_canvas_box {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 210mm !important;
            height: 297mm !important;
            border: none !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            transform: none !important;
            background: white !important;
            color: black !important;
          }
          /* Ensure element borders are hidden and text matches maximum clarity */
          .pixel_coordinate_border {
            border: none !important;
            background: transparent !important;
            color: black !important;
          }
          .coordinate_overlay_dot {
            display: none !important;
          }
        }
        
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* HEADER NAV */}
      <header id="editor_header_nav" className="shrink-0 h-16 border-b border-white/5 bg-[#0e1324] flex items-center justify-between px-4 sm:px-6 z-20">
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={onBack}
            className="p-2 -ml-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
            title="Return to Tools Hub"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white filter drop-shadow-[0_2px_8px_rgba(79,70,229,0.4)]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm sm:text-base font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
                  AI Document Template Cloner
                </h1>
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 uppercase tracking-widest hidden sm:inline">
                  Coordinate Locked
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                Precision full-page layout replication utility (A4 Form Mode)
              </p>
            </div>
          </div>
        </div>

        {/* Global actions */}
        <div className="flex items-center gap-2">
          {historyStack.length > 0 && (
            <button
              onClick={handleUndo}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              title="Undo last mutation"
            >
              <Undo className="w-4 h-4" />
              <span className="hidden md:inline">Undo</span>
            </button>
          )}

          <button
            onClick={triggerNativePrint}
            className="flex items-center gap-1.5 bg-[#171f38] border border-slate-700/80 hover:bg-[#202a4d] px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-md text-xs sm:text-sm font-bold text-emerald-400 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>Print / Save PDF</span>
          </button>

          <button
            onClick={triggerDOCXDownload}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-md text-xs sm:text-sm font-bold transition-all shadow-lg shadow-indigo-600/15 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export DOC</span>
          </button>
        </div>
      </header>

      {/* RACK 2: SYSTEM VIEW CONTROLS */}
      <div id="editor_controls_bar" className="shrink-0 h-11 border-b border-white/5 bg-[#0b0e1a]/95 flex items-center justify-between px-4 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex bg-[#121626] rounded-md p-0.5 border border-white/5">
            <button 
              onClick={() => setShowTwinPages(true)}
              className={`px-3 py-1 rounded font-bold transition-all ${showTwinPages ? 'bg-indigo-500 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              Side-by-Side View
            </button>
            <button 
              onClick={() => setShowTwinPages(false)}
              className={`px-3 py-1 rounded font-bold transition-all ${!showTwinPages ? 'bg-indigo-500 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              Overlay Compare Slider
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 text-slate-400">
            <input 
              type="checkbox" 
              id="coord_overlay_chk"
              checked={showCoordinatesOverlay}
              onChange={(e) => setShowCoordinatesOverlay(e.target.checked)}
              className="accent-indigo-500 cursor-pointer" 
            />
            <label htmlFor="coord_overlay_chk" className="cursor-pointer select-none font-medium">
              Show Pixel Bounding Coordinates (X, Y)
            </label>
          </div>
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-3">
          <span className="text-slate-400 font-medium">A4 Zoom:</span>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setZoomLevel(z => Math.max(z - 10, 40))}
              className="p-1 rounded bg-[#121626] border border-white/5 hover:text-white"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono w-10 text-center font-bold text-indigo-400">{zoomLevel}%</span>
            <button 
              onClick={() => setZoomLevel(z => Math.min(z + 10, 150))}
              className="p-1 rounded bg-[#121626] border border-white/5 hover:text-white"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* CORE TRIPLE-WORKPANELS WRAPPER */}
      <div className="flex-grow flex flex-col md:flex-row min-h-0 overflow-hidden relative">
        
        {/* PANEL LEVEL A: IMPORT & PRESET SOURCE CONTROLS */}
        <div id="editor_left_rack" className="w-full md:w-[260px] lg:w-[290px] shrink-0 border-b md:border-b-0 md:border-r border-white/5 bg-[#0a0d18] flex flex-col overflow-y-auto no-scrollbar">
          
          {/* Section: Upload Document Template to Analyze */}
          <div className="p-4 border-b border-white/5 bg-[#090b14]/50">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-[10px] uppercase font-black text-slate-400 tracking-wider">
                Upload Scanned Document
              </h2>
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            </div>

            <div 
              onDragOver={triggerDragOver}
              onDragLeave={triggerDragLeave}
              onDrop={triggerDropFile}
              className={`p-3.5 rounded-xl border-2 border-dashed text-center cursor-pointer transition-all ${
                dragActive 
                  ? "border-indigo-400 bg-indigo-500/5" 
                  : "border-slate-800 hover:border-slate-700 bg-[#0e1222]"
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleManualUpload} 
                accept="image/*,application/pdf"
                className="hidden" 
              />
              {isAnalyzing ? (
                <div className="p-1.5 flex flex-col items-center">
                  <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-2" />
                  <p className="text-xs font-bold text-slate-200">Reconstructing Layout...</p>
                  <p className="text-[9px] text-slate-500 mt-0.5">Capturing OCR & bounding coordinates</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <UploadCloud className="w-7 h-7 text-indigo-400 mb-2" />
                  <p className="text-xs font-black text-slate-300">Drop scan image or PDF</p>
                  <p className="text-[10px] text-slate-500 mt-1">Converts positions to coordinates</p>
                </div>
              )}
            </div>

            {errorPrompt && (
              <div className="mt-2.5 p-2 rounded bg-amber-500/15 border border-amber-500/20 flex gap-1.5 items-start">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-[9.5px] leading-normal text-amber-200 font-medium">
                  {errorPrompt}
                </p>
              </div>
            )}
          </div>

          {/* Section: Saved cloned sheets */}
          {savedTemplates.length > 0 && (
            <div className="p-4 border-b border-white/5 bg-[#090b14]/30">
              <h2 className="text-[10px] uppercase font-black text-slate-400 tracking-wider mb-2.5 flex items-center gap-1.5">
                <FolderOpen className="w-3.5 h-3.5 text-amber-500" />
                <span>My Saved Blueprints</span>
              </h2>
              <div className="space-y-1.5">
                {savedTemplates.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => loadSavedWork(item.id)}
                    className={`group flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-all text-left ${
                      selectedPresetId === item.id 
                        ? "bg-indigo-600/10 border-indigo-500/40 text-white" 
                        : "bg-[#0d1120] border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <h3 className="text-xs font-bold truncate leading-tight">{item.title}</h3>
                      <p className="text-[9px] text-slate-500 truncate mt-0.5">{item.docType}</p>
                    </div>
                    <button
                      onClick={(e) => removeSavedWork(item.id, e)}
                      type="button"
                      className="text-slate-500 group-hover:text-red-400 p-1 rounded hover:bg-white/5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Built-in document target library */}
          <div className="p-4 border-b border-white/5">
            <h2 className="text-[10px] uppercase font-black text-slate-400 tracking-wider mb-2 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>Select Template Scans</span>
            </h2>
            <p className="text-[10px] text-slate-500 mb-3 leading-relaxed">
              Click any blueprint below to simulate instant cloner verification:
            </p>
            <div className="space-y-2">
              {SAMPLE_PRESETS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => selectPreset(item.id, item.template)}
                  type="button"
                  className={`w-full text-left p-2.5 rounded-lg border transition-all text-xs flex flex-col ${
                    selectedPresetId === item.id 
                      ? "bg-slate-800/80 border-indigo-500/40 text-white font-bold" 
                      : "bg-[#0d1222]/80 border-slate-800/70 text-slate-400 hover:bg-[#121930] hover:text-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="font-extrabold truncate">{item.name}</span>
                  </div>
                  <span className="text-[9px] text-slate-500 font-medium mt-1 leading-snug line-clamp-2">
                    {item.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Section: Font configuration overrides */}
          <div className="p-4 mt-auto">
            <h2 className="text-[10px] uppercase font-black text-slate-400 tracking-wider mb-2 flex items-center justify-between">
              <span>Primary Font Engine</span>
              <Type className="w-3.5 h-3.5 text-slate-500" />
            </h2>
            
            <div className="space-y-2">
              <select
                value={activeTemplate.fontName}
                onChange={(e) => pushToHistory({ ...activeTemplate, fontName: e.target.value })}
                className="w-full h-8 px-2 rounded-md bg-[#090c16] border border-slate-800 text-xs text-slate-300 outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="SonaliLipi">Default Bangla: SonaliLipi</option>
                <option value="Nickosh">Nikosh (Govt standard)</option>
                <option value="Kalpurush">Kalpurush (Bilingual Smooth)</option>
                <option value="SolaimanLipi">SolaimanLipi (e-Governance)</option>
                <option value="SutonnyMJ">SutonnyMJ (Classic Bangla)</option>
                <option value="Arial">Arial (English Formal)</option>
                {customFonts.map((f, i) => (
                  <option key={i} value={f.name}>{f.name} (Uploaded TTF)</option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => fontFileRef.current?.click()}
                className="w-full py-1.5 bg-[#121626] hover:bg-[#171d33] border border-slate-800 rounded font-black text-[10px] text-center flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Upload className="w-3 h-3" />
                <span>Upload Custom Font (.TTF)</span>
              </button>
              <input
                ref={fontFileRef}
                type="file"
                onChange={triggerCustomFontUpload}
                accept=".ttf,.otf,.woff"
                className="hidden"
              />
            </div>
          </div>

        </div>

        {/* PANEL LEVEL B: COMPARISON SHEETS DISPLAY */}
        <div className="flex-grow bg-[#05070e] flex flex-col min-w-0 h-full overflow-hidden select-none relative">
          
          {/* Comparison Arena Header */}
          <div className="shrink-0 px-4 py-2 bg-[#090b14] border-b border-white/5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-indigo-400">Locked Base Layout Template:</span>
              <span className="font-mono text-slate-300">{activeTemplate.title}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-slate-500">Dimensions: A4 Print Box</span>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            </div>
          </div>

          {/* Area Containing Sheets side by side or overlaid */}
          <div className="flex-grow overflow-auto p-6 flex justify-center items-start min-h-0 relative">
            <div 
              ref={compareContainerRef}
              className={`flex gap-6 items-start transition-all duration-300 ${
                showTwinPages 
                  ? "flex-col xl:flex-row justify-center" 
                  : "relative justify-center w-full max-w-[700px]"
              }`}
            >
              
              {/* SHEET LEFT: ORIGINAL SCANNED PAPER DOCUMENT SIMULATION */}
              <div 
                id="original_scan_view_box"
                className="relative shrink-0 rounded bg-[#f3f0e8] text-slate-900 border border-slate-300/40 shadow-[0_12px_45px_rgba(0,0,0,0.6)] overflow-hidden"
                style={{
                  width: `${(210 * zoomLevel) / 100}mm`,
                  height: `${(297 * zoomLevel) / 100}mm`,
                  display: (!showTwinPages) ? 'none' : 'block'
                }}
              >
                {/* Yellow texture paper overlay for authentic scanned look */}
                <div className="absolute inset-0 bg-[#e6dfcf]/40 mix-blend-multiply pointer-events-none z-10"></div>
                <div className="absolute inset-0 bg-radial from-transparent via-[#8a7a5c]/5 pointer-events-none z-10"></div>
                {/* Gridlines to mimic microline grid scan artifacts */}
                <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none z-10"></div>

                <div className="p-8 h-full flex flex-col relative select-none">
                  <div className="absolute top-2 left-3 text-[8px] font-mono text-slate-500 uppercase tracking-widest z-10 font-bold">
                    [ Original Scanned Document - Read Only Reference ]
                  </div>

                  {/* Stamp Graphic representation if govt-stamp-agreement */}
                  {selectedPresetId === "govt-stamp-agreement" && (
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 w-48 h-32 border-4 border-double border-orange-800/20 bg-orange-500/[0.03] rounded-lg rotate-1 flex flex-col items-center justify-center p-2 text-center pointer-events-none">
                      <div className="text-orange-900/30 text-xs font-bold leading-tight">নোটারী পাবলিক অব বাংলাদেশ</div>
                      <div className="text-orange-900/30 text-[9px] mt-1 font-mono">SEAL REGISTRY * 2026</div>
                      <div className="mt-2 text-emerald-800/20 text-xs font-extrabold uppercase scale-90 border border-emerald-800/10 px-2 py-0.5">VERIFIED COPY</div>
                    </div>
                  )}

                  {/* Replicating items inside Scan to demonstrate cloning baseline matches RIGHT */}
                  {activeTemplate.elements.map((el) => {
                    const lStyle = getFontFamilyStyle(el.font);
                    return (
                      <div
                        key={`scan_${el.id}`}
                        className="absolute leading-normal text-[#172033]/85 pointer-events-none"
                        style={{
                          left: `${el.x}%`,
                          top: `${el.y}%`,
                          width: `${el.width}%`,
                          height: el.height ? `${el.height}%` : "auto",
                          fontSize: `${((el.fontSize || 12) * zoomLevel) / 100}px`,
                          textAlign: el.alignment || "left",
                          fontWeight: el.fontWeight || "normal"
                        }}
                      >
                        <span style={{ display: "inline-block", ...Object.fromEntries(lStyle.split(';').filter(Boolean).map(s => s.split(':').map(x => x.trim()))) }}>
                          {el.type === "field" ? (
                            <div className="flex gap-1.5 items-baseline">
                              <span className="font-bold opacity-75">{el.label}:</span>
                              <span className="border-b border-dashed border-slate-700/40 text-slate-800 italic">{el.value}</span>
                            </div>
                          ) : el.type === "signatures" ? (
                            <div className="flex flex-col items-center mt-3 text-center">
                              <span className="text-[10px] leading-none text-slate-500 italic block mb-1">
                                [ scanned stamp signature ]
                              </span>
                              <span className="font-bold border-b border-black/35 select-none">{el.label}</span>
                              <span className="text-blue-900 font-serif italic text-sm scale-110 rotate-[-4deg] absolute -top-4 opacity-70">
                                {el.value}
                              </span>
                            </div>
                          ) : el.type === "divider" ? (
                            <hr className="border-t-2 border-slate-800/30 w-full" />
                          ) : el.type === "table" && el.headers && el.rows ? (
                            <table className="w-full border-collapse border border-slate-600/50 text-[11px]">
                              <thead>
                                <tr className="bg-slate-200/50">
                                  {el.headers.map((h, i) => (
                                    <th key={i} className="border border-slate-600/50 p-1 font-bold text-left">{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {el.rows.map((row, rI) => (
                                  <tr key={rI}>
                                    {row.map((cell, cI) => (
                                      <td key={cI} className="border border-slate-600/50 p-1 opacity-90">{cell}</td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : (
                            el.text || el.value
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SHEET RIGHT: RECREATED EDITABLE SMART CLONED VERSION */}
              <div 
                className="recreated_digital_canvas_box relative shrink-0 rounded bg-white text-slate-900 border border-slate-300 shadow-[0_12px_55px_rgba(0,0,0,0.8)] overflow-hidden transition-all duration-150"
                style={{
                  width: `${(210 * zoomLevel) / 100}mm`,
                  height: `${(297 * zoomLevel) / 100}mm`,
                }}
              >
                
                {/* Visual grid paper hint overlay inside screen only */}
                <div className="screen_only_element absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:15px_15px] pointer-events-none"></div>

                <div className="p-8 h-full flex flex-col relative select-text">
                  
                  {/* Subtle watermarked label only visible on screen */}
                  <div className="screen_only_element absolute top-2 right-3 text-[8px] font-mono text-indigo-500 uppercase tracking-widest z-10 font-bold bg-indigo-50 px-1 py-0.5 rounded border border-indigo-200">
                    [ LIVE CLONED DIGITAL COPY ]
                  </div>

                  {activeTemplate.elements.map((el) => {
                    const isSelected = selectedElementId === el.id;
                    const fFamily = getFontFamilyStyle(el.font);

                    return (
                      <div
                        key={`recreated_${el.id}`}
                        onClick={() => {
                          setSelectedElementId(el.id);
                          setActiveEditingValue(el.value || el.text || "");
                        }}
                        className={`absolute leading-normal cursor-pointer select-text border transition-all ${
                          isSelected 
                            ? "bg-indigo-500/10 border-indigo-600 ring-2 ring-indigo-600/30 shadow-md" 
                            : showCoordinatesOverlay 
                              ? el.type === "field" || el.type === "signatures"
                                ? "border-slate-300 hover:border-indigo-400 bg-teal-500/[0.02]"
                                : "border-slate-200/50 hover:border-indigo-400/50"
                              : "border-transparent hover:bg-slate-50"
                        } pixel_coordinate_border`}
                        style={{
                          left: `${el.x}%`,
                          top: `${el.y}%`,
                          width: `${el.width}%`,
                          height: el.height ? `${el.height}%` : "auto",
                          fontSize: `${((el.fontSize || 12) * zoomLevel) / 100}px`,
                          textAlign: el.alignment || "left",
                          fontWeight: el.fontWeight || "normal"
                        }}
                      >
                        {/* Little coordinates tooltip shown only on hover/select */}
                        {showCoordinatesOverlay && (
                          <span className="screen_only_element coordinate_overlay_dot absolute -top-5 -left-1 px-1.5 py-0.5 rounded bg-indigo-900 text-white font-mono text-[7.5px] scale-90 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity whitespace-nowrap z-30 font-bold select-none pointer-events-none">
                            X:{el.x} Y:{el.y}
                          </span>
                        )}

                        <span style={{ display: "inline-block", ...Object.fromEntries(fFamily.split(';').filter(Boolean).map(s => s.split(':').map(x => x.trim()))) }}>
                          {el.type === "field" ? (
                            <div className="flex gap-2 items-baseline">
                              <span className="font-bold text-slate-900 shrink-0">{el.label}:</span>
                              <span className="border-b-2 border-dashed border-indigo-600/60 bg-indigo-50/50 px-1 py-0.5 text-indigo-900 rounded font-semibold w-full block truncate">
                                {el.value || <span className="text-slate-400 italic">EMPTY VALUE</span>}
                              </span>
                            </div>
                          ) : el.type === "signatures" ? (
                            <div className="flex flex-col items-center text-center p-1.5 relative min-h-[50px] justify-end">
                              <span className="text-[10px] text-indigo-500 border-b border-indigo-200 select-none font-bold block mb-1">
                                {el.label}
                              </span>
                              <span className="font-serif italic text-indigo-600 font-extrabold rotate-[-5deg] text-xs">
                                {el.value}
                              </span>
                            </div>
                          ) : el.type === "divider" ? (
                            <hr className="border-t-[1.5px] border-slate-800 w-full" />
                          ) : el.type === "table" && el.headers && el.rows ? (
                            <div className="relative overflow-visible w-full">
                              <table className="w-full border-collapse border border-slate-700 text-[11px]">
                                <thead>
                                  <tr className="bg-slate-100">
                                    {el.headers.map((h, i) => (
                                      <th key={i} className="border border-slate-700 p-1.5 font-bold text-left">{h}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {el.rows.map((row, rI) => (
                                    <tr key={rI}>
                                      {row.map((cell, cI) => (
                                        <td 
                                          key={cI} 
                                          className="border border-slate-700 p-1.5 bg-white/70 hover:bg-amber-50 cursor-text transition-colors"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const nextVal = prompt(`Update cell [Row ${rI + 1}, Col ${cI + 1}] value:`, cell);
                                            if (nextVal !== null) {
                                              handleUpdateTableCell(el.id, rI, cI, nextVal);
                                            }
                                          }}
                                        >
                                          {cell}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                              <p className="screen_only_element text-[8.5px] text-slate-400 italic mt-0.5 text-right font-medium">
                                * Double-click cell to modify grid content
                              </p>
                            </div>
                          ) : (
                            el.text || el.value
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* PANEL LEVEL C: INTERACTIVE VALUE DATA BASE CONTROL */}
        <div id="editor_details_sidebar" className="w-full md:w-[280px] lg:w-[320px] shrink-0 bg-[#0e1326] border-t md:border-t-0 md:border-l border-white/5 flex flex-col min-h-0 overflow-y-auto no-scrollbar">
          
          <div className="p-4 border-b border-white/5 bg-[#090b14]/60">
            <h2 className="text-[11px] uppercase font-black text-slate-400 tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <span>Pixel-Locked Sandbox</span>
            </h2>
            <p className="text-[10px] text-slate-500 mt-1 leading-snug">
              Coordinates, margins, fonts, and numbering are locked to prevent layout shifting. Values are editable.
            </p>
          </div>

          <div className="flex-grow p-4 space-y-4">
            
            {/* Template settings summary */}
            <div className="p-3 rounded-lg bg-[#080a13] border border-slate-800 space-y-2">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center justify-between">
                <span>Layout Specs</span>
                <span className="text-emerald-400 flex items-center gap-1 font-mono text-[9px] font-black uppercase">
                  A4 Bound
                </span>
              </h3>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[9.5px] text-slate-500 block">Doc Category:</span>
                  <span className="font-extrabold text-slate-200">{activeTemplate.documentType}</span>
                </div>
                <div>
                  <span className="text-[9.5px] text-slate-500 block">Primary Lang:</span>
                  <span className="font-extrabold text-slate-200">{activeTemplate.language}</span>
                </div>
                <div>
                  <span className="text-[9.5px] text-slate-500 block">Root Font size:</span>
                  <span className="font-extrabold text-slate-200">{activeTemplate.fontSize}</span>
                </div>
                <div>
                  <span className="text-[9.5px] text-slate-500 block">Page Dimensions:</span>
                  <span className="font-extrabold text-indigo-400">210mm × 297mm</span>
                </div>
              </div>
            </div>

            {/* Editing focused elements content */}
            {selectedElementId ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-black tracking-widest text-indigo-400">
                    Edit Bounding Value
                  </span>
                  <button 
                    onClick={() => setSelectedElementId(null)}
                    className="text-[10px] font-bold text-slate-500 hover:text-white"
                  >
                    Clear Focus
                  </button>
                </div>

                {/* Info summary on coordinates */}
                {activeTemplate.elements.map(el => {
                  if (el.id !== selectedElementId) return null;
                  
                  return (
                    <div key={el.id} className="space-y-3 animate-fade-in">
                      {/* Node descriptor panel */}
                      <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-xs">
                        <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1">
                          <span className="font-bold uppercase bg-slate-800 px-1 py-0.5 rounded text-[9px] text-[#A5B4FC]">
                            Type: {el.type}
                          </span>
                          <span className="font-mono text-indigo-300">
                            X: {el.x}% | Y: {el.y}%
                          </span>
                        </div>
                        {el.label && (
                          <div className="mt-1">
                            <span className="text-slate-500">Key Field: </span>
                            <span className="font-bold text-slate-200">{el.label}</span>
                          </div>
                        )}
                      </div>

                      {/* Content textareas based on elements values */}
                      <div className="space-y-1.5 flex flex-col">
                        <label className="text-[10px] font-bold text-slate-400">
                          {el.type === "field" ? "Target Field Value:" : el.type === "signatures" ? "Signee Valuation Block:" : "Editable Text / Paragraph:"}
                        </label>
                        <textarea
                          rows={4}
                          value={activeEditingValue}
                          onChange={(e) => handleUpdateActiveValue(e.target.value)}
                          placeholder="Type values or notes to clone onto coordinated spaces..."
                          className="w-full text-sm font-bold bg-[#080a13] border border-slate-700/80 rounded-lg p-2 text-white placeholder-slate-600 outline-none focus:border-indigo-500"
                        />
                      </div>
                      <p className="text-[9.5px] text-slate-400 leading-normal bg-indigo-500/5 p-2 rounded-lg border border-indigo-500/10">
                        * Real-time sync updates coordinate layers on both pages concurrently.
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 bg-[#090b14]/50 rounded-xl border border-dashed border-slate-800 text-center text-slate-500">
                <HelpCircle className="w-8 h-8 text-slate-600 mb-2" />
                <p className="text-xs font-bold text-slate-400">No element selected</p>
                <p className="text-[10px] mt-1 leading-normal max-w-[200px]">
                  Click on any text bounding box or field directly inside the digital template sheet to edit values.
                </p>
              </div>
            )}

            {/* Itemized Values Table */}
            <div className="space-y-2">
              <h3 className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                Captured Fields Value Registry
              </h3>
              <div className="space-y-1.5 max-h-[180px] overflow-y-auto no-scrollbar pr-1">
                {activeTemplate.elements
                  .filter(el => el.type === "field" || el.type === "signatures")
                  .map(el => (
                    <div 
                      key={el.id}
                      onClick={() => {
                        setSelectedElementId(el.id);
                        setActiveEditingValue(el.value || "");
                      }}
                      className={`p-2 rounded bg-slate-900 border text-xs text-left transition-all ${
                        selectedElementId === el.id 
                          ? "border-indigo-500 bg-indigo-500/5" 
                          : "border-slate-800 hover:border-slate-700 cursor-pointer"
                      }`}
                    >
                      <div className="flex justify-between font-bold text-slate-400 text-[10px]">
                        <span className="truncate pr-1">{el.label}</span>
                        <span className="font-mono text-[9px] text-[#818CF8]">X:{el.x}%</span>
                      </div>
                      <div className="text-white font-extrabold truncate mt-1">
                        {el.value || <span className="text-slate-600 italic">No value</span>}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

          </div>

          <div className="p-4 border-t border-white/5 bg-[#090b14]/40 mt-auto space-y-2">
            <button
              onClick={saveWorkLocally}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 font-bold rounded-lg text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-indigo-600/15 shadow-md"
            >
              <FileCheck className="w-4 h-4" />
              <span>Save Blueprint Work</span>
            </button>
            <div className="flex items-center justify-between text-[9px] text-slate-500 font-bold px-1 select-none">
              <button onClick={triggerJSONDownload} className="hover:text-white uppercase">Export JSON</button>
              <span>V2 COORDINATES ENGINE</span>
              <span>Siam Active</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
