import React from "react";
import { useTheme } from "../contexts/ThemeContext";

interface UserAvatarProps {
  name?: string;
  src?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export default function UserAvatar({ name = "User", src, size = "md", className = "" }: UserAvatarProps) {
  const { theme } = useTheme();
  
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-16 h-16 text-xl",
    xl: "w-24 h-24 text-3xl"
  };

  const initial = (name && name.length > 0) ? name.charAt(0).toUpperCase() : "U";
  
  // Get background color based on current theme
  const getThemeBgColor = () => {
    switch(theme) {
        case 'red': return 'bg-red-500';
        case 'green': return 'bg-emerald-500';
        case 'blue': return 'bg-blue-500';
        case 'orange': return 'bg-orange-500';
        case 'mix': return 'bg-violet-500';
        default: return 'bg-emerald-500';
    }
  };

  const bgColor = getThemeBgColor();

  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden flex items-center justify-center font-bold text-white shadow-sm border-2 border-white ${bgColor} ${className}`}>
      {src ? (
        <img 
          src={src} 
          alt={name} 
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }} 
        />
      ) : (
        <span>{initial}</span>
      )}
    </div>
  );
}
