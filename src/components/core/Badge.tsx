import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "purple" | "emerald";
  glow?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className = "",
  variant = "default",
  glow = false,
  ...props
}) => {
  const baseStyle = "inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] md:text-xs font-mono font-bold tracking-wider uppercase rounded-lg border select-none transition-all";
  
  const variants = {
    default: "bg-white/[0.02] border-white/5 text-white/50",
    success: "bg-emerald-500/5 border-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.05)]",
    warning: "bg-amber-500/5 border-amber-500/20 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.05)]",
    danger: "bg-red-500/5 border-red-500/20 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.05)]",
    info: "bg-blue-500/5 border-blue-500/20 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.05)]",
    purple: "bg-purple-500/5 border-purple-500/20 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.05)]",
    emerald: "bg-emerald-500/5 border-emerald-500/20 text-[#a3e635] shadow-[0_0_15px_rgba(163,230,53,0.05)]",
  };

  const glowStyle = glow ? "relative after:absolute after:inset-0 after:rounded-lg after:bg-current after:opacity-[0.03] after:blur-sm" : "";

  return (
    <span
      className={`${baseStyle} ${variants[variant]} ${glowStyle} ${className}`}
      {...props}
    >
      {variant === "success" && <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse shrink-0" />}
      {variant === "warning" && <span className="w-1 h-1 rounded-full bg-amber-400 shrink-0" />}
      {variant === "danger" && <span className="w-1 h-1 rounded-full bg-red-400 shrink-0" />}
      <span>{children}</span>
    </span>
  );
};
