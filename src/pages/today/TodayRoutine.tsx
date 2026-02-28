import { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../../firebase";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import DashboardLayout from "../../components/DashboardLayout";
import { AlarmClock, BookOpen, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

export default function TodayRoutine() {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const [todaysRoutine, setTodaysRoutine] = useState<any[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});
  const currentDay = DAYS[new Date().getDay()];

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

  // Helper to format time to 12h with English digits
  const formatTime = (time24: string) => {
    if (!time24) return "";
    const [hours, minutes] = time24.split(':');
    let h = parseInt(hours, 10);
    const m = parseInt(minutes, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12; 
    
    return `${h}:${m.toString().padStart(2, '0')} ${ampm}`;
  };

  useEffect(() => {
    if (currentUser) {
      const routinesRef = ref(db, `routines/${currentUser.uid}`);
      onValue(routinesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const list: any[] = [];
          Object.values(data).forEach((routine: any) => {
            if (routine.days && routine.days[currentDay]) {
                list.push({
                    title: routine.title,
                    subjects: routine.days[currentDay]
                });
            }
          });
          setTodaysRoutine(list);
        }
      });
    }
  }, [currentUser, currentDay]);

  const toggleTask = (taskId: string) => {
    setCompletedTasks(prev => ({
        ...prev,
        [taskId]: !prev[taskId]
    }));
  };

  return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto space-y-8 px-2">
        <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-gray-800 tracking-tight capitalize">{t('todays_routine')}</h2>
            <div className="inline-block bg-white px-4 py-1.5 rounded-full shadow-sm border border-gray-100">
                <p className="text-gray-800 font-bold text-lg">{banglaDateString}</p>
            </div>
        </div>
        
        {todaysRoutine.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl shadow-sm border border-gray-100">
                <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen size={32} className="text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium text-lg">{t('no_routine')}</p>
            </div>
        ) : (
            todaysRoutine.map((routine, idx) => (
                <div key={idx} className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100">
                    <div className="bg-gradient-to-r from-emerald-50 to-white p-5 border-b border-emerald-100">
                        <h3 className="font-bold text-xl text-emerald-900">{routine.title}</h3>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {routine.subjects.map((subject: any, sIdx: number) => {
                            const uniqueKey = `${idx}-${sIdx}`;
                            const isCompleted = completedTasks[uniqueKey];
                            
                            return (
                                <div key={sIdx} className="p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start gap-4 flex-1">
                                        <button 
                                            onClick={() => toggleTask(uniqueKey)}
                                            className={`w-7 h-7 mt-1 rounded-lg border-2 flex items-center justify-center transition-all duration-200 shadow-sm shrink-0 ${
                                                isCompleted 
                                                ? "bg-emerald-600 border-emerald-600" 
                                                : "bg-white border-gray-300 hover:border-emerald-500"
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
                                        <div className="flex flex-col">
                                            <span className={`text-lg font-bold text-gray-800 leading-snug transition-all ${isCompleted ? "line-through text-gray-400" : ""}`}>
                                                {subject.subject}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 self-start sm:self-center bg-emerald-50 text-emerald-900 px-3 py-1.5 rounded-lg border border-emerald-100 shrink-0">
                                        <span className="text-lg">⏰</span>
                                        <span className="font-bold text-sm whitespace-nowrap tracking-wide">
                                            {formatTime(subject.startTime)} - {formatTime(subject.endTime)}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))
        )}
      </div>
    </DashboardLayout>
  );
}
