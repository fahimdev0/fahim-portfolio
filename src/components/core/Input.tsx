import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  description?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  className = "",
  label,
  error,
  description,
  leftIcon,
  rightIcon,
  id,
  type = "text",
  ...props
}) => {
  return (
    <div className="w-full flex flex-col gap-1.5 text-left select-none">
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-white/70 tracking-wide">
          {label}
        </label>
      )}
      
      <div className="relative w-full">
        {leftIcon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center text-white/30 shrink-0 select-none">
            {leftIcon}
          </div>
        )}
        
        <input
          id={id}
          type={type}
          className={`w-full bg-neutral-950/70 border ${
            error ? "border-red-500/50 focus:border-red-500/80 focus:ring-red-500/20" : "border-white/[0.06] focus:border-blue-500/60 focus:ring-blue-500/10"
          } text-xs sm:text-sm text-white placeholder-white/20 rounded-xl px-4 py-3 outline-none transition-all focus:ring-4 ${
            leftIcon ? "pl-10" : ""
          } ${rightIcon ? "pr-10" : ""} ${className}`}
          {...props}
        />

        {rightIcon && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center text-white/30 shrink-0 select-none">
            {rightIcon}
          </div>
        )}
      </div>

      {error ? (
        <p className="text-[10px] sm:text-xs text-red-400 font-semibold mt-0.5">{error}</p>
      ) : description ? (
        <p className="text-[10px] sm:text-xs text-white/40 mt-0.5">{description}</p>
      ) : null}
    </div>
  );
};
