import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, Send, Sparkles, Bot, User, Loader2, Plus, ArrowUp, Copy, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

const CopyButton = ({ text }: { text: string }) => {
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
      className="p-1.5 rounded-md bg-white/5 hover:bg-white/10 text-white/50 hover:text-white/80 transition-all flex items-center gap-1.5"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
      <span className="text-xs font-medium">{copied ? "Copied" : "Copy"}</span>
    </button>
  );
};

export const AIHelperApp = ({ onBack }: { onBack: () => void }) => {
  const [messages, setMessages] = useState<{ role: "system" | "user" | "assistant", content: string, id: string }[]>([
    { role: "assistant", content: "Hello! I'm Fahim AI Helper powered by DeepSeek. How can I assist you today?", id: "welcome-msg" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState("deepseek-v4-pro");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg = input.trim();
    setInput("");
    
    // Find textarea to reset height properly after a tick
    setTimeout(() => {
      const ta = document.querySelector('textarea');
      if (ta) ta.style.height = '24px';
    }, 10);
    
    const newUserMsg = { role: "user" as const, content: userMsg, id: Date.now().toString() };
    setMessages(prev => [...prev, newUserMsg]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          systemPrompt: "You are Fahim AI Helper, an advanced intelligent assistant.",
          messages: [
            ...messages.filter(m => m.role !== "system").map(m => ({ role: m.role, content: m.content })),
            { role: "user", content: userMsg }
          ]
        })
      });

      if (!response.ok) {
        let errorData;
        try {
          const raw = await response.text();
          errorData = JSON.parse(raw);
        } catch {
          throw new Error(`API returned error: ${response.status}`);
        }
        throw new Error(errorData?.error?.message || errorData?.error || `API returned error: ${response.status}`);
      }

      const data = await response.json();
      const assistantMsg = data.choices?.[0]?.message?.content || "No response generated.";
      
      setMessages(prev => [...prev, { role: "assistant", content: assistantMsg, id: Date.now().toString() }]);
    } catch (error: any) {
      console.error("AI Helper Error:", error);
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: `Error: Unable to process request. Please check your connection or try again later. (${error.message})`,
        id: Date.now().toString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#09090b] text-white">
      {/* Header */}
      <header className="h-[60px] sm:h-[70px] shrink-0 bg-transparent flex items-center justify-between px-4 sm:px-6 relative z-10 w-full pt-2">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors border border-white/5"
          >
            <ChevronLeft className="w-4 h-4 text-white/70" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
              <Sparkles className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h1 className="font-bold text-sm sm:text-base tracking-tight leading-tight">Fahim AI Helper</h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] sm:text-xs text-white/50 uppercase tracking-wider font-semibold">Online</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto w-full p-4 sm:p-6 space-y-6 scroll-smooth">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div 
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[90%] sm:max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className={`shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border ${
                  msg.role === 'user' 
                    ? 'bg-blue-600/20 border-blue-500/30 text-blue-400' 
                    : 'bg-white/5 border-white/10 text-white/70'
                }`}>
                  {msg.role === 'user' ? <User className="w-4 h-4 sm:w-5 sm:h-5" /> : <Bot className="w-4 h-4 sm:w-5 sm:h-5" />}
                </div>

                {/* Message Bubble */}
                <div className={`p-3.5 sm:p-5 rounded-2xl md:rounded-3xl ${
                  msg.role === 'user'
                    ? 'bg-blue-600 hover:bg-blue-500 transition-colors text-white rounded-tr-sm'
                    : 'bg-[#18181b] border border-white/5 text-white/90 rounded-tl-sm w-full overflow-hidden'
                }`}>
                  {msg.role === 'user' ? (
                     <p className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed break-words font-medium">
                       {msg.content}
                     </p>
                  ) : (
                    <div className="prose prose-invert max-w-none text-sm sm:text-base leading-relaxed font-medium prose-p:leading-relaxed prose-pre:p-0 prose-pre:bg-transparent">
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
                              <div className="relative group rounded-md overflow-hidden bg-[#1e1e1e] my-4 border border-white/10">
                                <div className="flex items-center justify-between px-4 py-2 bg-black/40 border-b border-white/10">
                                  <span className="text-xs font-mono text-white/50">{match?.[1] || 'text'}</span>
                                  <CopyButton text={codeString} />
                                </div>
                                <SyntaxHighlighter
                                  {...props}
                                  style={vscDarkPlus}
                                  language={match ? match[1] : 'text'}
                                  PreTag="div"
                                  className="!m-0 !bg-transparent !p-4 !overflow-x-auto text-sm"
                                  showLineNumbers={true}
                                >
                                  {codeString}
                                </SyntaxHighlighter>
                              </div>
                            ) : (
                              <code {...props} className="bg-white/10 rounded px-1.5 py-0.5 text-sm font-mono text-blue-300">
                                {children}
                              </code>
                            );
                          }
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex w-full justify-start"
          >
            <div className="flex gap-3 max-w-[80%] flex-row">
              <div className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border bg-white/5 border-white/10 text-white/70">
                <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="p-4 sm:p-5 rounded-2xl md:rounded-3xl bg-[#18181b] border border-white/5 rounded-tl-sm flex gap-1.5 items-center">
                <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="shrink-0 w-full p-2 sm:p-4 pb-4 sm:pb-6 bg-[#09090b]">
        <div className="w-full max-w-3xl mx-auto flex items-end bg-[#1e1e20] rounded-[28px] overflow-hidden focus-within:bg-[#2a2a2c] transition-colors pb-0.5">
          <div className="p-2 sm:p-3 shrink-0 flex items-center justify-center mb-0.5">
             <button className="w-10 h-10 rounded-full flex items-center justify-center text-white/70 hover:bg-white/10 transition-colors">
                <Plus className="w-6 h-6" />
             </button>
          </div>
          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              const target = e.target;
              // Use requestAnimationFrame to avoid visual flickering
              requestAnimationFrame(() => {
                target.style.height = '24px'; // Reset to min height to recalculate
                target.style.height = `${Math.min(target.scrollHeight, 150)}px`;
              });
            }}
            onKeyDown={handleKeyDown}
            placeholder="Message..."
            className="w-full max-h-[150px] min-h-[24px] bg-transparent text-white placeholder-white/40 py-3 sm:py-3.5 text-base sm:text-lg outline-none resize-none leading-relaxed overflow-y-auto self-end mt-1"
            rows={1}
            disabled={isLoading}
            style={{ height: '24px', boxSizing: 'content-box' }}
          />
          <div className="p-2 sm:p-3 shrink-0 flex items-center justify-center mb-0.5">
            <button 
              disabled={!input.trim() || isLoading}
              onClick={handleSend}
              className={`w-10 h-10 rounded-full transition-all flex items-center justify-center ${
                input.trim() && !isLoading
                  ? 'bg-[#295ce8] hover:bg-[#204bc4] text-white shadow-md' 
                  : 'bg-transparent text-white/30'
              }`}
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowUp className="w-5 h-5 stroke-[2.5]" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
