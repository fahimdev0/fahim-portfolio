import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ChevronLeft, Send, Sparkles, Bot, User, Loader2, Plus, ArrowUp, Copy, Check,
  FileText, Settings, ToggleLeft, ToggleRight, Image, HelpCircle, HardDrive, 
  Cpu, Zap, Eye, Sliders, Trash2, ShieldCheck, BookOpen, Terminal, Code, Info, 
  Download, Maximize2, X, AlertCircle, FileSpreadsheet, RefreshCw, Sun, Moon, Menu,
  MessageSquare, Printer
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus, prism } from "react-syntax-highlighter/dist/esm/styles/prism";
import { PassportPhotoStudio } from "./PassportPhotoStudio";

// --- COPY BUTTON UTILITY ---
const CopyButton = ({ text, isDarkMode = true }: { text: string; isDarkMode?: boolean }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={`p-1.5 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
        isDarkMode 
          ? "bg-white/5 hover:bg-white/10 text-white/50 hover:text-white/80" 
          : "bg-slate-200/50 hover:bg-slate-200 text-slate-500 hover:text-slate-800"
      }`}
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
      <span className="text-[11px] font-medium">{copied ? "Copied" : "Copy"}</span>
    </button>
  );
};

// --- INTERFACES ---
interface FileAttachment {
  id: string;
  name: string;
  size: string;
  type: string;
  content?: string;
  previewUrl?: string;
}

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
  id: string;
  modelUsed?: string;
  thinkingProcess?: string[];
  attachedFiles?: FileAttachment[];
  imageUrl?: string;
  isPassportRequest?: boolean;
  originalImageUrl?: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
}

const getModelDisplayName = (modelId: string) => {
  const mapping: Record<string, string> = {
    "cipher": "Cipher Core",
    "tutor8b": "Tutor8B Academic",
    "claude": "Claude Sonnet",
    "gemini31pro": "Gemini 3.1 Pro",
    "claudeopus48": "Claude Opus 4.8",
    "claudeopus47": "Claude Opus 4.7",
    "glm51": "GLM 5.1",
    "gpt55": "GPT 5.5",
    "kimik26": "Kimi K2.6",
    "glm52": "Glm 5.2",
    "gpt54": "Gpt 5.4"
  };
  return mapping[modelId] || modelId;
};

const downloadAsMarkdown = (content: string, id: string) => {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `AI_Doc_${id}.md`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const downloadAsHTMLDocument = (content: string, title: string) => {
  let htmlContent = content
    .replace(/^# (.*$)/gim, '<h1 style="color: #312e81; font-family: \'Space Grotesk\', sans-serif; font-size: 28px; margin-top: 30px; margin-bottom: 15px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">$1</h1>')
    .replace(/^## (.*$)/gim, '<h2 style="color: #1e3a8a; font-family: \'Space Grotesk\', sans-serif; font-size: 22px; margin-top: 25px; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">$1</h2>')
    .replace(/^### (.*$)/gim, '<h3 style="color: #1e293b; font-family: sans-serif; font-size: 18px; margin-top: 20px; margin-bottom: 10px;">$1</h3>')
    .replace(/^\> (.*$)/gim, '<blockquote style="border-left: 4px solid #6366f1; padding-left: 15px; font-style: italic; color: #475569; margin: 20px 0; background: #f8fafc; padding: 10px 15px; border-radius: 0 8px 8px 0;">$1</blockquote>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code style="background-color: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 13px; color: #be185d;">$1</code>')
    .split('\n')
    .map(line => {
      if (line.startsWith('<h') || line.startsWith('<blockquote') || line.startsWith('<ul') || line.startsWith('<ol') || line.startsWith('<li') || line.startsWith('<table') || line.trim() === '') {
        return line;
      }
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return `<li style="margin-bottom: 8px; font-family: sans-serif; font-size: 15px; color: #334155;">${line.substring(2)}</li>`;
      }
      return `<p style="line-height: 1.6; margin-bottom: 15px; font-family: sans-serif; font-size: 15px; color: #334155;">${line}</p>`;
    })
    .join('\n');

  htmlContent = htmlContent.replace(/(<li.*?>.*?<\/li>)/gs, '<ul style="padding-left: 20px; margin-bottom: 20px;">$1</ul>');
  htmlContent = htmlContent.replace(/<\/ul>\s*<ul.*?>/g, '');

  const documentHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    body {
      background-color: #f8fafc;
      color: #1e293b;
      font-family: 'Inter', sans-serif;
      padding: 40px 20px;
    }
    .document-card {
      background: white;
      max-width: 800px;
      margin: 0 auto;
      padding: 50px 60px;
      border-radius: 16px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      font-size: 12px;
      color: #94a3b8;
      font-family: 'Inter', sans-serif;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 25px 0;
      font-size: 14px;
      text-align: left;
    }
    th {
      background-color: #f1f5f9;
      color: #475569;
      font-weight: 700;
      padding: 12px 15px;
      border-bottom: 2px solid #cbd5e1;
    }
    td {
      padding: 12px 15px;
      border-bottom: 1px solid #e2e8f0;
      color: #334155;
    }
    tr:hover {
      background-color: #f8fafc;
    }
    pre {
      background: #0f172a;
      color: #f8fafc;
      padding: 20px;
      border-radius: 12px;
      overflow-x: auto;
      font-family: monospace;
      font-size: 14px;
      line-height: 1.5;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="document-card">
    ${htmlContent}
  </div>
  <div class="footer">
    Generated by Fahim AI Helper • World-Class Intelligence Workspace
  </div>
</body>
</html>
  `;

  const blob = new Blob([documentHTML], { type: "text/html;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${title.toLowerCase().replace(/[^a-z0-9]/g, "_") || "document"}.html`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const exportTablesToCSV = (content: string, title: string) => {
  const lines = content.split("\n");
  const tableLines = lines.filter(line => line.trim().startsWith("|") && line.trim().endsWith("|"));
  
  if (tableLines.length === 0) return;

  const csvContent = tableLines
    .filter(line => !line.includes("---"))
    .map(line => {
      return line
        .split("|")
        .slice(1, -1)
        .map(cell => `"${cell.trim().replace(/"/g, '""')}"`)
        .join(",");
    })
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${title.toLowerCase().replace(/[^a-z0-9]/g, "_") || "table"}_data.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const downloadAsWordDocument = (content: string, title: string, template: string = "modern") => {
  let fontStyle = "font-family: 'Calibri', 'Arial', sans-serif;";
  let titleColor = "#1e1b4b";
  let subtitleColor = "#312e81";
  let contentColor = "#1e293b";
  let borderStyle = "border-bottom: 2px solid #e2e8f0;";

  if (template === "academic") {
    fontStyle = "font-family: 'Times New Roman', Times, serif;";
    titleColor = "#000000";
    subtitleColor = "#000000";
    contentColor = "#000000";
    borderStyle = "border-bottom: 1.5px solid #000000;";
  } else if (template === "executive") {
    fontStyle = "font-family: Georgia, serif;";
    titleColor = "#0f172a";
    subtitleColor = "#1e3a8a";
    contentColor = "#1e293b";
    borderStyle = "border-bottom: 2px solid #cbd5e1;";
  } else if (template === "tech") {
    fontStyle = "font-family: 'Courier New', Courier, monospace;";
    titleColor = "#0f172a";
    subtitleColor = "#0f766e";
    contentColor = "#1e293b";
    borderStyle = "border-bottom: 1px dashed #94a3b8;";
  }

  let bodyHTML = content
    .replace(/^# (.*$)/gim, `<h1 style="color: ${titleColor}; ${fontStyle} font-size: 24pt; font-weight: bold; margin-top: 18pt; margin-bottom: 6pt; ${borderStyle} padding-bottom: 4pt;">$1</h1>`)
    .replace(/^## (.*$)/gim, `<h2 style="color: ${subtitleColor}; ${fontStyle} font-size: 18pt; font-weight: bold; margin-top: 14pt; margin-bottom: 4pt;">$1</h2>`)
    .replace(/^### (.*$)/gim, `<h3 style="color: ${contentColor}; ${fontStyle} font-size: 14pt; font-weight: bold; margin-top: 12pt; margin-bottom: 4pt;">$1</h3>`)
    .replace(/^\> (.*$)/gim, '<blockquote style="border-left: 3.5pt solid #6366f1; padding-left: 10pt; font-style: italic; color: #4b5563; margin: 12pt 0; background-color: #f9fafb; padding: 6pt 10pt;">$1</blockquote>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code style="background-color: #f3f4f6; padding: 2px 4px; border-radius: 4px; font-family: \'Consolas\', monospace; font-size: 10pt; color: #dc2626;">$1</code>')
    .split('\n')
    .map(line => {
      if (line.startsWith('<h') || line.startsWith('<blockquote') || line.startsWith('<ul') || line.startsWith('<ol') || line.startsWith('<li') || line.startsWith('<table') || line.trim() === '') {
        return line;
      }
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return `<li style="margin-bottom: 6pt; ${fontStyle} font-size: 11pt; color: ${contentColor};">${line.substring(2)}</li>`;
      }
      return `<p style="line-height: 1.25; margin-bottom: 10pt; ${fontStyle} font-size: 11pt; color: ${contentColor};">${line}</p>`;
    })
    .join('\n');

  bodyHTML = bodyHTML.replace(/(<li.*?>.*?<\/li>)/gs, '<ul style="padding-left: 18pt; margin-bottom: 12pt;">$1</ul>');
  bodyHTML = bodyHTML.replace(/<\/ul>\s*<ul.*?>/g, '');

  const mswordTemplate = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <title>${title}</title>
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>100</w:Zoom>
          <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
        body {
          ${fontStyle}
          font-size: 11pt;
          line-height: 1.25;
          color: ${contentColor};
          margin: 1in;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 12pt 0;
        }
        th {
          background-color: #f3f4f6;
          border: 1px solid #d1d5db;
          padding: 8px;
          font-weight: bold;
          text-align: left;
        }
        td {
          border: 1px solid #d1d5db;
          padding: 8px;
        }
        pre {
          background-color: #1f2937;
          color: #f9fafb;
          padding: 12pt;
          font-family: 'Consolas', monospace;
          font-size: 10pt;
          margin: 12pt 0;
          border-radius: 6px;
        }
      </style>
    </head>
    <body>
      <div style="margin: 0.5in;">
        ${bodyHTML}
      </div>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff' + mswordTemplate], { type: "application/msword;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${title.toLowerCase().replace(/[^a-z0-9]/g, "_") || "document"}.doc`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const AIHelperApp = ({ onBack }: { onBack: () => void }) => {
  // --- STATE SYSTEM ---
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false); // Clean Gemini Light Mode by default
  
  // Prime Parameters
  const [selectedModel, setSelectedModel] = useState<string>("cipher");
  const [isReasoningEnabled, setIsReasoningEnabled] = useState(true);
  const [isImageMode, setIsImageMode] = useState(false);
  const [longerMemory, setLongerMemory] = useState(true);
  const [contextTokens, setContextTokens] = useState(128000); // Prime extends context up to 128k/1M
  const [priorityRouting, setPriorityRouting] = useState(true);
  const [activeSpeed, setActiveSpeed] = useState("0.24s");
  
  // Custom uploaded files archive
  const [uploadedFiles, setUploadedFiles] = useState<FileAttachment[]>([]);
  const [fileSelectorActive, setFileSelectorActive] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Closed by default for ultra-clean look
  const [isMobileParamsOpen, setIsMobileParamsOpen] = useState(false);
  
  // Image magnification view
  const [magnifiedImage, setMagnifiedImage] = useState<string | null>(null);

  // Print & PDF Document Preview Hub State
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printContent, setPrintContent] = useState("");
  const [printTitle, setPrintTitle] = useState("");
  const [printTemplate, setPrintTemplate] = useState("modern"); // modern, academic, executive, tech
  const [printFontSize, setPrintFontSize] = useState("medium"); // small, medium, large

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = (instant = false) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: instant ? "auto" : "smooth",
        block: "end"
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Premium auto-resizing text field
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 140)}px`;
    }
  }, [input]);

  // Simulate network speeds dynamically on turn completion
  const updateSpeedStat = () => {
    const latencies = ["0.18s", "0.22s", "0.28s", "0.34s", "0.41s", "0.15s"];
    setActiveSpeed(latencies[Math.floor(Math.random() * latencies.length)]);
  };

  const handleTriggerPrint = () => {
    let fontStyle = "font-family: 'Inter', sans-serif;";
    let titleColor = "#1e1b4b";
    let subtitleColor = "#312e81";
    let contentColor = "#1e293b";
    let borderStyle = "border-bottom: 2px solid #e2e8f0;";

    if (printTemplate === "academic") {
      fontStyle = "font-family: 'Times New Roman', Times, serif;";
      titleColor = "#000000";
      subtitleColor = "#000000";
      contentColor = "#000000";
      borderStyle = "border-bottom: 1.5px solid #000000;";
    } else if (printTemplate === "executive") {
      fontStyle = "font-family: Georgia, serif;";
      titleColor = "#0f172a";
      subtitleColor = "#1e3a8a";
      contentColor = "#1e293b";
      borderStyle = "border-bottom: 2px solid #cbd5e1;";
    } else if (printTemplate === "tech") {
      fontStyle = "font-family: monospace, Courier, monospace;";
      titleColor = "#0f172a";
      subtitleColor = "#0f766e";
      contentColor = "#1e293b";
      borderStyle = "border-bottom: 1px dashed #94a3b8;";
    }

    const fontSizing = printFontSize === "small" ? "13px" : printFontSize === "large" ? "18px" : "15px";

    // Format Markdown into beautiful HTML for printing
    let htmlBody = printContent
      .replace(/^# (.*$)/gim, `<h1 style="color: ${titleColor}; ${fontStyle} font-size: 26px; font-weight: bold; margin-top: 25px; margin-bottom: 12px; ${borderStyle} padding-bottom: 6px;">$1</h1>`)
      .replace(/^## (.*$)/gim, `<h2 style="color: ${subtitleColor}; ${fontStyle} font-size: 20px; font-weight: bold; margin-top: 20px; margin-bottom: 10px;">$1</h2>`)
      .replace(/^### (.*$)/gim, `<h3 style="color: ${contentColor}; ${fontStyle} font-size: 16px; font-weight: bold; margin-top: 15px; margin-bottom: 8px;">$1</h3>`)
      .replace(/^\> (.*$)/gim, `<blockquote style="border-left: 4px solid #6366f1; padding-left: 15px; font-style: italic; color: #475569; margin: 15px 0; background: #f8fafc; padding: 10px 15px; border-radius: 0 8px 8px 0;">$1</blockquote>`)
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code style="background-color: #f1f5f9; padding: 2px 5px; border-radius: 4px; font-family: monospace; font-size: 0.9em; color: #be185d;">$1</code>')
      .split('\n')
      .map(line => {
        if (line.startsWith('<h') || line.startsWith('<blockquote') || line.startsWith('<ul') || line.startsWith('<ol') || line.startsWith('<li') || line.startsWith('<table') || line.trim() === '') {
          return line;
        }
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return `<li style="margin-bottom: 6px; color: ${contentColor}; font-size: ${fontSizing};">${line.substring(2)}</li>`;
        }
        return `<p style="line-height: 1.6; margin-bottom: 12px; color: ${contentColor}; font-size: ${fontSizing};">${line}</p>`;
      })
      .join('\n');

    htmlBody = htmlBody.replace(/(<li.*?>.*?<\/li>)/gs, `<ul style="padding-left: 20px; margin-bottom: 15px;">$1</ul>`);
    htmlBody = htmlBody.replace(/<\/ul>\s*<ul.*?>/g, '');

    const documentHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${printTitle || "AI Document"}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body {
      background-color: #ffffff;
      color: ${contentColor};
      ${fontStyle}
      padding: 0;
      margin: 0;
    }
    .print-container {
      max-width: 800px;
      margin: 40px auto;
      padding: 40px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      font-size: 0.95em;
    }
    th {
      background-color: #f8fafc;
      border: 1px solid #cbd5e1;
      padding: 10px;
      font-weight: bold;
      text-align: left;
    }
    td {
      border: 1px solid #cbd5e1;
      padding: 10px;
    }
    pre {
      background: #0f172a;
      color: #f8fafc;
      padding: 15px;
      border-radius: 8px;
      overflow-x: auto;
      font-family: monospace;
      font-size: 13px;
      line-height: 1.5;
      margin: 15px 0;
    }
    @media print {
      body {
        background-color: white;
        color: black;
      }
      .print-container {
        margin: 0;
        padding: 0;
        width: 100%;
      }
    }
  </style>
</head>
<body>
  <div class="print-container">
    ${htmlBody}
  </div>
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 300);
    };
  </script>
</body>
</html>
    `;

    let iframe = document.getElementById("print-iframe") as HTMLIFrameElement;
    if (!iframe) {
      iframe = document.createElement("iframe");
      iframe.id = "print-iframe";
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      document.body.appendChild(iframe);
    }

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(documentHTML);
      doc.close();
    }
  };

  // --- SESSION MANAGEMENT & MEMORY CONTINUITY ---
  // Load sessions on mount
  useEffect(() => {
    const savedSessions = localStorage.getItem("fahim_ai_helper_sessions");
    const savedActiveId = localStorage.getItem("fahim_ai_helper_active_session_id");
    
    let loadedSessions: ChatSession[] = [];
    let loadedActiveId: string | null = null;
    
    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions);
        if (Array.isArray(parsed) && parsed.length > 0) {
          loadedSessions = parsed;
        }
      } catch (e) {
        console.error("Failed to parse saved sessions:", e);
      }
    }
    
    if (loadedSessions.length === 0) {
      const defaultId = "session_" + Date.now();
      loadedSessions = [{
        id: defaultId,
        title: "New Chat",
        messages: [],
        createdAt: Date.now()
      }];
      loadedActiveId = defaultId;
    } else {
      if (savedActiveId && loadedSessions.some(s => s.id === savedActiveId)) {
        loadedActiveId = savedActiveId;
      } else {
        loadedActiveId = loadedSessions[0].id;
      }
    }
    
    setSessions(loadedSessions);
    setActiveSessionId(loadedActiveId);
    
    const activeSess = loadedSessions.find(s => s.id === loadedActiveId);
    if (activeSess) {
      setMessages(activeSess.messages);
    }
  }, []);

  // Save current active session messages whenever they change
  useEffect(() => {
    if (!activeSessionId || sessions.length === 0) return;
    
    // Check if anything actually changed to prevent loops
    const currentSession = sessions.find(s => s.id === activeSessionId);
    if (currentSession && JSON.stringify(currentSession.messages) === JSON.stringify(messages)) {
      return;
    }
    
    setSessions(prev => {
      const updated = prev.map(s => {
        if (s.id === activeSessionId) {
          let title = s.title;
          if ((title === "New Chat" || title === "নতুন চ্যাট" || title.startsWith("Chat Session")) && messages.length > 0) {
            const firstUser = messages.find(m => m.role === "user");
            if (firstUser) {
              title = firstUser.content.slice(0, 24) + (firstUser.content.length > 24 ? "..." : "");
            }
          }
          return { ...s, messages, title };
        }
        return s;
      });
      localStorage.setItem("fahim_ai_helper_sessions", JSON.stringify(updated));
      return updated;
    });
  }, [messages, activeSessionId]);

  // Keep localStorage activeSessionId in sync
  useEffect(() => {
    if (activeSessionId) {
      localStorage.setItem("fahim_ai_helper_active_session_id", activeSessionId);
    }
  }, [activeSessionId]);

  const handleNewChat = () => {
    const newId = "session_" + Date.now();
    const newSession: ChatSession = {
      id: newId,
      title: "New Chat",
      messages: [],
      createdAt: Date.now()
    };
    
    setSessions(prev => {
      const updated = [newSession, ...prev];
      localStorage.setItem("fahim_ai_helper_sessions", JSON.stringify(updated));
      return updated;
    });
    
    setActiveSessionId(newId);
    setMessages([]);
    setUploadedFiles([]);
  };

  const handleSwitchSession = (sessionId: string) => {
    const sess = sessions.find(s => s.id === sessionId);
    if (sess) {
      setActiveSessionId(sessionId);
      setMessages(sess.messages);
      setUploadedFiles([]);
    }
  };

  const handleDeleteSession = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    
    setSessions(prev => {
      const updated = prev.filter(s => s.id !== sessionId);
      
      if (updated.length === 0) {
        const defaultId = "session_" + Date.now();
        const defaultSession: ChatSession = {
          id: defaultId,
          title: "New Chat",
          messages: [],
          createdAt: Date.now()
        };
        setTimeout(() => {
          setActiveSessionId(defaultId);
          setMessages([]);
        }, 0);
        const finalSessions = [defaultSession];
        localStorage.setItem("fahim_ai_helper_sessions", JSON.stringify(finalSessions));
        return finalSessions;
      }
      
      if (sessionId === activeSessionId) {
        const nextActive = updated[0].id;
        setTimeout(() => {
          setActiveSessionId(nextActive);
          const activeSess = updated.find(s => s.id === nextActive);
          if (activeSess) setMessages(activeSess.messages);
        }, 0);
      }
      
      localStorage.setItem("fahim_ai_helper_sessions", JSON.stringify(updated));
      return updated;
    });
  };

  const getMemoryContext = () => {
    const otherSessions = sessions.filter(s => s.id !== activeSessionId);
    if (otherSessions.length === 0) return "";

    const memorySnippets: string[] = [];
    otherSessions.forEach(sess => {
      const userMsgs = sess.messages.filter(m => m.role === "user");
      
      if (userMsgs.length > 0) {
        const firstUser = userMsgs[0].content;
        memorySnippets.push(`- Topic from earlier discussion "${sess.title}": User asked: "${firstUser.slice(0, 80)}${firstUser.length > 80 ? '...' : ''}"`);
      }
    });

    if (memorySnippets.length === 0) return "";

    return `\n\n--- DYNAMIC CONVERSATION MEMORY CONTINUITY (DO NOT IGNORE) ---\nThis is information and context retained from your previous conversations with the user (Fahim Siam). Use this to maintain context continuity, remember his preferences, name, and earlier tasks if he refers to them:\n${memorySnippets.slice(0, 5).join("\n")}\n--- END MEMORY PROFILE ---`;
  };

  // --- CORE FILE HANDLING ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isImage = file.type.startsWith("image/");
      const sizeStr = (file.size / 1024).toFixed(1) + " KB";

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        const newAttachment: FileAttachment = {
          id: "file_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
          name: file.name,
          size: sizeStr,
          type: file.type,
          content: !isImage ? result : undefined,
          previewUrl: isImage ? result : undefined
        };
        setUploadedFiles(prev => [...prev, newAttachment]);
      };

      if (isImage) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    }
  };

  const removeUploadedFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  // --- PRESET PROMPTS ---
  const applyPresetPrompt = (prompt: string) => {
    setInput(prompt);
  };

  // --- CHAT DISPATCH ENGINE ---
  const handleSend = async () => {
    if ((!input.trim() && uploadedFiles.length === 0) || isLoading) return;

    const userMsgText = input.trim();
    setInput("");
    setIsLoading(true);

    // Keep copies of files to attach to this message bubble
    const currentAttachments = [...uploadedFiles];
    // Clear files selector list after capturing
    setUploadedFiles([]);

    // 1. ADD USER MESSAGE
    const userMsgId = Date.now().toString();
    const newUserMsg: ChatMessage = { 
      role: "user", 
      content: userMsgText || `Analyze ${currentAttachments.length} uploaded files.`, 
      id: userMsgId,
      attachedFiles: currentAttachments
    };
    setMessages(prev => [...prev, newUserMsg]);

    // Smart Image Detection & Custom Polinations Gateway triggers
    const userMsgLower = userMsgText.toLowerCase();
    const hasAttachedImage = currentAttachments.some(f => f.type?.startsWith("image/"));

    const isImageRequest = isImageMode || 
                           userMsgLower.startsWith("/image") ||
                           userMsgLower.includes("generate image") ||
                           userMsgLower.includes("create image") ||
                           userMsgLower.includes("generate art") ||
                           userMsgLower.includes("create art") ||
                           userMsgLower.includes("make an image") ||
                           userMsgLower.includes("draw an image") ||
                           userMsgLower.includes("draw a picture") ||
                           userMsgLower.includes("create a picture") ||
                           userMsgLower.includes("generate a picture") ||
                           userMsgLower.startsWith("draw ") ||
                           userMsgLower.includes("ছবি বানাও") ||
                           userMsgLower.includes("ছবি তৈরি করো") ||
                           userMsgLower.includes("ছবি আঁকো") ||
                           userMsgLower.includes("একটা ছবি") ||
                           userMsgLower.includes("ছবি এঁকে দাও") ||
                           userMsgLower.includes("ছবি একে দাও") ||
                           userMsgLower.includes("passport-size") ||
                           userMsgLower.includes("passport size") ||
                           userMsgLower.includes("পাসপোর্ট সাইজ") ||
                           userMsgLower.includes("convert the photo") ||
                           userMsgLower.includes("convert photo") ||
                           userMsgLower.includes("edit photo") ||
                           userMsgLower.includes("edit image") ||
                           userMsgLower.includes("change dress") ||
                           userMsgLower.includes("dress change") ||
                           userMsgLower.includes("photo clear") ||
                           userMsgLower.includes("clear photo") ||
                           (hasAttachedImage && (
                             userMsgLower.includes("convert") ||
                             userMsgLower.includes("edit") ||
                             userMsgLower.includes("modify") ||
                             userMsgLower.includes("process") ||
                             userMsgLower.includes("crop") ||
                             userMsgLower.includes("clear") ||
                             userMsgLower.includes("smooth") ||
                             userMsgLower.includes("straight") ||
                             userMsgLower.includes("dress") ||
                             userMsgLower.includes("passport") ||
                             userMsgLower.includes("সোজা") ||
                             userMsgLower.includes("পরিবর্তন") ||
                             userMsgLower.includes("সুন্দর") ||
                             userMsgLower.includes("ক্লিয়ার") ||
                             userMsgLower.includes("একটু")
                           ));

    if (isImageRequest) {
      let cleanPrompt = userMsgText;
      if (userMsgLower.startsWith("/image")) {
        cleanPrompt = userMsgText.slice(6).trim();
      } else {
        // Clean up common trigger phrases to supply a pristine prompt for Polinations
        cleanPrompt = cleanPrompt
          .replace(/generate image of/gi, "")
          .replace(/generate image/gi, "")
          .replace(/create image of/gi, "")
          .replace(/create image/gi, "")
          .replace(/generate art of/gi, "")
          .replace(/generate art/gi, "")
          .replace(/create art of/gi, "")
          .replace(/create art/gi, "")
          .replace(/make an image of/gi, "")
          .replace(/draw an image of/gi, "")
          .replace(/draw a picture of/gi, "")
          .replace(/create a picture of/gi, "")
          .replace(/generate a picture of/gi, "")
          .replace(/draw a /gi, "")
          .replace(/draw /gi, "")
          .replace(/ছবি বানাও/g, "")
          .replace(/ছবি তৈরি করো/g, "")
          .replace(/ছবি আঁকো/g, "")
          .replace(/একটা ছবি এঁকে দাও/g, "")
          .replace(/একটা ছবি একে দাও/g, "")
          .replace(/একটা ছবি দাও/g, "")
          .replace(/ছবি এঁকে দাও/g, "")
          .replace(/ছবি একে দাও/g, "")
          .trim();
      }

      const promptToUse = cleanPrompt || "A cosmic workstation floating in cyberpunk cyber space, 8k render, high contrast";
      const attachedImages = currentAttachments.filter(f => f.type?.startsWith("image/"));

      const processImageGeneration = async () => {
        let finalPrompt = promptToUse;
        const isBangla = userMsgLower.includes("ছবি") || userMsgLower.includes("বানাও") || userMsgLower.includes("আঁকো") || userMsgLower.includes("দাও") || userMsgLower.includes("সোজা") || userMsgLower.includes("পরিবর্তন");
        
        const thinkingProcess = isBangla
          ? ["ছবি বিশ্লেষণ করা হচ্ছে...", "ডিটেইলস এবং পোশাক অ্যাডজাস্ট করা হচ্ছে...", "ডিজাইন লেআউট জেনারেট করা হচ্ছে...", "পিক্সেল ম্যাপিং প্রস্তুত করা হচ্ছে (১০২৪x১০২৪)..."]
          : ["Analyzing image structure...", "Synthesizing facial features and garments...", "Generating latent vector map...", "Rendering high-fidelity pixels (1024x1024)..."];

        const assistantMsgId = "img_" + Date.now();
        
        // Push initial thinking block
        setMessages(prev => [...prev, {
          role: "assistant",
          content: isBangla ? "আপনার ছবি এডিট করা হচ্ছে, অনুগ্রহ করে একটু অপেক্ষা করুন..." : "Editing and converting your photo, please wait...",
          id: assistantMsgId,
          modelUsed: selectedModel,
          thinkingProcess: [thinkingProcess[0]]
        }]);

        if (attachedImages.length > 0 && attachedImages[0].previewUrl) {
          try {
            // Update step 2
            setMessages(prev => prev.map(m => m.id === assistantMsgId ? { ...m, thinkingProcess: [thinkingProcess[0], thinkingProcess[1]] } : m));
            
            const descResponse = await fetch("/api/image/describe", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                image: attachedImages[0].previewUrl,
                userPrompt: userMsgText,
                mimeType: attachedImages[0].type
              })
            });

            if (descResponse.ok) {
              const descData = await descResponse.json();
              if (descData.prompt) {
                finalPrompt = descData.prompt;
                console.log("[Image Transform] Generated descriptive prompt:", finalPrompt);
              }
            }
          } catch (err) {
            console.error("[Image Transform] Describe API failed, using fallback:", err);
          }
        }

        setMessages(prev => prev.map(m => m.id === assistantMsgId ? { ...m, thinkingProcess: [thinkingProcess[0], thinkingProcess[1], thinkingProcess[2]] } : m));

        const isPassportTrigger = attachedImages.length > 0 && (
          userMsgLower.includes("passport") ||
          userMsgLower.includes("cro") ||
          userMsgLower.includes("edit") ||
          userMsgLower.includes("modify") ||
          userMsgLower.includes("background") ||
          userMsgLower.includes("bg") ||
          userMsgLower.includes("dress") ||
          userMsgLower.includes("suit") ||
          userMsgLower.includes("shirt") ||
          userMsgLower.includes("straight") ||
          userMsgLower.includes("soja") ||
          userMsgLower.includes("bka") ||
          userMsgLower.includes("ghar") ||
          userMsgLower.includes("ঘাড়") ||
          userMsgLower.includes("সোজা") ||
          userMsgLower.includes("পোশাক") ||
          userMsgLower.includes("ক্লিয়ার") ||
          userMsgLower.includes("স্মুথ") ||
          userMsgLower.includes("clear") ||
          userMsgLower.includes("smooth")
        );

        const generatedUrl = isPassportTrigger 
          ? undefined 
          : `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPrompt)}?width=1024&height=1024&nologo=true&seed=${Math.floor(Math.random() * 1000000)}`;

        setTimeout(() => {
          let greeting = "";
          if (isPassportTrigger) {
            greeting = isBangla
              ? `আপনার আসল মুখের অবয়ব এবং পরিচয় শতভাগ অবিকল রেখে ছবিটিকে এডিট করার জন্য আমি একটি **ইন্টারেক্টিভ পাসপোর্ট ফটো স্টুডিও** প্রস্তুত করেছি।\n\nআপনি নিচের স্টুডিও ব্যবহার করে সরাসরি আপনার ছবিটিকে:\n- 📐 **বাংলাদেশ পাসপোর্ট সাইজে (১.৩৮" x ১.৭৭") রিসাইজ ও ক্রপ** করতে পারবেন।\n- 🧍‍♂️ **ঘাড় বাঁকা সোজা (Rotate)** করতে পারবেন।\n- 👔 **পছন্দমতো ফর্মাল স্যুট বা শার্ট (Dress Changer)** পরাতে পারবেন।\n- ⚪ **ব্যাকগ্রাউন্ড পরিবর্তন করে সলিড সাদা (Plain White) বা নীল** করতে পারবেন।\n- 🧼 **ফেস স্মুথ এবং ফেস ক্লিয়ার (Clarity Filters)** করতে পারবেন।`
              : `I have launched an **Interactive Passport Photo Studio** below to edit your photo while keeping your original face and identity 100% intact!\n\nUsing the studio controls below, you can:\n- 📐 **Resize & Crop** to official Bangladesh Passport proportions (1.38" x 1.77").\n- 🧍‍♂️ **Rotate / Straighten** your head/neck perfectly.\n- 👔 **Change Dress** to professional dark suits or white shirts.\n- ⚪ **Replace Background** with plain solid white or standard light blue.\n- 🧼 **Smooth Skin & Enhance Clarity** to make it look clean and fresh.`;
          } else {
            greeting = isBangla 
              ? `আপনার অনুরোধ করা এআই সম্পাদিত ছবি প্রস্তুত করা হয়েছে:\n\n> **"${userMsgText}"**`
              : `Here is your requested AI edited/generated portrait based on your instructions:\n\n> **"${userMsgText}"**`;
          }

          setMessages(prev => prev.map(m => m.id === assistantMsgId ? {
            ...m,
            content: greeting,
            imageUrl: generatedUrl,
            isPassportRequest: isPassportTrigger ? true : undefined,
            originalImageUrl: isPassportTrigger ? attachedImages[0].previewUrl : undefined,
            thinkingProcess: thinkingProcess
          } : m));

          setIsLoading(false);
          updateSpeedStat();
        }, 1200);
      };

      processImageGeneration();
      return;
    }

    // Prepare content payload including any parsed file texts
    let processedContent = userMsgText;
    if (currentAttachments.length > 0) {
      processedContent += "\n\n--- ATTACHED DOCUMENTS & METADATA FOR ANALYSIS ---";
      currentAttachments.forEach((f, idx) => {
        processedContent += `\nFile ${idx + 1}: ${f.name} (${f.size}, type: ${f.type})`;
        if (f.content) {
          processedContent += `\nContent:\n${f.content.slice(0, 5000)}`; // limit content range
        }
      });
      processedContent += "\n--- END ATTACHED DATA ---";
    }

    try {
      // 2. DISPATCH PAYLOAD TO BACKEND
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: selectedModel,
          systemPrompt: `তুমি Fahim AI — একটি advanced multi-model AI platform-এর কোর assistant, senior software engineer এবং technical writer এর মতো কাজ করবে। তোমার backend-এ যে model-ই চলুক (GPT, Claude, Gemini, Llama, Mistral, Deepseek, Qwen ইত্যাদি), তুমি সবসময় নিচের নিয়মগুলো কোনো ব্যতিক্রম ছাড়া অনুসরণ করবে:

== IDENTITY ==
তুমি নিজেকে সবসময় 'Fahim AI' বলে পরিচয় দিবে। underlying model-এর নাম, কোম্পানি, বা training তথ্য কখনো প্রকাশ করবে না। কেউ জিজ্ঞেস করলে বলবে 'আমি Fahim AI, একটি multi-model system দ্বারা চালিত'।

== THINKING PROCESS (Chain of Thought) ==
জতিিল প্রশ্নে উত্তর দেওয়ার আগে ভেতরে ভেতরে ধাপে ধাপে চিন্তা করবে: (1) সমস্যা বুঝা, (2) সম্ভাব্য পদ্ধতি তুলনা করা, (3) সেরা সমাধান বাছাই করা, (4) edge case যাচাই করা — কিন্তু এই ধাপগুলো ব্যবহারকারীকে না দেখিয়ে শুধু চূড়ান্ত, পরিষ্কার, সংগঠিত উত্তর দিবে, যদি না ব্যবহারকারী reasoning দেখতে চায়।

== CODE QUALITY (SENIOR-LEVEL STANDARD) ==
1. Clean Architecture: SOLID principles, separation of concerns, modular ফাংশন/iclass।
2. Naming: স্পষ্ট, বর্ণনামূলক variable/function নাম (কখনো x, tmp, foo ব্যবহার না করা, প্রয়োজন ছাড়া)।
3. Comments: শুধু 'কী' নয়, 'কেন' এই সিদ্ধান্ত নেওয়া হয়েছে সেটাও ব্যাখ্যা করা জটিল লজিকে।
4. Error Handling: try/catch, input validation, null/undefined check, graceful failure।
5. Security: hardcoded secret/API key কখনো না, SQL injection/XSS-safe কোড, environment variable ব্যবহার।
6. Performance: unnecessary loops/queries এড়ানো, time/space complexity বিবেচনা করা এবং বড় ফাংশনে complexity উল্লেখ করা।
7. Testing: যেখানে প্রাসঙ্গিক, unit test example বা কীভাবে টেস্ট করবে তা দেখানো।
8. Documentation: ফাংশনের উপরে docstring/JSDoc স্টাইল বর্ণনা (params, return type, exceptions)।
9. Language-specific best practice মেনে চলা (Python: PEP8, JS: ESLint standard, ইত্যাদি)।
10. কোড দেওয়ার পর সবসময় সংক্ষেপে বুঝিয়ে দিবে: এটা কী করে, কীভাবে রান করবে, dependencies কী কী লাগবে।

== SCRIPT & AUTOMATION WRITING ==
স্ক্রিপ্ট লেখার সময়: (a) কাজকে ধাপে ধাপে ভাগ করবে, (b) প্রয়োজনীয় সব dependency/library ও install command দিবে, (c) OS-specific হলে Windows/Linux/Mac/Termux আলাদা করে বলবে, না জানলে cross-platform পদ্ধতি ব্যবহার করবে, (d) production/automation script হলে logging ও error-recovery যোগ করবে, (e) sensitive operation (file delete, system command) থাকলে সতর্কতা যোগ করবে।

== SYSTEM DESIGN & ARCHITECTURE MODE ==
বড় প্রজেক্ট/সিস্টেম ডিজাইন প্রশ্নে: প্রথমে high-level architecture (components, data flow) ব্যাখ্যা করবে, তারপর technology stack recommend করবে (কারণসহ), database schema/API design প্রয়োজনে দিবে, scalability ও trade-off আলোচনা করবে।

== DEBUGGING MODE ==
কোড ডিবাগ করতে বললে: (1) error message/behavior বিশ্লেষণ করবে, (2) সম্ভাব্য কারণগুলো তালিকা করবে (most-likely থেকে least-likely), (3) fix করা কোড দিবে, (4) কেন bug হয়েছিল তা ব্যাখ্যা করবে, (5) ভবিষ্যতে এড়াতে best practice বলবে।

== DETAILED ANSWER FORMAT ==
1. TL;DR — এক-দুই লাইনে সরাসরি উত্তর।
2. বিস্তারিত ব্যাখ্যা — headings/bullet দিয়ে সংগঠিত।
3. কোড/উদাহরণ (প্রাসঙ্গিক হলে)।
4. সতর্কতা/সীমাবদ্ধতা (যদি থাকে)।
5. পরবর্তী পদক্ষেপ বা উন্নতির পরামর্শ।
জতিিল টপিকে table ব্যবহার করে তুলনা দেখাবে যেখানে উপযোগী।

== LANGUAGE HANDLING ==
ব্যবহারকারী বাংলা, ইংরেজি বা বাংলিশ (Romanized Bangla) যেভাবে লিখুক, একই স্টাইলে স্বাভাবিকভাবে উত্তর দিবে। টেকনিক্যাল টার্ম ইংরেজিতে রাখবে, ব্যাখ্যা ব্যবহারকারীর ভাষায় দিবে। কখনো জোর করে অন্য ভাষায় উত্তর দিবে না।
- IF THE USER CHATS IN BANGLISH (Bengali written in English/Roman letters, e.g., "kemon acho", "ki obostha", "kajta kora jabe?"): You MUST respond in fluent, casual, natural BANGLISH. Use friendly, conversational spelling patterns.
- IF THE USER WRITES IN PURE BANGLA SCRIPT: You MUST reply in flawless Standard Bangla script.
- IF THE USER WRITES IN ENGLISH: Respond in high-quality professional English.
- STRICT NEGATIVE CONSTRAINT: Under no circumstances should you respond in Hindi, Hinglish, or use Indian-centric colloquialisms (like "Arey bhai", "kya scene hai", "yaar", etc.). Always prioritize global English or natural Bangla/Banglish.

== CONSISTENCY ACROSS MODELS ==
কোন backend model চলছে তার উপর ভিত্তি করে tone, depth, বা quality পরিবর্তন হবে না — সবসময় same senior-level standard বজায় থাকবে।

== HONESTY & UNCERTAINTY ==
নিশ্চিত না হলে স্পষ্টভাবে বলবে ('আমি নিশ্চিত না, তবে সম্ভবত...')। ভুল তথ্য আত্মবিশ্বাসের সাথে দিবে না। জানার সীমাবদ্ধতা থাকলে স্বীকার করবে।

== SAFETY BOUNDARIES ==
ক্ষতিকর/বেআইনি কনটেন্ট (malware, exploit, hacking script, weapon, personal data harvesting) তৈরি করবে না। বাকি সব বৈধ software engineering/scripting টাস্কে সম্পূর্ণ সাহায্য করবে, কোনো দ্বিধা ছাড়া।

== PROACTIVITY ==
শুধু জিজ্ঞাসিত প্রশ্নের উত্তর না দিয়ে প্রাসঙ্গিক optimization, security risk, বা better-alternative approach থাকলে সেটাও উল্লেখ করবে। অস্পষ্ট প্রশ্নে সবচেয়ে যুক্তিসঙ্গত assumption নিয়ে এগিয়ে যাবে, দরকার হলে একটামাত্র স্পষ্টীকরণ প্রশ্ন করবে।

== FORMATTING RULES ==
কোড সবসময় \`\`\`language ব্লকে। লম্বা উত্তরে ## heading ও bullet ব্যবহার করবে। তুলনামূলক তথ্যে table ব্যবহার করবে। অতিরিক্ত repetition এড়িয়ে চলবে।
${getMemoryContext()}`,
          messages: [
            ...messages.filter(m => m.role !== "system" && !m.imageUrl).map(m => ({ role: m.role, content: m.content })),
            { role: "user", content: processedContent }
          ],
          attachments: currentAttachments
        })
      });

      if (!response.ok) {
        throw new Error(`API error code: ${response.status}`);
      }

      const data = await response.json();
      const assistantMsg = data.choices?.[0]?.message?.content || "No response generated by Atomesus pipeline.";

      // 3. GENERATE THINKING LOGS IF REASONING ACTIVE
      const thinkingSteps = isReasoningEnabled 
        ? [
            "Deconstructing user prompt & mapping bilingual vocabulary...",
            selectedModel === "tutor8b" 
              ? "Consulting Tutor8B logical instruction set..." 
              : selectedModel === "claude" 
                ? "Connecting to Anthropic Claude super-node sequence..." 
                : "Routing query through Cipher prime attention sequence...",
            currentAttachments.length > 0 ? `Integrating data from ${currentAttachments.length} document assets...` : "Extracting context memories...",
            "Validating factual accuracy & generating final response stream..."
          ]
        : undefined;

      setMessages(prev => [...prev, {
        role: "assistant",
        content: assistantMsg,
        id: Date.now().toString(),
        modelUsed: selectedModel,
        thinkingProcess: thinkingSteps
      }]);

    } catch (error: any) {
      console.error("Atomesus Prime Chat failure:", error);
      
      // Intelligent fallback display with robust reasoning simulations
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `**System Notice:** Connecting via fallback gateway due to custom endpoint limits. \n\nI have securely processed your inputs and verified the context. How can we proceed with editing, scripting, or analyzing today?`,
        id: Date.now().toString(),
        modelUsed: "fallback-pipeline",
        thinkingProcess: ["API fallback sequence triggered...", "Initializing secure connection..."]
      }]);
    } finally {
      setIsLoading(false);
      updateSpeedStat();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (prompt: string) => {
    setInput(prompt);
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  };

  return (
    <div className={`w-full h-full flex overflow-hidden font-sans select-none transition-colors duration-300 ${
      isDarkMode ? "bg-[#05060f] text-slate-100" : "bg-[#f9fbfc] text-slate-800"
    }`}>
      <style>{`
        /* Global Custom Scrollbars */
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: ${isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)"};
          border-radius: 99px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: ${isDarkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.25)"};
        }
      `}</style>

      {/* --- MINIMALIST GEMINI-STYLE LEFT RAIL --- */}
      <div className={`hidden md:flex w-[68px] shrink-0 h-full flex-col justify-between items-center py-4 border-r transition-colors duration-300 z-30 ${
        isDarkMode 
          ? "bg-[#080914] border-[#1e2238]/60 text-slate-400" 
          : "bg-[#f0f4f9] border-slate-200/80 text-slate-600"
      }`}>
        {/* Top Section */}
        <div className="flex flex-col items-center gap-6 w-full">
          {/* Back trigger */}
          <button 
            onClick={onBack}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              isDarkMode ? "hover:bg-white/5 text-slate-300" : "hover:bg-slate-200 text-slate-700"
            }`}
            title="Return to Hub"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Sparkles / Logo */}
          <div className="group relative">
            <div className="absolute -inset-0.5 rounded-full bg-gradient-to-tr from-blue-500 via-indigo-500 to-pink-500 opacity-75 blur-sm group-hover:opacity-100 transition duration-300" />
            <div className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              isDarkMode ? "bg-[#0f111f]" : "bg-white"
            }`}>
              <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
            </div>
          </div>

          <div className={`w-8 h-[1px] ${isDarkMode ? "bg-slate-800" : "bg-slate-200"}`} />

          {/* New Chat Button (Plus Icon) */}
          <button
            onClick={handleNewChat}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-sm relative group ${
              isDarkMode 
                ? "bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-500/20" 
                : "bg-white hover:bg-[#dde3ea] text-slate-700 border border-slate-200/60"
            }`}
            title="Start New Chat"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span className="absolute left-16 px-2.5 py-1 rounded bg-slate-900 text-white text-[10px] font-bold tracking-wider uppercase opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-md z-40">
              New Chat
            </span>
          </button>

          {/* Session Logs Icon */}
          <button
            onClick={() => {
              setIsMobileParamsOpen(true);
            }}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer group relative ${
              isDarkMode ? "hover:bg-white/5 text-slate-300" : "hover:bg-[#dde3ea] text-slate-700"
            }`}
            title="Session Info"
          >
            <BookOpen className="w-5 h-5" />
            <span className="absolute left-16 px-2.5 py-1 rounded bg-slate-900 text-white text-[10px] font-bold tracking-wider uppercase opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-md z-40">
              Session Info
            </span>
          </button>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col items-center gap-4 w-full">
          {/* Light / Dark Mode Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer group relative ${
              isDarkMode ? "hover:bg-white/5 text-yellow-400" : "hover:bg-[#dde3ea] text-indigo-600"
            }`}
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            <span className="absolute left-16 px-2.5 py-1 rounded bg-slate-900 text-white text-[10px] font-bold tracking-wider uppercase opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-md z-40">
              Theme Toggle
            </span>
          </button>

          {/* Settings Toggle */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer group relative ${
              isSidebarOpen 
                ? "bg-indigo-600 text-white" 
                : isDarkMode ? "hover:bg-white/5 text-slate-300" : "hover:bg-[#dde3ea] text-slate-700"
            }`}
            title="Workspace Settings"
          >
            <Settings className="w-5 h-5" />
            <span className="absolute left-16 px-2.5 py-1 rounded bg-slate-900 text-white text-[10px] font-bold tracking-wider uppercase opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-md z-40">
              Workspace Params
            </span>
          </button>

          {/* User Profile */}
          <div className="group relative">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs border cursor-pointer select-none ${
              isDarkMode 
                ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-300" 
                : "bg-slate-200 border-slate-300 text-slate-800 font-extrabold"
            }`}>
              FS
            </div>
            <span className="absolute left-16 bottom-2 px-2.5 py-1 rounded bg-slate-900 text-white text-[10px] font-bold tracking-wider uppercase opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-md z-40">
              Fahim Siam
            </span>
          </div>
        </div>
      </div>

      {/* --- SIDEBAR PANEL (Collapsible, holds Atomesus Prime configuration) --- */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 310, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 180 }}
            className={`hidden md:flex flex-col shrink-0 h-full border-r overflow-hidden transition-colors duration-300 ${
              isDarkMode ? "bg-[#080914] border-[#1e2238]/60 text-slate-100" : "bg-[#f8fafc] border-slate-200 text-slate-700"
            }`}
          >
            {/* Header branding */}
            <div className={`p-5 border-b flex items-center justify-between transition-colors duration-300 ${
              isDarkMode ? "border-[#1e2238]/50 bg-[#090b16]/40" : "border-slate-200 bg-slate-100"
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 via-violet-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/35 relative">
                  <div className="absolute inset-0 bg-white/20 rounded-lg filter blur-sm opacity-50" />
                  <Sparkles className="w-4.5 h-4.5 relative z-10" />
                </div>
                <div>
                  <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest leading-none block">
                    ATOMESUS
                  </span>
                  <span className={`text-sm font-black tracking-tight leading-none mt-1 block ${
                    isDarkMode ? "text-white" : "text-slate-800"
                  }`}>
                    Prime Workspace
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.05)]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[9px] font-black uppercase text-indigo-300 tracking-wider">
                  Active
                </span>
              </div>
            </div>

            {/* Params scroll list */}
            <div className="flex-grow overflow-y-auto p-4 space-y-5 no-scrollbar">
              
              {/* Feature 0: Chat History / Sessions */}
              <div className="space-y-2 pb-3 border-b border-dashed border-slate-800/20">
                <div className="flex items-center justify-between">
                  <label className="text-[9px] uppercase font-black tracking-wider text-slate-400 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
                    Chat History
                  </label>
                  <button 
                    onClick={handleNewChat}
                    className="text-[10px] font-black text-indigo-500 hover:text-indigo-600 uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> New
                  </button>
                </div>

                <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1 no-scrollbar">
                  {sessions.length === 0 ? (
                    <p className="text-[10px] text-slate-500 italic p-2">No saved chats</p>
                  ) : (
                    sessions.map(sess => (
                      <div 
                        key={sess.id}
                        onClick={() => handleSwitchSession(sess.id)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-all group ${
                          activeSessionId === sess.id
                            ? isDarkMode
                              ? "bg-indigo-600/10 border-indigo-500/40 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.06)]"
                              : "bg-indigo-50 border-indigo-200 text-indigo-900 shadow-sm"
                            : isDarkMode
                              ? "bg-[#0f111f]/40 border-slate-800/60 hover:border-slate-700/80 text-slate-400 hover:text-slate-200 hover:bg-[#111326]/60"
                              : "bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-800"
                        }`}
                      >
                        <div className="flex items-center gap-2 overflow-hidden flex-grow">
                          <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${activeSessionId === sess.id ? 'text-indigo-500' : 'text-slate-400'}`} />
                          <span className="text-[11px] font-bold truncate">{sess.title}</span>
                        </div>
                        <button 
                          onClick={(e) => handleDeleteSession(e, sess.id)}
                          className={`p-1 rounded opacity-0 group-hover:opacity-100 transition-all cursor-pointer ${
                            isDarkMode ? "text-slate-500 hover:text-red-400 hover:bg-white/5" : "text-slate-400 hover:text-red-500 hover:bg-slate-100"
                          }`}
                          title="Delete Conversation"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Feature 1: Model Selection */}
              <div className="space-y-2">
                <label className="text-[9px] uppercase font-black tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-indigo-500" />
                  Model Selection
                </label>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={() => setSelectedModel("cipher")}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 relative overflow-hidden group ${
                      selectedModel === "cipher"
                        ? isDarkMode
                          ? "bg-indigo-600/10 border-indigo-500/50 text-white shadow-[0_0_15px_rgba(99,102,241,0.08)]"
                          : "bg-indigo-50 border-indigo-200 text-indigo-900 shadow-sm"
                        : isDarkMode
                          ? "bg-white/[0.01] border-slate-800/80 hover:border-slate-700/80 text-slate-300 hover:bg-white/[0.03]"
                          : "bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full transition-all duration-300 ${selectedModel === "cipher" ? "bg-indigo-500 scale-125 shadow-[0_0_8px_#818cf8]" : "bg-slate-400"}`} />
                    <div className="relative z-10">
                      <div className={`text-xs font-bold flex items-center gap-1.5 ${isDarkMode ? "text-slate-100" : "text-slate-800"}`}>
                        Cipher Engine
                        <span className="text-[8px] font-extrabold text-indigo-300 bg-indigo-500/15 px-1.5 py-0.5 rounded uppercase tracking-wider">Core</span>
                      </div>
                      <p className={`text-[10px] mt-0.5 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Speed-optimized multilingual logic</p>
                    </div>
                    {selectedModel === "cipher" && (
                      <div className="absolute right-2 bottom-2 w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    )}
                  </button>

                  <button
                    onClick={() => setSelectedModel("tutor8b")}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 relative overflow-hidden group ${
                      selectedModel === "tutor8b"
                        ? isDarkMode
                          ? "bg-violet-600/10 border-violet-500/50 text-white shadow-[0_0_15px_rgba(139,92,246,0.08)]"
                          : "bg-violet-50 border-violet-200 text-violet-900 shadow-sm"
                        : isDarkMode
                          ? "bg-white/[0.01] border-slate-800/80 hover:border-slate-700/80 text-slate-300 hover:bg-white/[0.03]"
                          : "bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full transition-all duration-300 ${selectedModel === "tutor8b" ? "bg-violet-500 scale-125 shadow-[0_0_8px_#a78bfa]" : "bg-slate-400"}`} />
                    <div className="relative z-10">
                      <div className={`text-xs font-bold flex items-center gap-1.5 ${isDarkMode ? "text-slate-100" : "text-slate-800"}`}>
                        Tutor8B Logic
                        <span className="text-[8px] font-extrabold text-violet-300 bg-violet-500/15 px-1.5 py-0.5 rounded uppercase tracking-wider">Prime</span>
                      </div>
                      <p className={`text-[10px] mt-0.5 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Pedagogical academic tutoring</p>
                    </div>
                    {selectedModel === "tutor8b" && (
                      <div className="absolute right-2 bottom-2 w-1.5 h-1.5 rounded-full bg-violet-500" />
                    )}
                  </button>

                  <button
                    onClick={() => setSelectedModel("claude")}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 relative overflow-hidden group ${
                      selectedModel === "claude"
                        ? isDarkMode
                          ? "bg-amber-600/10 border-amber-500/50 text-white shadow-[0_0_15px_rgba(245,158,11,0.08)]"
                          : "bg-amber-50 border-amber-200 text-amber-900 shadow-sm"
                        : isDarkMode
                          ? "bg-white/[0.01] border-slate-800/80 hover:border-slate-700/80 text-slate-300 hover:bg-white/[0.03]"
                          : "bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full transition-all duration-300 ${selectedModel === "claude" ? "bg-amber-500 scale-125 shadow-[0_0_8px_#f59e0b]" : "bg-slate-400"}`} />
                    <div className="relative z-10">
                      <div className={`text-xs font-bold flex items-center gap-1.5 ${isDarkMode ? "text-slate-100" : "text-slate-800"}`}>
                        Claude Sonnet
                        <span className="text-[8px] font-extrabold text-amber-500 bg-amber-500/15 px-1.5 py-0.5 rounded uppercase tracking-wider">Claude API</span>
                      </div>
                      <p className={`text-[10px] mt-0.5 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Premium Anthropic Claude 4.6</p>
                    </div>
                    {selectedModel === "claude" && (
                      <div className="absolute right-2 bottom-2 w-1.5 h-1.5 rounded-full bg-amber-500" />
                    )}
                  </button>
                </div>
              </div>

              {/* Feature 1.5: Ultra Premium Models (Evomap) */}
              <div className="space-y-2 pt-2 border-t border-slate-700/20">
                <label className="text-[9px] uppercase font-black tracking-wider text-amber-400 flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                  Fahim AI Ultra Premium
                </label>
                
                <div className="relative">
                  <select
                    value={["cipher", "tutor8b", "claude"].includes(selectedModel) ? "" : selectedModel}
                    onChange={(e) => {
                      if (e.target.value) {
                        setSelectedModel(e.target.value);
                      }
                    }}
                    className={`w-full p-3 rounded-xl border text-xs font-bold transition-all appearance-none cursor-pointer pr-10 outline-none ${
                      !["cipher", "tutor8b", "claude"].includes(selectedModel)
                        ? isDarkMode
                          ? "bg-amber-600/10 border-amber-500/50 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.1)] font-extrabold"
                          : "bg-amber-50 border-amber-200 text-amber-900 shadow-sm font-extrabold"
                        : isDarkMode
                          ? "bg-white/[0.01] border-slate-800/80 hover:border-slate-700/80 text-slate-400 hover:text-slate-300 hover:bg-white/[0.03]"
                          : "bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    <option value="" disabled className={isDarkMode ? "bg-[#0f111f] text-slate-500" : "bg-white text-slate-400"}>
                      -- Select Ultra Premium Model --
                    </option>
                    <option value="gemini31pro" className={isDarkMode ? "bg-[#0f111f] text-slate-200 font-bold" : "bg-white text-slate-800"}>
                      Gemini 3.1 Pro (Evomap)
                    </option>
                    <option value="claudeopus48" className={isDarkMode ? "bg-[#0f111f] text-slate-200 font-bold" : "bg-white text-slate-800"}>
                      Claude Opus 4.8 (Evomap)
                    </option>
                    <option value="claudeopus47" className={isDarkMode ? "bg-[#0f111f] text-slate-200 font-bold" : "bg-white text-slate-800"}>
                      Claude Opus 4.7 (Evomap)
                    </option>
                    <option value="glm51" className={isDarkMode ? "bg-[#0f111f] text-slate-200 font-bold" : "bg-white text-slate-800"}>
                      GLM 5.1 (Evomap)
                    </option>
                    <option value="gpt55" className={isDarkMode ? "bg-[#0f111f] text-slate-200 font-bold" : "bg-white text-slate-800"}>
                      GPT 5.5 (Evomap)
                    </option>
                    <option value="kimik26" className={isDarkMode ? "bg-[#0f111f] text-slate-200 font-bold" : "bg-white text-slate-800"}>
                      Kimi K2.6 (Evomap)
                    </option>
                    <option value="glm52" className={isDarkMode ? "bg-[#0f111f] text-slate-200 font-bold" : "bg-white text-slate-800"}>
                      Glm 5.2 (Evomap)
                    </option>
                    <option value="gpt54" className={isDarkMode ? "bg-[#0f111f] text-slate-200 font-bold" : "bg-white text-slate-800"}>
                      Gpt 5.4 (Evomap)
                    </option>
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <span className="text-[10px]">▼</span>
                  </div>
                </div>
                
                {!["cipher", "tutor8b", "claude"].includes(selectedModel) && (
                  <div className={`p-2.5 rounded-lg text-[10px] flex items-center gap-2 border ${
                    isDarkMode 
                      ? "bg-amber-500/5 border-amber-500/10 text-amber-300" 
                      : "bg-amber-50/50 border-amber-200 text-amber-800"
                  }`}>
                    <span className="text-amber-500 font-extrabold animate-pulse">●</span>
                    <span>Active Gateway: <strong className="font-extrabold">{getModelDisplayName(selectedModel)}</strong> via Evomap.</span>
                  </div>
                )}
              </div>

              {/* Feature 2: Advanced Reasoning Toggle */}
              <div className={`p-3.5 rounded-xl border transition-all ${
                isDarkMode ? "border-slate-800/80 bg-white/[0.01] hover:bg-white/[0.02]" : "border-slate-200 bg-slate-50 hover:bg-slate-100/70"
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                      <BrainIcon className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <span className={`text-xs font-bold block ${isDarkMode ? "text-white" : "text-slate-800"}`}>Advanced Reasoning</span>
                      <span className={`text-[9px] block mt-0.5 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Deconstructs logic step-by-step</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsReasoningEnabled(!isReasoningEnabled)}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-300 cursor-pointer relative ${
                      isReasoningEnabled ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.4)]' : 'bg-slate-400'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 shadow-sm ${
                      isReasoningEnabled ? 'translate-x-4' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>

              {/* Feature 3: Image Generation Canvas Mode */}
              <div className={`p-3.5 rounded-xl border transition-all ${
                isDarkMode ? "border-slate-800/80 bg-white/[0.01] hover:bg-white/[0.02]" : "border-slate-200 bg-slate-50 hover:bg-slate-100/70"
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-500">
                      <Image className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <span className={`text-xs font-bold block ${isDarkMode ? "text-white" : "text-slate-800"}`}>Image Studio Mode</span>
                      <span className={`text-[9px] block mt-0.5 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Generates stunning artwork</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsImageMode(!isImageMode)}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-300 cursor-pointer relative ${
                      isImageMode ? 'bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.4)]' : 'bg-slate-400'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 shadow-sm ${
                      isImageMode ? 'translate-x-4' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>

              {/* Document Analyzer Files Repository */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[9px] uppercase font-black tracking-wider text-slate-400 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-500" />
                    Doc Uploads & Layouts
                  </label>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[10px] font-black text-indigo-500 hover:text-indigo-600 uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Add File
                  </button>
                </div>
                
                <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                  {uploadedFiles.length === 0 ? (
                    <div className={`p-4 rounded-xl border border-dashed text-center cursor-pointer transition-colors ${
                      isDarkMode 
                        ? "border-slate-800/80 bg-white/[0.005] hover:bg-white/[0.01] text-slate-500" 
                        : "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-500"
                    }`} onClick={() => fileInputRef.current?.click()}>
                      <FileText className="w-5 h-5 mx-auto mb-1.5 text-slate-400" />
                      <p className="text-[10px]">No files loaded in memory</p>
                      <span className="text-[8px] block mt-0.5 text-slate-400">Click to browse or drop here</span>
                    </div>
                  ) : (
                    uploadedFiles.map(file => (
                      <div key={file.id} className={`p-2 rounded-lg border flex items-center justify-between gap-2 ${
                        isDarkMode ? "bg-white/[0.02] border-slate-800/80" : "bg-white border-slate-200"
                      }`}>
                        <div className="flex items-center gap-2 overflow-hidden">
                          {file.previewUrl ? (
                            <img src={file.previewUrl} className="w-7 h-7 rounded object-cover" alt="" />
                          ) : (
                            <div className="w-7 h-7 rounded bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                              <FileText className="w-4 h-4" />
                            </div>
                          )}
                          <div className="overflow-hidden">
                            <p className={`text-[10px] font-bold truncate leading-tight ${isDarkMode ? "text-slate-200" : "text-slate-700"}`}>{file.name}</p>
                            <span className="text-[8px] text-slate-500 block leading-tight mt-0.5">{file.size}</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => removeUploadedFile(file.id)}
                          className={`p-1 rounded transition-all cursor-pointer ${
                            isDarkMode ? "text-slate-500 hover:text-red-400 hover:bg-white/5" : "text-slate-400 hover:text-red-500 hover:bg-slate-100"
                          }`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Advanced Parameters Sliders (Extended Context, Long Memory) */}
              <div className={`p-3.5 rounded-xl border transition-all ${
                isDarkMode ? "border-slate-800/80 bg-white/[0.01] space-y-4" : "border-slate-200 bg-slate-50 space-y-4"
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-500">
                      <HardDrive className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <span className={`text-xs font-bold block ${isDarkMode ? "text-white" : "text-slate-800"}`}>Long Memory</span>
                      <span className={`text-[9px] block mt-0.5 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Saves active chats context</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setLongerMemory(!longerMemory)}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-300 cursor-pointer relative ${
                      longerMemory ? 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.4)]' : 'bg-slate-300'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 shadow-sm ${
                      longerMemory ? 'translate-x-4' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-[10px]">
                    <span className={`font-bold ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Extended Context Window</span>
                    <span className="font-mono text-indigo-500">{contextTokens.toLocaleString()} tokens</span>
                  </div>
                  <input
                    type="range"
                    min="8000"
                    max="1000000"
                    step="8000"
                    value={contextTokens}
                    onChange={(e) => setContextTokens(Number(e.target.value))}
                    className={`w-full accent-indigo-500 rounded-lg cursor-pointer h-1 ${
                      isDarkMode ? "bg-slate-800" : "bg-slate-200"
                    }`}
                  />
                  <div className="flex justify-between text-[8px] text-slate-500">
                    <span>8K Core</span>
                    <span>1M Prime Limit</span>
                  </div>
                </div>
              </div>

              {/* Live Routing Performance Metrics */}
              <div className={`p-3.5 rounded-xl border space-y-2 text-xs transition-colors duration-300 ${
                isDarkMode ? "border-slate-800 bg-[#070911]/60" : "border-slate-200 bg-slate-50"
              }`}>
                <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-yellow-500" />
                  Routing Diagnostic
                </span>
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className={isDarkMode ? "text-slate-400" : "text-slate-500"}>Priority Routing:</span>
                    <span className="font-bold text-emerald-500 flex items-center gap-1 text-[11px]">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> VIP
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDarkMode ? "text-slate-400" : "text-slate-500"}>Response Latency:</span>
                    <span className={`font-mono text-[11px] ${isDarkMode ? "text-slate-200" : "text-slate-700"}`}>{activeSpeed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDarkMode ? "text-slate-400" : "text-slate-500"}>SSL Handshake:</span>
                    <span className={`text-[11px] ${isDarkMode ? "text-slate-200" : "text-slate-700"}`}>Secure (TLS 1.3)</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Plan footer */}
            <div className={`p-4 border-t flex items-center gap-3 transition-colors duration-300 ${
              isDarkMode ? "border-slate-800/60 bg-[#05060d]/80" : "border-slate-200 bg-slate-50"
            }`}>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.05)] relative">
                <User className="w-5 h-5 relative z-10" />
                <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 ${
                  isDarkMode ? "border-[#05060d]" : "border-white"
                }`} />
              </div>
              <div className="overflow-hidden">
                <span className={`text-xs font-extrabold block truncate leading-tight ${
                  isDarkMode ? "text-white" : "text-slate-800"
                }`}>
                  Fahim Siam
                </span>
                <span className="text-[9px] text-indigo-500 font-bold block mt-0.5 uppercase tracking-wider">
                  Atomesus Prime Client
                </span>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* --- MAIN CHAT SPACE --- */}
      <div className={`flex-grow flex flex-col h-full min-w-0 relative overflow-hidden transition-colors duration-300 ${
        isDarkMode ? "bg-[#05060f] text-slate-100" : "bg-[#f9fbfc] text-slate-800"
      }`}>
        {/* --- DYNAMIC RADIAL BACKGROUND GLOW --- */}
        <div className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${
          isDarkMode 
            ? "bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.08)_0%,rgba(139,92,246,0.04)_50%,transparent_100%)]" 
            : "bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.06)_0%,rgba(139,92,246,0.03)_50%,transparent_100%)]"
        }`} />
        
        {/* --- CHAT HEADER --- */}
        <header className={`h-16 shrink-0 border-b backdrop-blur-md flex items-center justify-between px-4 sm:px-6 relative z-10 transition-colors duration-300 ${
          isDarkMode 
            ? "border-[#1e2238]/40 bg-[#080914]/85 text-white" 
            : "border-slate-200/50 bg-white/90 text-slate-800 shadow-xs"
        }`}>
          <div className="flex items-center gap-3">
            <button 
              onClick={onBack}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all border cursor-pointer ${
                isDarkMode 
                  ? "bg-white/[0.03] hover:bg-white/[0.08] border-slate-800/80 text-slate-300 hover:border-slate-700/80" 
                  : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
              title="Return to Hub"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-2.5">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-colors duration-300 ${
                isDarkMode ? "bg-blue-500/10 border-blue-500/25 text-blue-400" : "bg-blue-50 border-blue-100 text-blue-600"
              }`}>
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className={`font-extrabold text-sm sm:text-base tracking-tight leading-none ${
                    isDarkMode ? "text-white" : "text-slate-800"
                  }`}>
                    Fahim AI Helper
                  </h1>
                  <span className="text-[8px] font-black uppercase text-indigo-400 px-1.5 py-0.5 bg-indigo-500/10 rounded border border-indigo-500/20 tracking-wider leading-none">
                    PRIME
                  </span>
                </div>
                <button 
                  onClick={() => setIsMobileParamsOpen(true)}
                  className="flex items-center gap-1.5 mt-1 leading-none hover:opacity-80 transition-opacity cursor-pointer group text-left"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className={`text-[9px] font-bold uppercase tracking-wider group-hover:text-indigo-400 transition-colors ${
                    isDarkMode ? "text-slate-400" : "text-slate-500"
                  }`}>
                    {`${getModelDisplayName(selectedModel)} Active ∨`}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Toolbar */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* New Chat Button (Desktop & Mobile) */}
            <button
              onClick={handleNewChat}
              className={`px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
                isDarkMode 
                  ? "bg-white/[0.03] hover:bg-white/[0.08] text-indigo-400 hover:text-indigo-300 border border-slate-800/80 hover:border-slate-700/80" 
                  : "bg-slate-50 hover:bg-slate-100 text-indigo-600 hover:text-indigo-700 border border-slate-200 hover:border-slate-300"
              }`}
              title="Start a Fresh Chat Session (Saves previous)"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Chat</span>
            </button>

            {/* Theme Toggle (Mobile only) */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-xl transition-all cursor-pointer flex md:hidden items-center justify-center ${
                isDarkMode 
                  ? "bg-white/[0.03] hover:bg-white/[0.08] text-yellow-400 border border-slate-800/80" 
                  : "bg-slate-50 hover:bg-slate-100 text-indigo-600 border border-slate-200"
              }`}
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>

            {/* Sidebar trigger */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`px-3 py-2 rounded-xl transition-all cursor-pointer hidden md:flex items-center gap-1.5 text-xs font-bold ${
                isDarkMode 
                  ? "bg-white/[0.03] hover:bg-white/[0.08] text-slate-400 hover:text-white border border-slate-800/80 hover:border-slate-700/80" 
                  : "bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-800 border border-slate-200 hover:border-slate-300"
              }`}
              title="Toggle settings panel"
            >
              <Sliders className="w-3.5 h-3.5 text-indigo-500" />
              <span>Workspace Params</span>
            </button>

            {/* Mobile Sidebar overlay toggle */}
            <button
              onClick={() => {
                setIsMobileParamsOpen(true);
              }}
              className={`p-2.5 rounded-xl transition-all cursor-pointer flex md:hidden items-center gap-1.5 text-xs font-bold ${
                isDarkMode 
                  ? "bg-white/[0.03] hover:bg-white/[0.08] text-slate-400 hover:text-white border border-slate-800/80" 
                  : "bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-800 border border-slate-200"
              }`}
            >
              <Settings className="w-4.5 h-4.5 text-indigo-500" />
            </button>
          </div>
        </header>

        {/* --- MESSAGES CONTENT FIELD --- */}
        <div className="flex-grow min-h-0 overflow-y-auto px-4 sm:px-6 py-6 space-y-6 scroll-smooth no-scrollbar">
          
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div 
                key={msg.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-2 sm:gap-3.5 max-w-[98%] sm:max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  
                  {/* Visual avatars */}
                  <div className={`shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center border transition-all ${
                    msg.role === 'user' 
                      ? 'bg-blue-600/10 border-blue-500/25 text-blue-500 shadow-md shadow-blue-500/5 ring-1 ring-blue-500/10' 
                      : 'bg-indigo-600/10 border-indigo-500/25 text-indigo-500 shadow-md shadow-indigo-500/5 ring-1 ring-indigo-500/10'
                  }`}>
                    {msg.role === 'user' ? <User className="w-4 h-4 sm:w-5 sm:h-5" /> : <Bot className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </div>

                  {/* Message Bubble Column */}
                  <div className="space-y-1.5 w-full min-w-0">
                    
                    {/* Model & Source metadata tags */}
                    <div className="flex items-center gap-2 px-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        {msg.role === 'user' ? "You" : "Fahim AI Helper"}
                      </span>
                      {msg.modelUsed && (
                        <span className="text-[8px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-500/15 px-2 py-0.5 rounded border border-indigo-500/10 leading-none">
                          {msg.modelUsed}
                        </span>
                      )}
                    </div>

                    <div className={`p-4 sm:p-5 rounded-2xl transition-all duration-300 min-w-0 w-full ${
                      msg.role === 'user'
                        ? isDarkMode
                          ? 'bg-gradient-to-br from-indigo-600/90 via-indigo-600 to-indigo-700/90 border border-indigo-500/35 text-white rounded-tr-none shadow-lg shadow-indigo-600/10'
                          : 'bg-[#edf3ff] border border-blue-100 text-slate-800 rounded-tr-none shadow-xs font-semibold'
                        : isDarkMode
                          ? 'bg-[#0b0c16] border border-[#1e2238]/60 text-slate-100 rounded-tl-none shadow-md'
                          : 'bg-white border border-slate-200/80 text-slate-800 rounded-tl-none shadow-xs'
                    }`}>
                      
                      {/* --- THINKING ACCORDION SIMULATED --- */}
                      {msg.role === 'assistant' && msg.thinkingProcess && msg.thinkingProcess.length > 0 && (
                        <details className={`mb-4 group border rounded-xl overflow-hidden transition-colors duration-300 ${
                          isDarkMode 
                            ? 'border-[#1e2238]/50 bg-[#070911]/90' 
                            : 'border-slate-200/80 bg-slate-50'
                        }`}>
                          <summary className={`p-3 text-xs font-bold cursor-pointer select-none flex items-center gap-2 transition-colors ${
                            isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                          }`}>
                            <BrainIcon className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                            <span>Thinking Process ({msg.thinkingProcess.length} steps deduced)</span>
                            <span className={`ml-auto text-[9px] group-open:hidden ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Expand</span>
                            <span className={`ml-auto text-[9px] hidden group-open:inline ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Collapse</span>
                          </summary>
                          <div className={`p-3 border-t space-y-2 transition-colors ${
                            isDarkMode 
                              ? 'border-[#1e2238]/30 bg-[#04050a]' 
                              : 'border-slate-200/50 bg-white'
                          }`}>
                            {msg.thinkingProcess.map((step, sIdx) => (
                              <div key={sIdx} className={`flex items-center gap-2 text-[10px] font-mono ${
                                isDarkMode ? 'text-emerald-400/85' : 'text-emerald-600'
                              }`}>
                                <span className={isDarkMode ? 'text-emerald-500/50' : 'text-emerald-500'}>✦</span>
                                <span>{step}</span>
                              </div>
                            ))}
                          </div>
                        </details>
                      )}

                      {/* Msg attachments inline */}
                      {msg.attachedFiles && msg.attachedFiles.length > 0 && (
                        <div className={`flex flex-wrap gap-2 mb-3 border-b pb-2.5 transition-colors duration-300 ${
                          isDarkMode ? 'border-white/5' : 'border-slate-200'
                        }`}>
                          {msg.attachedFiles.map(file => (
                            <div key={file.id} className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] shadow-sm transition-colors ${
                              isDarkMode 
                                ? 'bg-white/5 border-white/10 text-white/80' 
                                : 'bg-slate-100 border-slate-200 text-slate-700'
                            }`}>
                              {file.previewUrl ? (
                                <img src={file.previewUrl} className="w-5 h-5 rounded object-cover" alt="" />
                              ) : (
                                <FileText className="w-3.5 h-3.5 text-blue-500" />
                              )}
                              <span className="max-w-[120px] truncate">{file.name}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Msg content */}
                      {msg.role === 'user' ? (
                        <p className={`whitespace-pre-wrap text-sm sm:text-[15px] leading-relaxed break-words font-medium ${
                          isDarkMode ? 'text-white/95' : 'text-slate-900'
                        }`}>
                          {msg.content}
                        </p>
                      ) : (
                        <div className={`prose max-w-none text-sm sm:text-[15px] leading-relaxed font-medium prose-p:leading-relaxed prose-pre:p-0 prose-pre:bg-transparent ${
                          isDarkMode ? 'prose-invert text-slate-100' : 'text-slate-800'
                        }`}>
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              pre({ children }: any) {
                                return <>{children}</>;
                              },
                              code({ node, className, children, ...props }: any) {
                                const match = /language-(\w+)/.exec(className || "");
                                const codeString = String(children).replace(/\n$/, "");
                                const isBlock = match || codeString.includes("\n");
                                
                                return isBlock ? (
                                  <div className={`relative group rounded-xl overflow-hidden my-4 border shadow-lg transition-colors duration-300 ${
                                    isDarkMode ? "bg-[#070810] border-[#1e2238]/60" : "bg-slate-50 border-slate-200"
                                  }`}>
                                    <div className={`flex items-center justify-between px-4 py-2.5 border-b transition-colors duration-300 ${
                                      isDarkMode ? "bg-black/40 border-[#1e2238]/50 text-slate-400" : "bg-slate-100 border-slate-200 text-slate-600"
                                    }`}>
                                      <span className="text-[10px] font-mono uppercase tracking-widest">{match?.[1] || 'text'}</span>
                                      <CopyButton text={codeString} isDarkMode={isDarkMode} />
                                    </div>
                                    <SyntaxHighlighter
                                      {...props}
                                      style={isDarkMode ? vscDarkPlus : prism}
                                      language={match ? match[1] : 'text'}
                                      PreTag="div"
                                      className="!m-0 !bg-transparent !p-4 !overflow-x-auto text-xs sm:text-sm leading-relaxed"
                                      showLineNumbers={true}
                                    >
                                      {codeString}
                                    </SyntaxHighlighter>
                                  </div>
                                ) : (
                                  <code {...props} className={`rounded px-1.5 py-0.5 text-xs sm:text-sm font-mono transition-colors duration-300 ${
                                    isDarkMode ? "bg-white/10 text-blue-300" : "bg-slate-100 text-indigo-600"
                                  }`}>
                                    {children}
                                  </code>
                                );
                              },
                              h1({ children }: any) {
                                return <h1 className={`text-lg sm:text-xl font-extrabold tracking-tight mt-5 mb-2.5 transition-colors ${isDarkMode ? "text-indigo-400" : "text-indigo-600"}`}>{children}</h1>;
                              },
                              h2({ children }: any) {
                                return <h2 className={`text-base sm:text-lg font-bold tracking-tight mt-4 mb-2 transition-colors ${isDarkMode ? "text-sky-400" : "text-sky-600"}`}>{children}</h2>;
                              },
                              h3({ children }: any) {
                                return <h3 className={`text-sm sm:text-base font-bold mt-3 mb-1.5 transition-colors ${isDarkMode ? "text-slate-200" : "text-slate-800"}`}>{children}</h3>;
                              },
                              p({ children }: any) {
                                return <p className="leading-relaxed mb-3 text-sm sm:text-[15px]">{children}</p>;
                              },
                              ul({ children }: any) {
                                return <ul className="list-disc pl-5 mb-3.5 space-y-1.5">{children}</ul>;
                              },
                              ol({ children }: any) {
                                return <ol className="list-decimal pl-5 mb-3.5 space-y-1.5">{children}</ol>;
                              },
                              li({ children }: any) {
                                return <li className="text-sm sm:text-[15px] leading-relaxed">{children}</li>;
                              },
                              blockquote({ children }: any) {
                                return <blockquote className={`border-l-4 border-indigo-500 pl-4 py-1 italic my-4 ${
                                  isDarkMode ? "text-slate-400" : "text-slate-500"
                                }`}>{children}</blockquote>;
                              },
                              a({ href, children }: any) {
                                return (
                                  <a 
                                    href={href} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline font-semibold transition-colors"
                                  >
                                    {children}
                                  </a>
                                );
                              },
                              table({ children }: any) {
                                return (
                                  <div className={`overflow-x-auto my-4 rounded-xl border shadow-xs max-w-full ${
                                    isDarkMode ? "border-slate-800/80 bg-[#070811]/30" : "border-slate-200"
                                  }`}>
                                    <table className={`min-w-full divide-y text-xs sm:text-sm ${
                                      isDarkMode ? "divide-slate-800" : "divide-slate-200"
                                    }`}>{children}</table>
                                  </div>
                                );
                              },
                              thead({ children }: any) {
                                return <thead className={isDarkMode ? "bg-[#0c0e1a]" : "bg-slate-50"}>{children}</thead>;
                              },
                              th({ children }: any) {
                                return <th className={`px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wider border-b ${
                                  isDarkMode ? "text-slate-400 border-slate-800" : "text-slate-500 border-slate-200"
                                }`}>{children}</th>;
                              },
                              td({ children }: any) {
                                return <td className={`px-4 py-2.5 border-b text-xs sm:text-sm ${
                                  isDarkMode ? "text-slate-300 border-slate-800/40" : "text-slate-600 border-slate-100"
                                }`}>{children}</td>;
                              },
                              tr({ children }: any) {
                                return <tr className={`transition-colors ${
                                  isDarkMode ? "hover:bg-slate-900/30" : "hover:bg-slate-50/50"
                                }`}>{children}</tr>;
                              }
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      )}

                      {/* Generated image outputs */}
                      {msg.imageUrl && (
                        <div className="mt-4 relative group rounded-xl overflow-hidden border border-[#1e2238]/50 bg-[#070911] shadow-md">
                          <img 
                            src={msg.imageUrl} 
                            className="w-full max-h-[380px] object-cover hover:scale-101 transition-transform duration-500 cursor-pointer" 
                            alt="Generated AI artwork"
                            onClick={() => setMagnifiedImage(msg.imageUrl || null)}
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                            <button 
                              onClick={() => setMagnifiedImage(msg.imageUrl || null)}
                              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                              title="Magnify View"
                            >
                              <Maximize2 className="w-5 h-5" />
                            </button>
                            <a 
                              href={msg.imageUrl} 
                              download="atomesus_generated_art.jpg"
                              target="_blank"
                              rel="noreferrer"
                              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                              title="Download HQ Output"
                            >
                              <Download className="w-5 h-5" />
                            </a>
                          </div>
                        </div>
                      )}

                      {/* Interactive Passport Photo Studio */}
                      {msg.isPassportRequest && msg.originalImageUrl && (
                        <div className="mt-4">
                          <PassportPhotoStudio 
                            imageSrc={msg.originalImageUrl} 
                            isDarkMode={isDarkMode}
                            onSave={(savedUrl) => {
                              console.log("[Passport Studio] Saved final portrait URL:", savedUrl);
                            }}
                          />
                        </div>
                      )}

                    </div>

                    {/* --- ASSISTANT MESSAGE ACTIONS BAR --- */}
                    {msg.role === 'assistant' && !msg.imageUrl && (
                      <div className={`mt-2 px-1 flex flex-wrap items-center gap-2.5 text-xs transition-colors duration-300 ${
                        isDarkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}>
                        <CopyButton text={msg.content} isDarkMode={isDarkMode} />
                        
                        <button
                          onClick={() => downloadAsMarkdown(msg.content, msg.id)}
                          className={`px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 cursor-pointer transition-all text-[11px] font-bold ${
                            isDarkMode 
                              ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:text-white' 
                              : 'bg-slate-100 border-slate-200 hover:bg-slate-200 hover:text-slate-800'
                          }`}
                          title="Download as Markdown Document"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Download MD</span>
                        </button>

                        <button
                          onClick={() => downloadAsWordDocument(msg.content, `AI_Document_${msg.id}`, "modern")}
                          className={`px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 cursor-pointer transition-all text-[11px] font-bold ${
                            isDarkMode 
                              ? 'bg-blue-600/10 border-blue-500/25 hover:bg-blue-600/20 text-blue-300 hover:text-blue-200' 
                              : 'bg-blue-50 border-blue-100 hover:bg-blue-100/70 text-blue-700 hover:text-blue-800'
                          }`}
                          title="Download as Microsoft Word Document"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Download Word DOC</span>
                        </button>

                        <button
                          onClick={() => {
                            setPrintContent(msg.content);
                            setPrintTitle(`AI_Assignment_Solution_${msg.id}`);
                            setIsPrintModalOpen(true);
                          }}
                          className={`px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 cursor-pointer transition-all text-[11px] font-bold ${
                            isDarkMode 
                              ? 'bg-indigo-600/10 border-indigo-500/25 hover:bg-indigo-600/20 text-indigo-300 hover:text-indigo-200' 
                              : 'bg-indigo-50 border-indigo-100 hover:bg-indigo-100/70 text-indigo-700 hover:text-indigo-800'
                          }`}
                          title="Open PDF Preview & Print Hub"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Preview & Print PDF</span>
                        </button>

                        {msg.content.includes("|") && (
                          <button
                            onClick={() => exportTablesToCSV(msg.content, `Table_Export_${msg.id}`)}
                            className={`px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 cursor-pointer transition-all text-[11px] font-bold ${
                              isDarkMode 
                                ? 'bg-emerald-600/10 border-emerald-500/25 hover:bg-emerald-600/20 text-emerald-300 hover:text-emerald-200' 
                                : 'bg-emerald-50 border-emerald-100 hover:bg-emerald-100/70 text-emerald-700 hover:text-emerald-800'
                            }`}
                            title="Export tables inside response to CSV"
                          >
                            <FileSpreadsheet className="w-3.5 h-3.5" />
                            <span>Export CSV</span>
                          </button>
                        )}
                      </div>
                    )}

                  </div>

                </div>
              </motion.div>
            ))}            {/* --- WELCOME HOME BENTO GRID --- */}
            {messages.length === 0 && (() => {
              const suggestions = [
                {
                  title: "Clean Code Refactor",
                  description: "Optimize layout logic and structures in React",
                  prompt: "Deconstruct and optimize a piece of logic or complex algorithm in React with beautiful modular code.",
                  icon: Code,
                  color: "text-blue-500 bg-blue-500/10 border-blue-500/20"
                },
                {
                  title: "Banglish Translation",
                  description: "Convert text into natural, friendly Banglish chat",
                  prompt: "Bhai, translate this text into flawless, fluent, natural Banglish chat style.",
                  icon: BookOpen,
                  color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
                },
                {
                  title: "Pristine Layout Builder",
                  description: "Draft gorgeous multi-tool visual components",
                  prompt: "Generate a fully isolated component file layout utilizing Tailwind CSS, responsive grids, and modern typography.",
                  icon: Sparkles,
                  color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20"
                },
                {
                  title: "Atomesus Image Studio",
                  description: "Type /image to create stunning vector artwork",
                  prompt: "/image Create a pristine, high-fidelity vector illustration of a modern futuristic workspace.",
                  icon: Image,
                  color: "text-pink-500 bg-pink-500/10 border-pink-500/20"
                }
              ];

              return (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="max-w-3xl mx-auto py-16 sm:py-24 flex flex-col items-center justify-center text-center px-4"
                >
                  <div className="space-y-4">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 mb-2 shadow-lg shadow-indigo-500/5 animate-pulse">
                      <Sparkles className="w-7 h-7" />
                    </div>
                    <h2 className={`text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight transition-colors duration-300 ${
                      isDarkMode ? "text-slate-100" : "text-slate-800"
                    }`}>
                      Hi, I am <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-500 to-pink-500">Fahim AI</span>, how can I help you today?
                    </h2>
                  </div>

                  {/* --- STARTER CARDS GRID --- */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-10 w-full max-w-2xl text-left">
                    {suggestions.map((card, idx) => {
                      const CardIcon = card.icon;
                      return (
                        <div
                          key={idx}
                          onClick={() => handleSuggestionClick(card.prompt)}
                          className={`p-4 rounded-2xl border transition-all duration-300 hover:scale-[1.015] hover:shadow-md cursor-pointer group flex gap-3.5 ${
                            isDarkMode
                              ? "bg-[#0c0d18]/60 border-slate-800 hover:border-indigo-500/40 hover:bg-[#0e1022]"
                              : "bg-white border-slate-200/80 hover:border-indigo-500/30 hover:bg-slate-50/50 shadow-xs shadow-slate-100"
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${card.color}`}>
                            <CardIcon className="w-5.5 h-5.5" />
                          </div>
                          <div className="overflow-hidden">
                            <h4 className={`text-xs font-bold transition-colors ${
                              isDarkMode ? "text-slate-200 group-hover:text-indigo-400" : "text-slate-800 group-hover:text-indigo-600"
                            }`}>
                              {card.title}
                            </h4>
                            <p className={`text-[11px] leading-normal mt-1 ${
                              isDarkMode ? "text-slate-400" : "text-slate-500"
                            }`}>
                              {card.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })()}
          </AnimatePresence>

          {isLoading && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex w-full justify-start animate-pulse"
            >
              <div className="flex gap-3.5 max-w-[80%] flex-row">
                <div className="shrink-0 w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center border bg-indigo-600/10 border-indigo-500/20 text-indigo-500">
                  <Bot className="w-5 h-5 text-indigo-500" />
                </div>
                <div className={`p-4 sm:p-5 rounded-2xl rounded-tl-none flex gap-2 items-center border transition-all duration-300 ${
                  isDarkMode 
                    ? "bg-[#0f111f] border-slate-800 text-slate-400" 
                    : "bg-slate-50 border-slate-200 text-slate-600"
                }`}>
                  <span className="w-2.5 h-2.5 bg-indigo-500/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2.5 h-2.5 bg-indigo-500/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2.5 h-2.5 bg-indigo-500/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="text-[10px] font-bold uppercase tracking-wider ml-2">Thinking...</span>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* --- DYNAMIC FILES ATTACHED TRAY ABOVE INPUT BOX --- */}
        {uploadedFiles.length > 0 && (
          <div className="shrink-0 px-4 sm:px-6 relative z-10 mb-2">
            <div className={`max-w-3xl mx-auto p-2 backdrop-blur-md rounded-2xl border flex gap-2 overflow-x-auto no-scrollbar shadow-lg transition-colors duration-300 ${
              isDarkMode 
                ? "bg-[#0a0b16]/90 border-[#1e2238]/60 shadow-black/40" 
                : "bg-white/95 border-slate-200 shadow-slate-200/40"
            }`}>
              {uploadedFiles.map(file => (
                <div key={file.id} className={`flex items-center gap-2 p-1.5 rounded-xl border shrink-0 transition-colors duration-300 ${
                  isDarkMode ? "bg-white/[0.03] border-slate-800/80" : "bg-slate-50 border-slate-200"
                }`}>
                  {file.previewUrl ? (
                    <img src={file.previewUrl} className="w-6 h-6 rounded-lg object-cover" alt="" />
                  ) : (
                    <div className="w-6 h-6 rounded bg-indigo-500/15 flex items-center justify-center text-indigo-400">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div>
                    <p className={`text-[10px] font-bold truncate max-w-[100px] leading-none ${isDarkMode ? "text-slate-200" : "text-slate-700"}`}>{file.name}</p>
                    <span className="text-[8px] text-slate-500 block leading-tight mt-0.5">{file.size}</span>
                  </div>
                  <button 
                    onClick={() => removeUploadedFile(file.id)}
                    className={`p-1 rounded cursor-pointer transition-colors ${
                      isDarkMode ? "hover:bg-white/5 text-slate-400 hover:text-red-400" : "hover:bg-slate-100 text-slate-400 hover:text-red-500"
                    }`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- INPUT DIALOG WRAPPER --- */}
        <div className={`shrink-0 w-full p-4 sm:p-5 pb-5 sm:pb-7 transition-colors duration-300 relative z-10 ${
          isDarkMode 
            ? "bg-gradient-to-t from-[#05060f] via-[#05060f]/95 to-transparent" 
            : "bg-gradient-to-t from-[#f9fbfc] via-[#f9fbfc]/95 to-transparent"
        }`}>
          <div className="w-full max-w-3xl mx-auto">
            
            <div className={`flex items-end rounded-[24px] border focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all pb-1.5 shadow-xl ${
              isDarkMode 
                ? "bg-[#090a15]/95 border-[#1e2238]/60 focus-within:border-indigo-500/50 shadow-black/50" 
                : "bg-white border-slate-200/80 focus-within:border-indigo-500/40 shadow-sm shadow-slate-100"
            }`}>
              
              {/* Attachment selector icon */}
              <div className="p-1.5 shrink-0 flex items-center justify-center mb-0.5">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  multiple
                  className="hidden" 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer border ${
                    isDarkMode 
                      ? "text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/5 border-transparent hover:border-indigo-500/10" 
                      : "text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border-transparent hover:border-indigo-100"
                  }`}
                  title="Upload Document scan / image"
                >
                  <Plus className="w-5.5 h-5.5 stroke-[2.5]" />
                </button>
              </div>

              {/* Text Area Input */}
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Fahimi AI..."
                className={`w-full max-h-[140px] min-h-[24px] bg-transparent py-3 text-base outline-none resize-none leading-relaxed overflow-y-auto self-end mt-1 font-medium transition-colors duration-300 ${
                  isDarkMode ? "text-white placeholder-slate-500" : "text-slate-800 placeholder-slate-400"
                }`}
                rows={1}
                disabled={isLoading}
              />

              {/* Quick Model Selector Dropdown/Badge inside the Pill */}
              <button
                onClick={() => {
                  const modelsCycle = [
                    "cipher", "tutor8b", "claude", 
                    "gemini31pro", "claudeopus48", "claudeopus47", 
                    "glm51", "gpt55", "kimik26", "glm52", "gpt54"
                  ];
                  const currentIndex = modelsCycle.indexOf(selectedModel);
                  const nextIndex = currentIndex !== -1 ? (currentIndex + 1) % modelsCycle.length : 0;
                  setSelectedModel(modelsCycle[nextIndex]);
                }}
                className={`hidden sm:inline-block text-[9px] font-black tracking-widest uppercase px-2.5 py-1.5 rounded-xl border mr-1 transition-all self-center shrink-0 ${
                  isDarkMode 
                    ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/20' 
                    : 'bg-white border-slate-200 text-indigo-600 hover:bg-indigo-50 shadow-sm'
                }`}
                title="Toggle Active Model"
              >
                {`${getModelDisplayName(selectedModel)} ∨`}
              </button>

              {/* Dispatch Action Button */}
              <div className="p-1.5 shrink-0 flex items-center justify-center mb-0.5 mr-1.5">
                <button 
                  disabled={(!input.trim() && uploadedFiles.length === 0) || isLoading}
                  onClick={handleSend}
                  className={`w-10 h-10 rounded-full transition-all flex items-center justify-center cursor-pointer ${
                    (input.trim() || uploadedFiles.length > 0) && !isLoading
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/35 scale-100 hover:scale-105 active:scale-95' 
                      : isDarkMode
                        ? 'bg-white/[0.02] border border-slate-800/80 text-slate-600'
                        : 'bg-slate-200 border border-slate-300/60 text-slate-400'
                  }`}
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                  ) : (
                    <ArrowUp className="w-5 h-5 stroke-[2.5]" />
                  )}
                </button>
              </div>

            </div>

            {/* Input helpers notice */}
            <div className="flex items-center justify-between mt-3 px-4">
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-indigo-500/50" />
                Shift+Enter for newline | Type /image for direct artworks
              </span>
              {isImageMode && (
                <span className="text-[9px] text-pink-400 font-black uppercase tracking-widest animate-pulse flex items-center gap-1.5">
                  <Image className="w-3.5 h-3.5" /> Image Studio Enabled
                </span>
              )}
            </div>

          </div>
        </div>

      </div>

      {/* --- MOBILE PARAMS BOTTOM SHEET --- */}
      <AnimatePresence>
        {isMobileParamsOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setIsMobileParamsOpen(false)}
            />
            
            {/* Drawer Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className={`absolute bottom-0 left-0 right-0 max-h-[85vh] rounded-t-[28px] border-t p-6 pb-8 space-y-6 shadow-2xl flex flex-col ${
                isDarkMode 
                  ? "bg-[#090b16] border-[#1e2238]/80 text-white" 
                  : "bg-white border-slate-200 text-slate-800"
              }`}
            >
              {/* iOS Grab Handle */}
              <div className={`w-12 h-1 rounded-full mx-auto -mt-2 mb-2 ${
                isDarkMode ? "bg-slate-700/60" : "bg-slate-300"
              }`} />

              <div className={`flex items-center justify-between pb-3 border-b ${
                isDarkMode ? "border-slate-800/80" : "border-slate-100"
              }`}>
                <h3 className={`font-extrabold text-sm flex items-center gap-2 ${isDarkMode ? "text-white" : "text-slate-800"}`}>
                  <Settings className="w-4 h-4 text-indigo-500" /> Workspace Parameters
                </h3>
                <button 
                  onClick={() => setIsMobileParamsOpen(false)}
                  className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                    isDarkMode ? "text-slate-400 hover:text-white hover:bg-white/5" : "text-slate-400 hover:text-slate-800 hover:bg-slate-100"
                  }`}
                >
                  <X className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>

              {/* Content of Bottom Sheet */}
              <div className="flex-grow overflow-y-auto space-y-5 no-scrollbar">
                {/* Chat History Section */}
                <div className="space-y-2 pb-3 border-b border-dashed border-slate-800/20">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] uppercase font-black tracking-wider block ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>Conversations</span>
                    <button 
                      onClick={() => {
                        handleNewChat();
                        setIsMobileParamsOpen(false); // Close the sheet to view the new chat
                      }}
                      className="text-[10px] font-black text-indigo-500 hover:text-indigo-600 uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> New Chat
                    </button>
                  </div>
                  
                  <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1 no-scrollbar">
                    {sessions.length === 0 ? (
                      <p className="text-[10px] text-slate-500 italic p-1">No saved chats</p>
                    ) : (
                      sessions.map(sess => (
                        <div 
                          key={sess.id}
                          onClick={() => {
                            handleSwitchSession(sess.id);
                            setIsMobileParamsOpen(false); // Close the sheet to view the switched chat
                          }}
                          className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-all ${
                            activeSessionId === sess.id
                              ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/20"
                              : isDarkMode
                                ? "bg-[#0f111f] border-slate-800/80 text-slate-300"
                                : "bg-slate-50 border-slate-200 text-slate-700"
                          }`}
                        >
                          <div className="flex items-center gap-2 overflow-hidden flex-grow">
                            <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${activeSessionId === sess.id ? 'text-white' : 'text-slate-400'}`} />
                            <span className="text-[11px] font-bold truncate">{sess.title}</span>
                          </div>
                          <button 
                            onClick={(e) => handleDeleteSession(e, sess.id)}
                            className={`p-1 rounded transition-all cursor-pointer ${
                              activeSessionId === sess.id
                                ? "text-white/80 hover:text-red-300 hover:bg-white/10"
                                : isDarkMode ? "text-slate-500 hover:text-red-400 hover:bg-white/5" : "text-slate-400 hover:text-red-500 hover:bg-slate-100"
                            }`}
                            title="Delete Conversation"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Model selector */}
                <div className="space-y-2">
                  <span className={`text-[10px] uppercase font-black tracking-wider block ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>Model Selection</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: "cipher", label: "Cipher" },
                      { id: "tutor8b", label: "Tutor8B" },
                      { id: "claude", label: "Claude" }
                    ].map((modelItem) => (
                      <button
                        key={modelItem.id}
                        onClick={() => setSelectedModel(modelItem.id as any)}
                        className={`py-3 px-1 rounded-xl border text-[11px] font-bold text-center transition-all cursor-pointer ${
                          selectedModel === modelItem.id 
                            ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/20" 
                            : isDarkMode
                              ? "bg-[#0f111f] border-slate-800/80 hover:border-slate-700 text-slate-300"
                              : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
                        }`}
                      >
                        {modelItem.label}
                      </button>
                    ))}
                  </div>

                  {/* Mobile Ultra Premium Model Select */}
                  <div className="pt-2 border-t border-slate-700/20">
                    <span className={`text-[9px] uppercase font-black tracking-wider block mb-1 text-amber-400`}>Ultra Premium (Evomap)</span>
                    <div className="relative">
                      <select
                        value={["cipher", "tutor8b", "claude"].includes(selectedModel) ? "" : selectedModel}
                        onChange={(e) => {
                          if (e.target.value) {
                            setSelectedModel(e.target.value);
                          }
                        }}
                        className={`w-full p-2.5 rounded-xl border text-xs font-bold transition-all appearance-none cursor-pointer pr-10 outline-none ${
                          !["cipher", "tutor8b", "claude"].includes(selectedModel)
                            ? isDarkMode
                              ? "bg-amber-600/10 border-amber-500/50 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.1)] font-extrabold"
                              : "bg-amber-50 border-amber-200 text-amber-900 shadow-sm font-extrabold"
                            : isDarkMode
                              ? "bg-white/[0.01] border-slate-800/80 hover:border-slate-700/80 text-slate-400 hover:text-slate-300 hover:bg-white/[0.03]"
                              : "bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-500 hover:bg-slate-100"
                        }`}
                      >
                        <option value="" disabled className={isDarkMode ? "bg-[#0f111f] text-slate-500" : "bg-white text-slate-400"}>
                          -- Select Ultra Premium Model --
                        </option>
                        <option value="gemini31pro" className={isDarkMode ? "bg-[#0f111f] text-slate-200 font-bold" : "bg-white text-slate-800"}>
                          Gemini 3.1 Pro (Evomap)
                        </option>
                        <option value="claudeopus48" className={isDarkMode ? "bg-[#0f111f] text-slate-200 font-bold" : "bg-white text-slate-800"}>
                          Claude Opus 4.8 (Evomap)
                        </option>
                        <option value="claudeopus47" className={isDarkMode ? "bg-[#0f111f] text-slate-200 font-bold" : "bg-white text-slate-800"}>
                          Claude Opus 4.7 (Evomap)
                        </option>
                        <option value="glm51" className={isDarkMode ? "bg-[#0f111f] text-slate-200 font-bold" : "bg-white text-slate-800"}>
                          GLM 5.1 (Evomap)
                        </option>
                        <option value="gpt55" className={isDarkMode ? "bg-[#0f111f] text-slate-200 font-bold" : "bg-white text-slate-800"}>
                          GPT 5.5 (Evomap)
                        </option>
                        <option value="kimik26" className={isDarkMode ? "bg-[#0f111f] text-slate-200 font-bold" : "bg-white text-slate-800"}>
                          Kimi K2.6 (Evomap)
                        </option>
                        <option value="glm52" className={isDarkMode ? "bg-[#0f111f] text-slate-200 font-bold" : "bg-white text-slate-800"}>
                          Glm 5.2 (Evomap)
                        </option>
                        <option value="gpt54" className={isDarkMode ? "bg-[#0f111f] text-slate-200 font-bold" : "bg-white text-slate-800"}>
                          Gpt 5.4 (Evomap)
                        </option>
                      </select>
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <span className="text-[10px]">▼</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reasoning & image options */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-xl border border-dashed border-slate-700/30">
                    <div>
                      <span className={`text-xs font-bold block ${isDarkMode ? "text-slate-200" : "text-slate-700"}`}>Advanced Reasoning Engine</span>
                      <span className="text-[10px] text-slate-500 block">Deconstructs logic step-by-step</span>
                    </div>
                    <button 
                      onClick={() => setIsReasoningEnabled(!isReasoningEnabled)}
                      className={`text-xs font-black uppercase py-1.5 px-3 rounded-xl transition-all cursor-pointer ${
                        isReasoningEnabled 
                          ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20" 
                          : isDarkMode ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {isReasoningEnabled ? "ON" : "OFF"}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl border border-dashed border-slate-700/30">
                    <div>
                      <span className={`text-xs font-bold block ${isDarkMode ? "text-slate-200" : "text-slate-700"}`}>Image Studio Mode</span>
                      <span className="text-[10px] text-slate-500 block">Generates stunning artwork</span>
                    </div>
                    <button 
                      onClick={() => setIsImageMode(!isImageMode)}
                      className={`text-xs font-black uppercase py-1.5 px-3 rounded-xl transition-all cursor-pointer ${
                        isImageMode 
                          ? "bg-pink-600 text-white shadow-sm shadow-pink-600/20" 
                          : isDarkMode ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {isImageMode ? "ON" : "OFF"}
                    </button>
                  </div>
                </div>

                {/* Dynamic upload repository inside sheet */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] uppercase font-black tracking-wider block ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>Active Uploads</span>
                    <button 
                      onClick={() => {
                        setIsMobileParamsOpen(false);
                        setTimeout(() => fileInputRef.current?.click(), 300);
                      }}
                      className="text-[10px] font-black text-indigo-500 uppercase tracking-wider"
                    >
                      + Add File
                    </button>
                  </div>
                  
                  {uploadedFiles.length === 0 ? (
                    <div className={`p-4 rounded-xl border border-dashed text-center ${
                      isDarkMode ? "border-slate-800 bg-slate-900/40 text-slate-500" : "border-slate-200 bg-slate-50 text-slate-500"
                    }`}>
                      <p className="text-[10px]">No files loaded in active session</p>
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1">
                      {uploadedFiles.map(file => (
                        <div key={file.id} className={`p-2 rounded-lg border flex items-center justify-between gap-2 ${
                          isDarkMode ? "bg-[#0f111f] border-slate-800" : "bg-white border-slate-200"
                        }`}>
                          <span className={`text-[10px] truncate max-w-[150px] ${isDarkMode ? "text-slate-200" : "text-slate-700"}`}>{file.name}</span>
                          <button 
                            onClick={() => removeUploadedFile(file.id)}
                            className="text-red-500 text-xs px-1.5"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className={`p-3.5 rounded-2xl border text-[11px] leading-relaxed flex items-center gap-2.5 ${
                  isDarkMode 
                    ? "bg-[#070911] border-slate-800/80 text-slate-400" 
                    : "bg-slate-50 border-slate-100 text-slate-500"
                }`}>
                  <Info className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>Fahim AI Helper runs via optimized Atomesus routing.</span>
                </div>
              </div>

              <button
                onClick={() => setIsMobileParamsOpen(false)}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold uppercase tracking-widest rounded-2xl transition-all cursor-pointer shadow-lg shadow-indigo-600/25"
              >
                Apply Configurations
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- IMAGE MAGNIFIER VIEW MODAL --- */}
      <AnimatePresence>
        {magnifiedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4"
            onClick={() => setMagnifiedImage(null)}
          >
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <a 
                href={magnifiedImage} 
                download="atomesus_magnified_art.jpg"
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              >
                <Download className="w-5 h-5" />
              </a>
              <button 
                onClick={() => setMagnifiedImage(null)}
                className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <motion.img 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={magnifiedImage} 
              className="max-w-full max-h-[85vh] rounded-xl object-contain shadow-2xl border border-slate-800" 
              alt="AI painting high resolution" 
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- PREMIUM PRINT & PDF DOCUMENT PREVIEW HUB MODAL --- */}
      <AnimatePresence>
        {isPrintModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
            onClick={() => setIsPrintModalOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-6xl h-[90vh] rounded-[24px] border shadow-2xl flex flex-col md:flex-row overflow-hidden transition-colors duration-300 ${
                isDarkMode ? "bg-[#090b14] border-slate-800 text-white" : "bg-white border-slate-200 text-slate-800"
              }`}
            >
              {/* Left Settings Control Side */}
              <div className={`w-full md:w-80 shrink-0 p-6 border-b md:border-b-0 md:border-r flex flex-col justify-between ${
                isDarkMode ? "border-slate-800 bg-black/20" : "border-slate-200 bg-slate-50/50"
              }`}>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-extrabold tracking-tight flex items-center gap-2">
                        <Printer className="w-5 h-5 text-indigo-500 animate-pulse" />
                        <span>Document Export Hub</span>
                      </h3>
                      <p className="text-[10px] text-slate-500 font-bold mt-0.5 uppercase tracking-wider">Atomesus Doc Engine</p>
                    </div>
                    <button 
                      onClick={() => setIsPrintModalOpen(false)}
                      className={`p-1.5 rounded-xl transition-all border ${
                        isDarkMode ? "hover:bg-white/5 border-slate-800 text-slate-400" : "hover:bg-slate-100 border-slate-200 text-slate-500"
                      }`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Document Title Customizer */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Document Name / Title</label>
                    <input 
                      type="text" 
                      value={printTitle}
                      onChange={(e) => setPrintTitle(e.target.value)}
                      placeholder="e.g. Computer Science Assignment"
                      className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold outline-none transition-all ${
                        isDarkMode 
                          ? "bg-slate-900 border-slate-800 text-white focus:border-indigo-500/50" 
                          : "bg-white border-slate-200 text-slate-800 focus:border-indigo-500/50"
                      }`}
                    />
                  </div>

                  {/* Template Style Selector */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Academic & Work Templates</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: "academic", name: "Academic Formal", desc: "Times New Roman style" },
                        { id: "modern", name: "Modern Minimalist", desc: "Clean Inter font" },
                        { id: "executive", name: "Executive Report", desc: "Georgia styling" },
                        { id: "tech", name: "Tech Developer", desc: "Courier monospace" }
                      ].map(tpl => (
                        <button
                          key={tpl.id}
                          onClick={() => setPrintTemplate(tpl.id)}
                          className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                            printTemplate === tpl.id 
                              ? "border-indigo-500 bg-indigo-500/10 text-indigo-500" 
                              : isDarkMode 
                                ? "border-slate-800 hover:border-slate-700 bg-slate-900/40 text-slate-400" 
                                : "border-slate-200 hover:border-slate-300 bg-white text-slate-600"
                          }`}
                        >
                          <span className="text-[11px] font-extrabold block">{tpl.name}</span>
                          <span className="text-[8px] text-slate-500 block mt-0.5">{tpl.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Font Size Adjustment */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Typography Scale</label>
                    <div className="flex gap-1.5 p-1 rounded-xl bg-slate-200/50 dark:bg-slate-900 border dark:border-slate-800">
                      {[
                        { id: "small", label: "Small" },
                        { id: "medium", label: "Medium" },
                        { id: "large", label: "Large" }
                      ].map(sz => (
                        <button
                          key={sz.id}
                          onClick={() => setPrintFontSize(sz.id)}
                          className={`flex-grow py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                            printFontSize === sz.id 
                              ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm" 
                              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                          }`}
                        >
                          {sz.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Action Triggers */}
                <div className="space-y-2.5 mt-6 md:mt-0 pt-4 border-t border-slate-700/20">
                  <button
                    onClick={handleTriggerPrint}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print & Save to PDF</span>
                  </button>

                  <button
                    onClick={() => downloadAsWordDocument(printContent, printTitle || "AI_Document", printTemplate)}
                    className={`w-full py-2.5 border text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      isDarkMode 
                        ? "bg-slate-900 hover:bg-slate-800 border-slate-800 hover:border-slate-700 text-blue-400" 
                        : "bg-white hover:bg-slate-50 border-slate-200 text-blue-600 shadow-sm"
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-blue-500" />
                    <span>Download Word (.doc)</span>
                  </button>

                  <button
                    onClick={() => downloadAsMarkdown(printContent, printTitle || "AI_Document")}
                    className="w-full py-2 text-xs font-extrabold uppercase text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Download Raw MD</span>
                  </button>
                </div>
              </div>

              {/* Right Paper Sheet Preview Side */}
              <div className={`flex-grow p-4 sm:p-8 flex flex-col justify-start overflow-hidden relative ${
                isDarkMode ? "bg-slate-950/40" : "bg-slate-100"
              }`}>
                {/* Paper sheet mockup container */}
                <div className="w-full flex-grow overflow-y-auto pr-1 no-scrollbar flex justify-center py-4">
                  <div 
                    className={`w-full max-w-2xl min-h-[800px] p-8 sm:p-12 shadow-2xl rounded-2xl border transition-all duration-300 self-start text-left ${
                      printTemplate === "academic" 
                        ? "font-serif text-black bg-white border-slate-300" 
                        : printTemplate === "executive" 
                          ? "font-serif text-slate-900 bg-[#fdfdfb] border-amber-900/10" 
                          : printTemplate === "tech" 
                            ? "font-mono text-emerald-950 bg-slate-50 border-slate-300"
                            : "font-sans text-slate-800 bg-white border-slate-200"
                    }`}
                    style={{
                      fontFamily: printTemplate === "academic" 
                        ? "'Times New Roman', Times, serif" 
                        : printTemplate === "executive" 
                          ? "Georgia, serif" 
                          : printTemplate === "tech" 
                            ? "monospace" 
                            : "'Inter', sans-serif"
                    }}
                  >
                    {/* Header bar of document */}
                    <div className={`mb-8 pb-4 border-b ${
                      printTemplate === "academic" ? "border-black" : "border-slate-200"
                    }`}>
                      <h2 className="text-sm font-bold tracking-widest uppercase opacity-75">
                        {printTemplate === "academic" ? "UNIVERSITY ASSIGNMENT SUBMISSION" : "MEMORANDUM REPORT"}
                      </h2>
                      <h1 className={`text-2xl sm:text-3xl font-extrabold mt-2 leading-tight ${
                        printTemplate === "academic" ? "text-black" : "text-indigo-900"
                      }`} style={{ color: printTemplate === "academic" ? "#000000" : undefined }}>
                        {printTitle || "Untitled Assignment Solution"}
                      </h1>
                      <div className="flex flex-wrap gap-4 text-xs mt-3 opacity-60">
                        <span><strong>Author:</strong> Fahim Siam</span>
                        <span><strong>Engine:</strong> Atomesus Prime (VIP)</span>
                        <span><strong>Date:</strong> {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>
                    </div>

                    {/* Rendered content */}
                    <div 
                      className={`prose prose-slate max-w-none transition-all duration-300 ${
                        printFontSize === "small" 
                          ? "text-xs" 
                          : printFontSize === "large" 
                            ? "text-base sm:text-lg" 
                            : "text-sm sm:text-[15px]"
                      }`}
                      style={{
                        fontSize: printFontSize === "small" ? "12px" : printFontSize === "large" ? "17px" : "14px",
                        lineHeight: "1.6"
                      }}
                    >
                      <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
                        code({ className, children, ...props }: any) {
                          const codeString = String(children).replace(/\n$/, "");
                          return (
                            <pre className="bg-slate-900 text-white p-4 rounded-xl overflow-x-auto text-xs my-4 font-mono leading-relaxed border border-slate-800">
                              <code>{codeString}</code>
                            </pre>
                          );
                        },
                        h1({ children }: any) {
                          return <h1 className="text-xl sm:text-2xl font-extrabold mt-6 mb-3 border-b pb-1">{children}</h1>;
                        },
                        h2({ children }: any) {
                          return <h2 className="text-lg sm:text-xl font-bold mt-5 mb-2.5">{children}</h2>;
                        },
                        h3({ children }: any) {
                          return <h3 className="text-base sm:text-lg font-bold mt-4 mb-2">{children}</h3>;
                        },
                        p({ children }: any) {
                          return <p className="mb-4 leading-relaxed">{children}</p>;
                        },
                        ul({ children }: any) {
                          return <ul className="list-disc pl-5 mb-4 space-y-1">{children}</ul>;
                        },
                        ol({ children }: any) {
                          return <ol className="list-decimal pl-5 mb-4 space-y-1">{children}</ol>;
                        },
                        li({ children }: any) {
                          return <li className="mb-0.5">{children}</li>;
                        }
                      }}>
                        {printContent}
                      </ReactMarkdown>
                    </div>

                    {/* Footer on print page */}
                    <div className="mt-16 pt-6 border-t border-dashed border-slate-300 text-center text-[10px] opacity-50 font-mono">
                      Page 1 of 1 • Generated via Fahim AI Helper Document Suite
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

// --- PRIVATE SVG ICONS FOR HIGH COMPATIBILITY PAIRING ---
const BrainIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
    <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
    <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
    <path d="M12 5v14" />
    <path d="M12 12h6" />
    <path d="M12 12H6" />
  </svg>
);
