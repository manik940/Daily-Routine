import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import BannerSlider from "../components/BannerSlider";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";
import { CheckSquare, Clock, Target, PlusCircle, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { ref, onValue } from "firebase/database";
import { db } from "../firebase";

export default function Dashboard() {
  const { userData, currentUser } = useAuth();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const navigate = useNavigate();
  
  const [todayRoutine, setTodayRoutine] = useState<any[]>([]);
  const [todayTodos, setTodayTodos] = useState<any[]>([]);
  const [todayGoals, setTodayGoals] = useState<any[]>([]);

  useEffect(() => {
    if (!currentUser) return;

    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = days[new Date().getDay()];
    const dateStr = new Date().toISOString().split('T')[0];

    // Fetch Routine
    const routineRef = ref(db, `routines/${currentUser.uid}/${today}`);
    const unsubRoutine = onValue(routineRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setTodayRoutine(Object.values(data));
      } else {
        setTodayRoutine([]);
      }
    });

    // Fetch Todos
    const todoRef = ref(db, `todos/${currentUser.uid}/${dateStr}`);
    const unsubTodo = onValue(todoRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setTodayTodos(Object.values(data));
      } else {
        setTodayTodos([]);
      }
    });

    // Fetch Goals
    const goalRef = ref(db, `goals/${currentUser.uid}/${dateStr}`);
    const unsubGoal = onValue(goalRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setTodayGoals(Object.values(data));
      } else {
        setTodayGoals([]);
      }
    });

    return () => {
      unsubRoutine();
      unsubTodo();
      unsubGoal();
    };
  }, [currentUser]);

  // Helper to get theme-specific gradient for welcome box
  const getThemeGradient = () => {
    switch(theme) {
        case 'red': return 'from-red-500 to-rose-600';
        case 'green': return 'from-emerald-500 to-teal-600';
        case 'blue': return 'from-blue-500 to-indigo-600';
        case 'orange': return 'from-orange-500 to-amber-600';
        case 'mix': return 'from-violet-500 to-fuchsia-600';
        default: return 'from-emerald-500 to-teal-500';
    }
  };

  // Helper to format date in Bangla
  const getBanglaDate = () => {
    const date = new Date();
    const day = date.getDate();
    const month = date.getMonth();
    const dayOfWeek = date.getDay();

    const banglaMonths = [
        "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
        "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"
    ];
    
    const banglaDays = [
        "রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার"
    ];

    const banglaDigits = (num: number) => {
        return num.toString().replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[parseInt(d)]);
    };

    return `${banglaDigits(day)} শে ${banglaMonths[month]}, ${banglaDays[dayOfWeek]}`;
  };

  const banglaDateString = getBanglaDate();

  return (
    <DashboardLayout>
      {/* Welcome Box */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gradient-to-r ${getThemeGradient()} rounded-2xl p-6 text-white mb-6 shadow-lg relative overflow-hidden`}
      >
        <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-1">
                {t('welcome')}, {userData?.name || "User"}! 👋
            </h2>
            <p className="opacity-90 text-sm">{t('have_productive_day')}</p>
        </div>
        
        {/* Decorative Circles */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-10 -mb-10 blur-xl" />
      </motion.div>

      {/* Banner */}
      <div className="mb-6">
        <BannerSlider />
      </div>

      {/* Quick Access Grid - Square, White, Emoji */}
      <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-sm uppercase tracking-wider opacity-70">
        {t('todays_tasks')}
      </h3>
      
      <div className="grid grid-cols-2 gap-4 mb-8 px-2">
        <SquareEmojiCard 
            to="/today/todo"
            title={t('todays_todo')}
            emoji="📝"
            theme={theme}
        />
        <SquareEmojiCard 
            to="/today/routine"
            title={t('todays_routine')}
            emoji="📅"
            theme={theme}
        />
        <SquareEmojiCard 
            to="/today/goal"
            title={t('todays_goal')}
            emoji="🎯"
            theme={theme}
        />
        <SquareEmojiCard 
            to="/goal/setup"
            title={t('daily_goal_setup')}
            emoji="➕"
            theme={theme}
            isAction={true}
        />
      </div>

    </DashboardLayout>
  );
}

// New Square Emoji Card Component
const SquareEmojiCard = ({ to, title, emoji, theme, isAction }: any) => {
    // Helper to get theme-specific border/text color class
    const getThemeColor = () => {
        switch(theme) {
            case 'red': return 'border-red-100 text-red-600 group-hover:border-red-300';
            case 'green': return 'border-emerald-100 text-emerald-600 group-hover:border-emerald-300';
            case 'blue': return 'border-blue-100 text-blue-600 group-hover:border-blue-300';
            case 'orange': return 'border-orange-100 text-orange-600 group-hover:border-orange-300';
            case 'mix': return 'border-violet-100 text-violet-600 group-hover:border-violet-300';
            default: return 'border-emerald-100 text-emerald-600 group-hover:border-emerald-300';
        }
    };

    return (
        <Link 
            to={to}
            className={`group bg-white aspect-square rounded-2xl shadow-sm border-2 transition-all duration-300 hover:shadow-md active:scale-95 flex flex-col items-center justify-center gap-2 p-3 ${getThemeColor()}`}
        >
            <span className="text-3xl filter drop-shadow-sm group-hover:scale-110 transition-transform duration-300">{emoji}</span>
            
            <div className="text-center w-full">
                <p className="font-bold text-gray-700 text-xs leading-tight mb-0.5">{title}</p>
            </div>
        </Link>
    );
};
