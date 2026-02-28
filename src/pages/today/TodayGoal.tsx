import { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../../firebase";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import DashboardLayout from "../../components/DashboardLayout";
import { format } from "date-fns";
import { Target, CheckCircle2, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function TodayGoal() {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const [goals, setGoals] = useState<string[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Record<number, boolean>>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const today = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    if (currentUser) {
      const storageKey = `completedTasks_${currentUser.uid}_${today}_goal`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          setCompletedTasks(JSON.parse(saved));
        } catch (e) {}
      }
      setIsLoaded(true);
    }
  }, [currentUser, today]);

  useEffect(() => {
    if (currentUser && isLoaded) {
      const storageKey = `completedTasks_${currentUser.uid}_${today}_goal`;
      localStorage.setItem(storageKey, JSON.stringify(completedTasks));
    }
  }, [completedTasks, currentUser, today, isLoaded]);

  // Helper to format date in Bangla: "Day, Date Month Year"
  const getBanglaDate = () => {
    const date = new Date();
    const day = date.getDate();
    const month = date.getMonth();
    const dayOfWeek = date.getDay();
    const year = date.getFullYear();

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

    return `${banglaDays[dayOfWeek]}, ${banglaDigits(day)} ${banglaMonths[month]} ${banglaDigits(year)}`;
  };

  const banglaDateString = getBanglaDate();

  useEffect(() => {
    if (currentUser) {
      const goalRef = ref(db, `goals/${currentUser.uid}/${today}`);
      onValue(goalRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          // Handle both array (legacy) and object (push) structures
          let goalsArray: string[] = [];
          
          if (Array.isArray(data)) {
            // Legacy array format
            goalsArray = data;
          } else if (data.items && Array.isArray(data.items)) {
            // Another legacy format
            goalsArray = data.items;
          } else {
            // Standard Firebase list object (new format)
            // Extract just the 'text' property from each goal object
            goalsArray = Object.values(data).map((g: any) => 
                typeof g === 'string' ? g : g.text
            );
          }
          
          setGoals(goalsArray);
        } else {
          setGoals([]);
        }
      });
    }
  }, [currentUser, today]);

  const toggleTask = (idx: number) => {
    setCompletedTasks(prev => ({
        ...prev,
        [idx]: !prev[idx]
    }));
  };

  return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto space-y-8 px-2">
        <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-gray-800 tracking-tight">{t('todays_goal')}</h2>
            <div className="inline-block bg-white px-4 py-1.5 rounded-full shadow-sm border border-gray-100">
                <p className="text-gray-800 font-bold text-lg">{banglaDateString}</p>
            </div>
        </div>
        
        {goals.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl shadow-sm border border-gray-100">
                <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target size={32} className="text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium text-lg">{t('no_goal')}</p>
                <p className="text-sm mt-2 text-emerald-600 font-semibold">{t('please_setup')}</p>
            </div>
        ) : (
            <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100">
                <div className="bg-gradient-to-r from-orange-50 to-white p-5 border-b border-orange-100">
                    <h3 className="font-bold text-xl text-orange-900 flex items-center gap-2">
                        <Target size={20} />
                        {t('todays_tasks')}
                    </h3>
                </div>
                
                <div className="divide-y divide-gray-100">
                    {goals.map((goal, idx) => {
                        const isCompleted = completedTasks[idx];
                        return (
                            <div key={idx} className="p-5 flex items-start gap-4 hover:bg-gray-50 transition-colors">
                                <button 
                                    onClick={() => toggleTask(idx)}
                                    className={`w-7 h-7 mt-1 rounded-lg border-2 flex items-center justify-center transition-all duration-200 shadow-sm shrink-0 ${
                                        isCompleted 
                                        ? "bg-orange-500 border-orange-500" 
                                        : "bg-white border-gray-300 hover:border-orange-500"
                                    }`}
                                >
                                    <AnimatePresence>
                                        {isCompleted && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                exit={{ scale: 0 }}
                                            >
                                                <Check size={18} className="text-white stroke-[3]" />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </button>
                                <div className="flex-1 pt-0.5">
                                    <span className={`text-lg font-bold text-gray-800 leading-snug transition-all ${isCompleted ? "line-through text-gray-400" : ""}`}>
                                        {goal}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
                
                <div className="p-4 bg-orange-50 border-t border-orange-100 flex justify-center">
                    <div className="flex items-center gap-2 text-orange-700 text-sm font-bold bg-white px-4 py-1.5 rounded-full shadow-sm border border-orange-100">
                        <CheckCircle2 size={16} />
                        <span>Stay Focused!</span>
                    </div>
                </div>
            </div>
        )}
      </div>
    </DashboardLayout>
  );
}
