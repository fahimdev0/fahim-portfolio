import React from "react";
import { motion } from "motion/react";

export interface NavigationItem<T extends string = string> {
  id: T;
  label: string;
  icon?: React.ReactNode;
  badge?: string;
}

export interface NavigationProps<T extends string = string> {
  items: NavigationItem<T>[];
  activeId: T;
  onChange: (id: T) => void;
  className?: string;
}

export const Navigation = <T extends string = string>({
  items,
  activeId,
  onChange,
  className = "",
}: NavigationProps<T>) => {
  return (
    <div className={`overflow-x-auto no-scrollbar flex items-center gap-1.5 p-1 bg-[#121214] border border-white/[0.04] rounded-2xl max-w-full shadow-inner select-none ${className}`}>
      {items.map((item) => {
        const isActive = item.id === activeId;
        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={`relative flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold tracking-tight transition-all whitespace-nowrap shrink-0 group cursor-pointer ${
              isActive ? "text-white" : "text-white/40 hover:text-white/80"
            }`}
          >
            {/* Animated active background */}
            {isActive && (
              <motion.div
                layoutId="active-nav-pill"
                className="absolute inset-0 bg-white/[0.03] border border-white/[0.06] rounded-xl shadow-[0_2px_8px_rgba(255,255,255,0.01)]"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}

            <span className="relative z-10 flex items-center gap-2">
              {item.icon && <span className={`w-4 h-4 shrink-0 transition-colors ${isActive ? "text-blue-400" : "text-white/30 group-hover:text-white/50"}`}>{item.icon}</span>}
              <span>{item.label}</span>
              
              {item.badge && (
                <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase shrink-0 transition-colors ${
                  isActive 
                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/20" 
                    : "bg-white/[0.02] text-white/30 border border-white/5 group-hover:text-white/50"
                }`}>
                  {item.badge}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
};
