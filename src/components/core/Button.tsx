import React from "react";
import { motion } from "motion/react";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "success" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  animate?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className = "",
  variant = "primary",
  size = "md",
  loading = false,
  leftIcon,
  rightIcon,
  disabled,
  animate = true,
  ...props
}) => {
  const baseStyle = "inline-flex items-center justify-center font-display font-bold rounded-xl transition-all outline-none select-none active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 gap-2";
  
  const variants = {
    primary: "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white shadow-[0_4px_12px_rgba(0,122,255,0.3)] hover:shadow-[0_6px_18px_rgba(0,122,255,0.45)] border border-blue-500/10",
    secondary: "border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white/90",
    danger: "bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 hover:text-red-300",
    success: "bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300",
    ghost: "text-white/60 hover:text-white hover:bg-white/5"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4.5 py-2.5 text-xs sm:text-sm",
    lg: "px-6 py-3.5 text-sm sm:text-base rounded-2xl"
  };

  const buttonContent = (
    <>
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        leftIcon && <span className="flex items-center shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!loading && rightIcon && <span className="flex items-center shrink-0">{rightIcon}</span>}
    </>
  );

  if (animate) {
    return (
      <motion.button
        whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
        disabled={disabled || loading}
        className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
        {...(props as any)}
      >
        {buttonContent}
      </motion.button>
    );
  }

  return (
    <button
      disabled={disabled || loading}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {buttonContent}
    </button>
  );
};
