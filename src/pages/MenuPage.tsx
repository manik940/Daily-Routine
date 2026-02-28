import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { auth } from "../firebase";
import DashboardLayout from "../components/DashboardLayout";
import { 
  User, Settings, Info, BookOpen, LogOut, 
  Calendar, CheckSquare, Target, Home, Grid, ArrowLeft, ChevronRight 
} from "lucide-react";
import UserAvatar from "../components/UserAvatar";

export default function MenuPage() {
  const { userData } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/");
  };

  const menuItems = [
    { emoji: "🏠", label: t("home"), path: '/dashboard', color: "bg-blue-100 text-blue-600" },
    { emoji: "📖", label: t('routine_setup'), path: '/routine/setup', color: "bg-emerald-100 text-emerald-600" },
    { emoji: "📝", label: t('todo_setup'), path: '/todo/setup', color: "bg-purple-100 text-purple-600" },
    { emoji: "🎯", label: t('daily_goal_setup'), path: '/goal/setup', color: "bg-orange-100 text-orange-600" },
    { emoji: "⚙️", label: t('settings'), path: '/settings', color: "bg-gray-100 text-gray-600" },
    { emoji: "👤", label: t('profile'), path: '/profile', color: "bg-pink-100 text-pink-600" },
    { emoji: "ℹ️", label: t('app_info'), path: '/app-info', color: "bg-cyan-100 text-cyan-600" },
    { emoji: "📘", label: t('user_manual'), path: '/user-manual', color: "bg-yellow-100 text-yellow-600" },
    { emoji: "🎧", label: t('help_support'), path: '/help-support', color: "bg-teal-100 text-teal-600" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm px-4 py-3 flex items-center gap-3 sticky top-0 z-20">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
            <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-800">{t("menu")}</h1>
      </header>

      <main className="flex-1 p-4 pb-24 overflow-y-auto">
        {/* Profile Card */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex items-center gap-4 border border-gray-100" onClick={() => navigate('/profile')}>
            <UserAvatar name={userData?.name} src={userData?.photoURL} size="lg" />
            <div className="flex-1">
                <h2 className="font-bold text-lg text-gray-800">{userData?.name || "User"}</h2>
                <p className="text-sm text-gray-500">{userData?.email}</p>
                <p className="text-xs text-emerald-600 font-mono mt-1 font-bold">{userData?.uniqueId || "ID: Loading..."}</p>
            </div>
            <ChevronRight className="text-gray-400" />
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-2 gap-4">
            {menuItems.map((item) => (
                <Link 
                    key={item.path} 
                    to={item.path}
                    className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-3 hover:bg-gray-50 transition-colors active:scale-95"
                >
                    <div className={`w-12 h-12 rounded-full ${item.color} flex items-center justify-center text-2xl`}>
                        {item.emoji}
                    </div>
                    <span className="font-medium text-gray-700 text-center text-sm">{item.label}</span>
                </Link>
            ))}
        </div>

        <button 
            onClick={handleLogout}
            className="w-full mt-8 bg-red-50 text-red-600 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 border border-red-100"
        >
            <LogOut size={20} />
            {t('logout')}
        </button>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2 px-4 z-10 pb-safe">
        <Link 
            to="/dashboard" 
            className="flex flex-col items-center p-2 rounded-lg text-gray-500"
        >
            <Home size={24} />
            <span className="text-xs mt-1">{t("home")}</span>
        </Link>
        <div className="flex flex-col items-center p-2 rounded-lg text-emerald-600">
            <Grid size={24} />
            <span className="text-xs mt-1">{t("menu")}</span>
        </div>
      </nav>
    </div>
  );
}
