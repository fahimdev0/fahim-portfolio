import React from "react";
import { motion } from "motion/react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  glowOnHover?: boolean;
  animate?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  hoverEffect = false,
  glowOnHover = false,
  animate = false,
  ...props
}) => {
  const baseStyle = "rounded-3xl border border-white/[0.04] bg-neutral-900/50 backdrop-blur-xl transition-all duration-300 relative overflow-hidden shadow-xl";
  const hoverStyle = hoverEffect ? "hover:translate-y-[-2px] hover:bg-neutral-900/85 hover:border-white/[0.08]" : "";
  const glowStyle = glowOnHover ? "hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] group" : "";

  if (animate) {
    return (
      <motion.div
        whileHover={hoverEffect ? { y: -2 } : undefined}
        className={`${baseStyle} ${hoverStyle} ${glowStyle} ${className}`}
        {...(props as any)}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={`${baseStyle} ${hoverStyle} ${glowStyle} ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <div className={`p-5 sm:p-6 pb-2 border-b border-white/[0.03] ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <h3 className={`text-base sm:text-lg font-bold tracking-tight text-white ${className}`} {...props}>
      {children}
    </h3>
  );
};

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <p className={`text-xs text-white/50 leading-relaxed mt-1 ${className}`} {...props}>
      {children}
    </p>
  );
};

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <div className={`p-5 sm:p-6 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <div className={`p-5 sm:p-6 pt-2 border-t border-white/[0.03] flex items-center justify-between ${className}`} {...props}>
      {children}
    </div>
  );
};
