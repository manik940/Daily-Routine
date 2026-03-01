import React from "react";
import { motion } from "framer-motion";

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = "Loading..." }: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white">
      {/* Background Subtle Gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 blur-[100px] rounded-full" />
      </div>

      <div className="relative flex flex-col items-center">
        {/* Premium Animation Container */}
        <div className="relative w-20 h-20 mb-10">
          {/* Outer Ring - Slow & Elegant */}
          <motion.div
            className="absolute inset-0 border-[0.5px] border-emerald-500/20 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Middle Ring - Pulsing */}
          <motion.div
            className="absolute inset-3 border-[1px] border-emerald-500/40 rounded-full"
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Inner Core - Dynamic */}
          <div className="absolute inset-6 flex items-center justify-center">
            <motion.div
              className="w-full h-full bg-emerald-500 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.2)]"
              animate={{ 
                scale: [0.8, 1.2, 0.8],
                borderRadius: ["50%", "40%", "50%"]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          {/* Orbiting Dot */}
          <motion.div
            className="absolute -inset-1"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <div className="w-2 h-2 bg-emerald-500 rounded-full absolute top-0 left-1/2 -translate-x-1/2 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
          </motion.div>
        </div>

        {/* Loading Text */}
        <div className="flex flex-col items-center gap-3">
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-emerald-600 font-medium text-xs tracking-[0.4em] uppercase"
          >
            {message}
          </motion.span>
          
          {/* Minimal Progress Line */}
          <div className="w-32 h-[1px] bg-emerald-100 mt-2 overflow-hidden rounded-full">
            <motion.div 
              className="h-full bg-emerald-500"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            />
          </div>
        </div>
      </div>

      {/* Subtle Branding Footer */}
      <div className="absolute bottom-10 flex flex-col items-center gap-1 opacity-40">
        <span className="text-[10px] font-medium text-emerald-900 uppercase tracking-widest">Nexus Core</span>
        <div className="flex gap-2 items-center">
          <div className="w-1 h-1 bg-emerald-500 rounded-full" />
          <span className="text-[8px] font-mono text-emerald-800">v2.4.0-stable</span>
          <div className="w-1 h-1 bg-emerald-500 rounded-full" />
        </div>
      </div>
    </div>
  );
}
