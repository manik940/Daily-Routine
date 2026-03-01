import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import BannerSlider from "../components/BannerSlider";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";
import { CheckSquare, Clock, Target, PlusCircle, ChevronRight, AlarmClock } from "lucide-react";
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
    const routineRef = ref(db, `routines/${currentUser.uid}`);
    const unsubRoutine = onValue(routineRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list: any[] = [];
        Object.values(data).forEach((routine: any) => {
          if (routine.days && routine.days[today]) {
            const daySubjects = Array.isArray(routine.days[today]) 
              ? routine.days[today] 
              : Object.values(routine.days[today]);
            list.push(...daySubjects.filter(Boolean));
          }
        });
        setTodayRoutine(list);
      } else {
        setTodayRoutine([]);
      }
    });

    // Fetch Todos
    const todoRef = ref(db, `todos/${currentUser.uid}`);
    const unsubTodo = onValue(todoRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list: any[] = [];
        Object.values(data).forEach((todo: any) => {
          if (todo.days && todo.days[today]) {
            const dayTasks = Array.isArray(todo.days[today]) 
              ? todo.days[today] 
              : Object.values(todo.days[today]);
            list.push(...dayTasks.filter(Boolean));
          }
        });
        setTodayTodos(list);
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

      <CurrentTaskBox todayTodos={todayTodos} todayRoutine={todayRoutine} theme={theme} />

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

// Persistent notification trackers (survive navigation and page reloads)
const getInitialTaskId = () => {
  return localStorage.getItem('lastNotifiedTaskId');
};

const getInitialRoutineIds = () => {
  try {
    const stored = localStorage.getItem('lastNotifiedRoutineIds');
    return stored ? new Set<string>(JSON.parse(stored) as string[]) : new Set<string>();
  } catch (e) {
    return new Set<string>();
  }
};

let lastNotifiedTaskId: string | null = getInitialTaskId();
let lastNotifiedRoutineIds: Set<string> = getInitialRoutineIds();

// Current Task Box Component
const CurrentTaskBox = ({ todayTodos, todayRoutine, theme }: { todayTodos: any[], todayRoutine: any[], theme: string }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifiedTaskId, setNotifiedTaskId] = useState<string | null>(lastNotifiedTaskId);
  const [notifiedRoutineIds, setNotifiedRoutineIds] = useState<Set<string>>(lastNotifiedRoutineIds);

  // Update global trackers and localStorage whenever state changes to persist across navigation and reloads
  useEffect(() => {
    lastNotifiedTaskId = notifiedTaskId;
    if (notifiedTaskId) {
      localStorage.setItem('lastNotifiedTaskId', notifiedTaskId);
    } else {
      localStorage.removeItem('lastNotifiedTaskId');
    }
  }, [notifiedTaskId]);

  useEffect(() => {
    lastNotifiedRoutineIds = notifiedRoutineIds;
    localStorage.setItem('lastNotifiedRoutineIds', JSON.stringify(Array.from(notifiedRoutineIds)));
    
    // Cleanup old routine IDs (older than today) to keep storage clean
    if (notifiedRoutineIds.size > 50) {
      const today = new Date().toDateString();
      const filtered = Array.from(notifiedRoutineIds as Set<string>).filter((id: string) => id.startsWith(today));
      if (filtered.length !== notifiedRoutineIds.size) {
        const newSet = new Set<string>(filtered);
        setNotifiedRoutineIds(newSet);
        lastNotifiedRoutineIds = newSet;
        localStorage.setItem('lastNotifiedRoutineIds', JSON.stringify(filtered));
      }
    }
  }, [notifiedRoutineIds]);

  useEffect(() => {
    // Request notification permission using OneSignal if available, otherwise native
    const requestPermission = async () => {
      try {
        const win = window as any;
        if (win.OneSignalDeferred) {
          win.OneSignalDeferred.push(async (OneSignal: any) => {
            await OneSignal.Notifications.requestPermission();
          });
        } else if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
          await Notification.requestPermission();
        }
      } catch (e) {
        console.warn("Notification permission error:", e);
      }
    };

    requestPermission();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const parseTime = (timeStr: string) => {
    if (!timeStr) return null;
    const [hours, minutes] = timeStr.split(':').map(Number);
    const d = new Date();
    d.setHours(hours, minutes, 0, 0);
    return d;
  };

  // Sort tasks by start time
  const sortedTasks = [...todayTodos].sort((a, b) => {
    const startA = parseTime(a.startTime)?.getTime() || 0;
    const startB = parseTime(b.startTime)?.getTime() || 0;
    return startA - startB;
  });

  const currentTask = sortedTasks.find(task => {
    const start = parseTime(task.startTime);
    const end = parseTime(task.endTime);
    if (!start || !end) return false;
    
    if (end < start) end.setDate(end.getDate() + 1);
    
    const now = currentTime.getTime();
    return now >= start.getTime() && now < end.getTime();
  });

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

  let remainingTimeStr = "";
  let totalDurationStr = "";

  const banglaDigits = (num: number) => num.toString().replace(/\d/g, d => "০১২৩৪৫৬৭৮৯"[parseInt(d)]);
  const padEn = (n: number) => n.toString().padStart(2, '0');
  const toBn = (s: string) => s.replace(/\d/g, d => "০১২৩৪৫৬৭৮৯"[parseInt(d)]);

  if (currentTask) {
    const start = parseTime(currentTask.startTime);
    const end = parseTime(currentTask.endTime);
    if (start && end) {
      if (end < start) end.setDate(end.getDate() + 1);

      const totalMs = end.getTime() - start.getTime();
      const totalMins = Math.floor(totalMs / 60000);
      const hours = Math.floor(totalMins / 60);
      const mins = totalMins % 60;
      
      if (hours > 0 && mins > 0) {
        totalDurationStr = `${banglaDigits(hours)} ঘণ্টা ${banglaDigits(mins)} মিনিট`;
      } else if (hours > 0) {
        totalDurationStr = `${banglaDigits(hours)} ঘণ্টা`;
      } else {
        totalDurationStr = `${banglaDigits(mins)} মিনিট`;
      }
      
      const remainingMs = end.getTime() - currentTime.getTime();
      if (remainingMs > 0) {
        const rHours = Math.floor(remainingMs / 3600000);
        const rMins = Math.floor((remainingMs % 3600000) / 60000);
        const rSecs = Math.floor((remainingMs % 60000) / 1000);
        
        if (rHours > 0) {
          remainingTimeStr = toBn(`${padEn(rHours)}:${padEn(rMins)}:${padEn(rSecs)}`);
        } else {
          remainingTimeStr = toBn(`${padEn(rMins)}:${padEn(rSecs)}`);
        }
      }
    }
  }

  // Study Routine Notification Logic
  useEffect(() => {
    const checkRoutineNotifications = async () => {
      const nowHours = currentTime.getHours();
      const nowMins = currentTime.getMinutes();
      const nowTimeStr = `${nowHours.toString().padStart(2, '0')}:${nowMins.toString().padStart(2, '0')}`;

      todayRoutine.forEach(async (item) => {
        if (item.startTime === nowTimeStr) {
          const dateKey = currentTime.toDateString();
          const routineKey = `${dateKey}-${item.id || item.subject}-${nowTimeStr}`;
          if (!notifiedRoutineIds.has(routineKey)) {
            try {
              if ("Notification" in window && Notification.permission === "granted") {
                const title = `এখন ${item.subject} পড়ার সময়! 📚`;
                const body = `${item.subject} পড়ার সময় হয়ে গেছে! দ্রুত পড়তে বসে যাই! 🏃‍♂️💨 ---------- ${formatTime(item.startTime)} - ${formatTime(item.endTime)}`;
                
                const options: any = {
                  body: body,
                  icon: '/icon.png',
                  badge: '/icon.png',
                  tag: `routine-${routineKey}`,
                  renotify: true,
                  requireInteraction: true
                };

                if ("serviceWorker" in navigator) {
                  const registration = await navigator.serviceWorker.ready;
                  registration.showNotification(title, options);
                } else {
                  new Notification(title, options);
                }
                
                setNotifiedRoutineIds(prev => new Set(prev).add(routineKey));
              }
            } catch (e) {
              console.warn("Routine notification error:", e);
            }
          }
        }
      });
    };

    checkRoutineNotifications();
  }, [currentTime.getMinutes(), todayRoutine, notifiedRoutineIds]);

  // Notification Logic for Current Task
  useEffect(() => {
    const closeNotification = async () => {
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.ready;
        const notifications = await registration.getNotifications({ tag: 'current-task-notification' });
        notifications.forEach(n => n.close());
      }
    };

    if (!currentTask || todayTodos.length === 0) {
      closeNotification();
      if (notifiedTaskId !== null) {
        setNotifiedTaskId(null);
      }
      return;
    }

    const triggerNotification = async () => {
      try {
        if ("Notification" in window && Notification.permission === "granted") {
          const title = "এই সময়ের কাজ 🕒";
          const body = `কাজ: ${currentTask.task}\n` +
                       `সময়সীমা: ${formatTime(currentTask.startTime)} - ${formatTime(currentTask.endTime)}\n` +
                       `মোট সময়: ${totalDurationStr}`;
          
          const options: any = {
            body: body,
            tag: 'current-task-notification',
            renotify: false,
            icon: '/icon.png',
            badge: '/icon.png',
            silent: true,
            dir: 'auto',
            requireInteraction: true
          };

          // If it's a new task, make it loud and renotify
          if (currentTask.id !== notifiedTaskId) {
            options.silent = false;
            options.renotify = true;
            setNotifiedTaskId(currentTask.id);
            
            // Use service worker to show notification
            if ("serviceWorker" in navigator) {
              const registration = await navigator.serviceWorker.ready;
              registration.showNotification(title, options);
            } else {
              new Notification(title, options);
            }
          }
        }
      } catch (e) {
        console.warn("Notification trigger error:", e);
      }
    };

    triggerNotification();
  }, [currentTask?.id, totalDurationStr, notifiedTaskId, todayTodos.length]);

  return (
    <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm border border-gray-100 relative overflow-hidden">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-gray-800 flex items-center gap-2 text-lg">
          এই সময়ের কাজ 🎯
        </h3>
        {currentTask && (
          <div className="flex items-center gap-1.5 bg-red-50 text-red-600 px-3 py-1 rounded-full border border-red-100">
            <span className="text-sm animate-pulse">⏰</span>
            <span className="font-mono font-bold text-sm tracking-wider">{remainingTimeStr}</span>
          </div>
        )}
      </div>

      {todayTodos.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <p className="text-gray-500 font-medium mb-3">প্রথমে টুডু লিস্ট তৈরি করুন</p>
          <Link to="/todo/setup" className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm inline-block shadow-md hover:bg-blue-700 transition-colors">
            টুডু লিস্ট সেটআপ করুন
          </Link>
        </div>
      ) : currentTask ? (
        <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
          <p className="font-bold text-gray-800 text-lg mb-2 leading-snug">{currentTask.task}</p>
          <div className="flex justify-between items-end mt-4">
            <div className="flex items-center gap-1.5 text-blue-700 bg-blue-100/50 px-2.5 py-1 rounded-lg">
              <Clock size={14} />
              <span className="text-sm font-bold">
                {formatTime(currentTask.startTime)} - {formatTime(currentTask.endTime)}
              </span>
            </div>
            <div className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">
              মোট: {totalDurationStr}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <p className="text-gray-500 font-medium">এই সময়ে কোনো কাজ নেই</p>
        </div>
      )}
    </div>
  );
};

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
            
            <div className="text-center w-full px-1">
                <p className="font-bold text-gray-700 text-sm sm:text-base leading-tight mb-0.5">{title}</p>
            </div>
        </Link>
    );
};
