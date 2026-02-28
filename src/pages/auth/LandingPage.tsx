import React from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import { motion } from "framer-motion";
import { Globe } from "lucide-react";

export default function LandingPage() {
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex flex-col font-sans overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1920&q=80" 
          alt="Student" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex justify-between items-center p-6">
        <div className="flex items-center gap-2">
           {/* Logo */}
           <div className="flex items-center gap-2">
             <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
               DR
             </div>
             <div className="flex flex-col">
                <span className="text-white font-bold text-xl leading-none">Daily</span>
                <span className="text-white font-light text-sm leading-none">Routine</span>
             </div>
           </div>
        </div>
        
        <button 
            onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-medium hover:bg-white/30 transition-colors"
        >
            <Globe size={16} />
            {language === 'bn' ? 'English' : 'বাংলা'}
        </button>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col justify-end p-6 pb-12 sm:p-10 lg:p-16">
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-xl space-y-6"
        >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight">
                এগিয়ে যাওয়ার যাত্রা <br />
                <span className="text-emerald-400">শুরু এখানেই</span>
            </h1>
            
            <p className="text-gray-200 text-lg sm:text-xl max-w-md">
                দৈনিক লাইভ ক্লাসে অংশ নিয়ে বজায় রাখুন রুটিনমাফিক একাডেমিক পড়াশোনা
            </p>

            <div className="pt-8">
                <button
                    onClick={() => navigate('/auth/email')}
                    className="w-full sm:w-auto min-w-[300px] bg-emerald-600 hover:bg-emerald-700 text-white text-lg font-bold py-4 px-8 rounded-full shadow-lg transform transition active:scale-95 text-center"
                >
                    লগইন করুন / অ্যাকাউন্ট খুলুন
                </button>
            </div>
            
            {/* Pagination Dots (Visual only as per screenshot) */}
            <div className="flex gap-2 mt-8">
                <div className="w-8 h-2 bg-white rounded-full" />
                <div className="w-2 h-2 bg-white/50 rounded-full" />
            </div>
        </motion.div>
      </main>
    </div>
  );
}
