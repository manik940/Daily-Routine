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
    <DashboardLayout>
      <div className="max-w-md mx-auto">
        {/* Profile Card */}
        <div className="bg-white p-4 rounded-2xl shadow-sm mb-6 flex items-center gap-4 border border-gray-100" onClick={() => navigate('/profile')}>
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
                    className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-3 hover:bg-gray-50 transition-colors active:scale-95"
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
            className="w-full mt-8 bg-red-50 text-red-600 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 border border-red-100"
        >
            <LogOut size={20} />
            {t('logout')}
        </button>
      </div>
    </DashboardLayout>
  );
}
