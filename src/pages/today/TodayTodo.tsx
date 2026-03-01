import { useState, useEffect } from "react";
import { ref, onValue, set, get } from "firebase/database";
import { db } from "../../firebase";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { parseTime, formatTime, getBanglaDate, getBanglaDigits } from "../../utils/timeUtils";
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
      const storageKey = `completed_todo_${currentUser.uid}_${todayStr}`;
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          setCompletedTasks(JSON.parse(saved));
        }
      } catch (e) {
        console.error("Error loading from localStorage", e);
      }
      setIsLoaded(true);
    }
  }, [currentUser, todayStr]);

  useEffect(() => {
    if (currentUser && isLoaded) {
      const storageKey = `completed_todo_${currentUser.uid}_${todayStr}`;
      localStorage.setItem(storageKey, JSON.stringify(completedTasks));
    }
  }, [completedTasks, currentUser, todayStr, isLoaded]);

  const banglaDateString = getBanglaDate();

  useEffect(() => {
    if (currentUser) {
      const todosRef = ref(db, `todos/${currentUser.uid}`);
      onValue(todosRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const list: any[] = [];
          Object.values(data).forEach((todo: any) => {
            if (todo.days && todo.days[currentDay]) {
                const dayTasks = Array.isArray(todo.days[currentDay])
                  ? todo.days[currentDay]
                  : Object.values(todo.days[currentDay]);
                  
                list.push({
                    id: todo.id || Math.random().toString(), // Ensure ID exists or fallback
                    title: todo.title,
                    tasks: dayTasks.filter(Boolean)
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
                                    <div className="flex items-start gap-3 flex-1">
                                        <div className="w-6 h-6 mt-1 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-sm">
                                            {tIdx + 1}
                                        </div>
                                        <div className="flex flex-col flex-1">
                                            <span className={`text-lg font-bold text-gray-800 leading-snug transition-all ${isCompleted ? "line-through text-gray-400" : ""}`}>
                                                {task.task}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3 self-start sm:self-center shrink-0">
                                        <div className="flex items-center gap-2 bg-blue-50 text-blue-900 px-3 py-1.5 rounded-lg border border-blue-100">
                                            <span className="text-lg">⏰</span>
                                            <span className="font-bold text-sm whitespace-nowrap tracking-wide">
                                                {formatTime(task.startTime)} - {formatTime(task.endTime)}
                                            </span>
                                        </div>
                                        <button 
                                            onClick={() => toggleTask(uniqueKey)}
                                            className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-200 shadow-sm shrink-0 ${
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
                                                        <Check size={14} className="text-white stroke-[3]" />
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </button>
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
