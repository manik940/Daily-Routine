import React from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";
import { ArrowLeft, BookOpen, ClipboardList, Target, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export default function SetupMenu() {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const getThemeColor = () => {
    switch(theme) {
      case 'red': return 'text-red-600 bg-red-50 border-red-100';
      case 'green': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'blue': return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'orange': return 'text-orange-600 bg-orange-50 border-orange-100';
      case 'mix': return 'text-violet-600 bg-violet-50 border-violet-100';
      default: return 'text-emerald-600 bg-emerald-50 border-emerald-100';
    }
  };

  const menuItems = [
    {
      title: "পড়ার রুটিন সেটাপ",
      icon: <BookOpen size={24} />,
      path: "/routine/setup",
      colorClass: "text-blue-600"
    },
    {
      title: "To-Do লিস্ট সেটাপ",
      icon: <ClipboardList size={24} />,
      path: "/todo/setup",
      colorClass: "text-emerald-600"
    },
    {
      title: "ডেইলি গোল সেটআপ",
      icon: <Target size={24} />,
      path: "/goal/setup",
      colorClass: "text-rose-600"
    }
  ];

  return (
    <DashboardLayout>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <h2 className="text-2xl font-bold text-gray-800">রুটিন সেটআপ</h2>
        </div>

        {/* Menu Items */}
        <div className="space-y-4">
          {menuItems.map((item, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => navigate(item.path)}
              className="w-full flex items-center justify-between p-5 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all active:scale-[0.98] group"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gray-50 group-hover:scale-110 transition-transform ${item.colorClass}`}>
                  {item.icon}
                </div>
                <span className="font-bold text-gray-700 text-lg">{item.title}</span>
              </div>
              <ChevronRight size={20} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
