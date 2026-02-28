import { useState, useEffect } from "react";
import { ref, onValue, set, get } from "firebase/database";
import { db } from "../../firebase";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import DashboardLayout from "../../components/DashboardLayout";
import { CheckSquare, AlarmClock, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

export default function TodayTodo() {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const [todaysTasks, setTodaysTasks] = useState<any[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const currentDay = DAYS[new Date().getDay()];
  
  const getLocalTodayStr = () => {
    const date = new Date();
    const offset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - offset);
    return localDate.toISOString().split('T')[0];
  };
  const todayStr = getLocalTodayStr();

  useEffect(() => {
    if (currentUser) {
      const completedRef = ref(db, `completedTasks/${currentUser.uid}/${todayStr}/todo`);
      get(completedRef).then((snapshot) => {
        if (snapshot.exists()) {
          setCompletedTasks(snapshot.val());
        }
        setIsLoaded(true);
      });
    }
  }, [currentUser, todayStr]);

  useEffect(() => {
    if (currentUser && isLoaded) {
      const completedRef = ref(db, `completedTasks/${currentUser.uid}/${todayStr}/todo`);
      set(completedRef, completedTasks);
    }
  }, [completedTasks, currentUser, todayStr, isLoaded]);

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
      const todosRef = ref(db, `todos/${currentUser.uid}`);
      onValue(todosRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const list: any[] = [];
          Object.values(data).forEach((todo: any) => {
            if (todo.days && todo.days[currentDay]) {
                list.push({
                    id: todo.id || Math.random().toString(), // Ensure ID exists or fallback
                    title: todo.title,
                    tasks: todo.days[currentDay]
                });
            }
          });
          setTodaysTasks(list);
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
            <h2 className="text-2xl font-black text-gray-800 tracking-tight capitalize">{t('todays_todo')}</h2>
            <div className="inline-block bg-white px-4 py-1.5 rounded-full shadow-sm border border-gray-100">
                <p className="text-gray-800 font-bold text-lg">{banglaDateString}</p>
            </div>
        </div>
        
        {todaysTasks.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl shadow-sm border border-gray-100">
                <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckSquare size={32} className="text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium text-lg">{t('no_todo')}</p>
            </div>
        ) : (
            todaysTasks.map((todo, idx) => (
                <div key={idx} className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100">
                    <div className="bg-gradient-to-r from-blue-50 to-white p-5 border-b border-blue-100">
                        <h3 className="font-bold text-xl text-blue-900">{todo.title}</h3>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {todo.tasks.map((task: any, tIdx: number) => {
                            const uniqueKey = `${idx}-${tIdx}`;
                            const isCompleted = completedTasks[uniqueKey];
                            
                            return (
                                <div key={tIdx} className="p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start gap-4 flex-1">
                                        <button 
                                            onClick={() => toggleTask(uniqueKey)}
                                            className={`w-7 h-7 mt-1 rounded-lg border-2 flex items-center justify-center transition-all duration-200 shadow-sm shrink-0 ${
                                                isCompleted 
                                                ? "bg-blue-600 border-blue-600" 
                                                : "bg-white border-gray-300 hover:border-blue-500"
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
                                                {task.task}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 self-start sm:self-center bg-blue-50 text-blue-900 px-3 py-1.5 rounded-lg border border-blue-100 shrink-0">
                                        <span className="text-lg">⏰</span>
                                        <span className="font-bold text-sm whitespace-nowrap tracking-wide">
                                            {formatTime(task.startTime)} - {formatTime(task.endTime)}
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
