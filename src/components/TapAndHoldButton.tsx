import { useState, useRef, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { Send } from "lucide-react";

interface TapAndHoldButtonProps {
  onSuccess: () => void;
  label?: string;
}

export default function TapAndHoldButton({ onSuccess, label = "Tap and Hold" }: TapAndHoldButtonProps) {
  const [isHolding, setIsHolding] = useState(false);
  const controls = useAnimation();
  const progressRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startHolding = () => {
    setIsHolding(true);
    progressRef.current = 0;
    
    intervalRef.current = setInterval(() => {
      progressRef.current += 2; // Speed of fill
      if (progressRef.current >= 100) {
        complete();
      } else {
        controls.set({
            background: `conic-gradient(#10b981 ${progressRef.current}%, transparent 0)`
        });
      }
    }, 20);
  };

  const stopHolding = () => {
    setIsHolding(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    progressRef.current = 0;
    controls.start({ background: `conic-gradient(#10b981 0%, transparent 0)` });
  };

  const complete = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsHolding(false);
    onSuccess();
  };

  return (
    <div className="flex flex-col items-center gap-4 select-none">
      <div 
        className="relative w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer shadow-inner active:scale-95 transition-transform"
        onMouseDown={startHolding}
        onMouseUp={stopHolding}
        onMouseLeave={stopHolding}
        onTouchStart={startHolding}
        onTouchEnd={stopHolding}
      >
        {/* Progress Ring */}
        <motion.div 
            animate={controls}
            className="absolute inset-0 rounded-full"
            style={{ 
                background: `conic-gradient(#10b981 0%, transparent 0)`,
                maskImage: 'radial-gradient(transparent 60%, black 61%)',
                WebkitMaskImage: 'radial-gradient(transparent 60%, black 61%)'
            }}
        />
        
        {/* Icon */}
        <div className="z-10 bg-white w-16 h-16 rounded-full flex items-center justify-center shadow-sm text-emerald-600">
            <Send size={24} className={isHolding ? "animate-pulse" : ""} />
        </div>
      </div>
      <p className="text-sm text-gray-500 font-medium animate-pulse">{label}</p>
    </div>
  );
}
