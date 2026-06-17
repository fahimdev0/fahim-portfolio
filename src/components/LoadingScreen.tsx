/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { Tv } from "lucide-react";

interface LoadingScreenProps {
  title?: string;
  subtitle?: string;
  icon?: any;
  glowColor?: string;
  iconBgColor?: string;
}

export const LoadingScreen = ({
  title = "Fahim IPTV",
  subtitle = "Loading your streaming experience...",
  icon: IconComponent = Tv,
  glowColor = "bg-blue-600/20",
  iconBgColor = "bg-blue-500"
}: LoadingScreenProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center"
    >
      {/* Background Atmosphere */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] ${glowColor} rounded-full blur-[140px]`} />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={`w-24 h-24 rounded-3xl ${iconBgColor} flex items-center justify-center shadow-2xl shadow-blue-500/30 mb-8`}
        >
          <IconComponent className="w-12 h-12 text-white" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center px-4"
        >
          <h2 className="font-display font-bold text-3xl mb-2 tracking-tight">{title}</h2>
          <p className="text-white/40 text-sm font-medium tracking-wide">{subtitle}</p>
        </motion.div>

        <div className="mt-12 w-48 h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-full h-full bg-gradient-to-r from-transparent via-blue-500 to-transparent"
          />
        </div>
      </div>
    </motion.div>
  );
};
