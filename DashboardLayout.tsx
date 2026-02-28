import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";
import { auth } from "../firebase";
import { 
  Menu, X, User, Settings, Info, BookOpen, LogOut, 
  Calendar, CheckSquare, Target, Home, Grid, ArrowLeft 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import UserAvatar from "./UserAvatar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userData } = useAuth();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/");
  };

  const isDashboard = location.pathname === '/dashboard';

  // Helper to get theme-specific text color class
  const getThemeTextColor = () => {
    switch(theme) {
        case 'red': return 'text-red-600';
        case 'green': return 'text-emerald-600';
        case 'blue': return 'text-blue-600';
        case 'orange': return 'text-orange-600';
        case 'mix': return 'text-violet-600';
        default: return 'text-emerald-600';
    }
  };

  // Helper to get theme-specific bg color class
  const getThemeBgColor = () => {
    switch(theme) {
        case 'red': return 'bg-red-600';
        case 'green': return 'bg-emerald-600';
        case 'blue': return 'bg-blue-600';
        case 'orange': return 'bg-orange-600';
        case 'mix': return 'bg-violet-600';
        default: return 'bg-emerald-600';
    }
  };

  const menuItems = [
    { emoji: "📖", label: t("routine_setup"), path: '/routine/setup' },
    { emoji: "📝", label: t("todo_setup"), path: '/todo/setup' },
    { emoji: "🎯", label: t("daily_goal_setup"), path: '/goal/setup' },
    { emoji: "⚙️", label: t("settings"), path: '/settings' },
    { emoji: "👤", label: t("profile"), path: '/profile' },
    { emoji: "ℹ️", label: t("app_info"), path: '/app-info' },
    { emoji: "📘", label: t("user_manual"), path: '/user-manual' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header - Only show on Dashboard */}
      {isDashboard && (
        <header className="bg-white shadow-sm px-4 py-3 flex justify-between items-center sticky top-0 z-20">
            {/* Left: Menu Button */}
            <div className="w-10 flex justify-start">
                <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-gray-100 rounded-full">
                    <Menu size={24} className="text-gray-700" />
                </button>
            </div>

            {/* Center: Title */}
            <h1 className={`text-xl font-bold text-center ${getThemeTextColor()}`}>{t('app_name')}</h1>
            
            {/* Right: Profile */}
            <div className="w-10 flex justify-end">
                <Link to="/profile">
                    <UserAvatar name={userData?.name} src={userData?.photoURL} size="md" />
                </Link>
            </div>
        </header>
      )}

      {/* Sidebar / Menu Modal */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black z-40"
            />
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-full w-[85%] max-w-sm bg-white z-50 shadow-2xl overflow-y-auto rounded-r-2xl"
            >
              {/* Menu Header */}
              <div className={`${getThemeBgColor()} p-6 text-white`}>
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl font-bold">{t("menu")}</h2>
                    <button onClick={() => setIsSidebarOpen(false)} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                        <X size={24} className="text-white" />
                    </button>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="bg-white p-0.5 rounded-full">
                        <UserAvatar name={userData?.name} src={userData?.photoURL} size="lg" />
                    </div>
                    <div>
                        <p className="font-bold text-lg leading-tight">{userData?.name || "User Name"}</p>
                        <p className="text-sm opacity-90">{userData?.email || "user@example.com"}</p>
                    </div>
                </div>
              </div>
              
              {/* Menu Items */}
              <nav className="p-4 space-y-1">
                {menuItems.map((item) => (
                  <Link 
                    key={item.path} 
                    to={item.path}
                    onClick={() => setIsSidebarOpen(false)}
                    className="flex items-center gap-4 px-4 py-4 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                  >
                    <span className="text-xl w-[22px] flex justify-center">{item.emoji}</span>
                    <span className="font-medium text-base">{item.label}</span>
                  </Link>
                ))}
                
                <div className="h-px bg-gray-100 my-2 mx-4"></div>

                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 px-4 py-4 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <LogOut size={22} />
                  <span className="font-medium text-base">{t('logout')}</span>
                </button>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 p-4 pb-20 overflow-y-auto relative">
        {/* Back Button inside Content Area (Not on Dashboard) */}
        {!isDashboard && (
            <button 
                onClick={() => navigate(-1)} 
                className={`mb-4 p-2 rounded-full hover:bg-gray-100 inline-flex items-center gap-2 font-medium transition-colors ${getThemeTextColor()}`}
            >
                <ArrowLeft size={20} />
                <span>{t("back")}</span>
            </button>
        )}
        {children}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2 px-4 z-10 pb-safe">
        <Link 
            to="/dashboard" 
            className={`flex flex-col items-center p-2 rounded-lg ${
                isDashboard ? getThemeTextColor() : 'text-gray-500'
            }`}
        >
            <Home size={24} />
            <span className="text-xs mt-1">{t("home")}</span>
        </Link>
        <Link 
            to="/menu"
            className="flex flex-col items-center p-2 rounded-lg text-gray-500"
        >
            <Grid size={24} />
            <span className="text-xs mt-1">{t("menu")}</span>
        </Link>
      </nav>
    </div>
  );
}
