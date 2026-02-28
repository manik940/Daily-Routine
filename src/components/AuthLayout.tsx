import React from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show back button on Landing Page (which uses this layout implicitly or explicitly? LandingPage uses it? No, LandingPage has its own structure in previous turn. 
  // Wait, LandingPage was updated to NOT use AuthLayout in the previous turn.
  // So this is for Email, Password, Register, ForgotPassword.
  
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      {/* Header */}
      <header className="flex justify-between items-center px-4 py-4 md:px-8 border-b border-gray-100 relative">
        <div className="flex items-center gap-2">
           <button 
             onClick={() => navigate(-1)}
             className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
           >
             <ArrowLeft size={24} />
           </button>
           {/* Logo Placeholder - Text based as requested */}
           <h1 className="text-xl font-bold text-emerald-600 tracking-tight">Daily Routine</h1>
        </div>
        
        <div className="flex items-center gap-2">
            <button 
                onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
                className="px-3 py-1 rounded-full border border-gray-300 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
                {language === 'bn' ? 'English' : 'বাংলা'}
            </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  );
}
