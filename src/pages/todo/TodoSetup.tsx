import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ref, push, set, onValue, remove, get, update } from "firebase/database";
import { db } from "../../firebase";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import DashboardLayout from "../../components/DashboardLayout";
import TapAndHoldButton from "../../components/TapAndHoldButton";
import { Plus, Trash2, Edit2, ChevronRight, ArrowLeft, Clock, AlertCircle, CheckSquare, Calendar } from "lucide-react";
import { format, nextDay } from "date-fns";
import { scheduleNotification } from "../../lib/onesignal";

const DAYS = ["saturday", "sunday", "monday", "tuesday", "wednesday", "thursday", "friday"];
const DAY_INDICES: { [key: string]: number } = {
    "sunday": 0, "monday": 1, "tuesday": 2, "wednesday": 3, "thursday": 4, "friday": 5, "saturday": 6
};

const BANGLA_DAYS: Record<string, string> = {
    saturday: "শনিবার",
    sunday: "রবিবার",
    monday: "সোমবার",
    tuesday: "মঙ্গলবার",
    wednesday: "বুধবার",
    thursday: "বৃহস্পতিবার",
    friday: "শুক্রবার"
};

export default function TodoSetup() {
  const { currentUser } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  
  const [todos, setTodos] = useState<any[]>([]);
  const [view, setView] = useState<"list" | "title" | "weekly" | "day_edit" | "preview">("list");
  
  // Create/Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTodoTitle, setNewTodoTitle] = useState("");
  const [todoData, setTodoData] = useState<any>({});
  
  const [currentDay, setCurrentDay] = useState("");
  const [dayTasks, setDayTasks] = useState<any[]>([]);
  const [routineForDay, setRoutineForDay] = useState<any[]>([]);
  const [isSameAsPrevious, setIsSameAsPrevious] = useState(false);

  // Fetch existing To-Do lists
  useEffect(() => {
    if (currentUser) {
      const todosRef = ref(db, `todos/${currentUser.uid}`);
      onValue(todosRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const list = Object.keys(data).map(key => ({ id: key, ...data[key] }));
          setTodos(list);
        } else {
          setTodos([]);
        }
      });
    }
  }, [currentUser]);

  // Fetch Routine for conflict checking
  const fetchRoutineForDay = async (day: string) => {
    if (!currentUser) return;
    const routinesRef = ref(db, `routines/${currentUser.uid}`);
    const snapshot = await get(routinesRef);
    if (snapshot.exists()) {
        const routines = Object.values(snapshot.val()) as any[];
        // Merge all routines for this day (simplified)
        const dayRoutine: any[] = [];
        routines.forEach(r => {
            if (r.days && r.days[day]) {
                dayRoutine.push(...r.days[day]);
            }
        });
        setRoutineForDay(dayRoutine);
    } else {
        setRoutineForDay([]);
    }
  };

  const handleCreateNew = () => {
    setEditingId(null);
    setNewTodoTitle("");
    setTodoData({});
    setView("title");
  };

  const handleEdit = (todo: any) => {
    setEditingId(todo.id);
    setNewTodoTitle(todo.title);
    setTodoData(todo.days || {});
    setView("title");
  };

  const handleDayClick = async (day: string) => {
    setCurrentDay(day);
    await fetchRoutineForDay(day);
    const existing = todoData[day] || [];
    setDayTasks(existing);
    setIsSameAsPrevious(false);
    setView("day_edit");
  };

  const addTask = () => {
    // Auto-calculate start time based on last task or default
    let startTime = "06:00";
    if (dayTasks.length > 0) {
        startTime = dayTasks[dayTasks.length - 1].endTime;
    }
    setDayTasks([...dayTasks, { task: "", startTime, endTime: "" }]);
  };

  const updateTask = (index: number, field: string, value: string) => {
    const newTasks = [...dayTasks];
    newTasks[index] = { ...newTasks[index], [field]: value };
    setDayTasks(newTasks);
  };

  const removeTask = (index: number) => {
    const newTasks = [...dayTasks];
    newTasks.splice(index, 1);
    setDayTasks(newTasks);
  };

  const handleSameAsPreviousChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsSameAsPrevious(checked);
    if (checked) {
      const currentIndex = DAYS.indexOf(currentDay);
      if (currentIndex > 0) {
          const prevDay = DAYS[currentIndex - 1];
          if (todoData[prevDay]) {
              setDayTasks(JSON.parse(JSON.stringify(todoData[prevDay])));
          } else {
              alert(language === 'bn' ? "আগের দিনের কোনো কাজ নেই" : "No tasks for previous day");
              setIsSameAsPrevious(false);
          }
      }
    } else {
      setDayTasks([]);
    }
  };

  const saveDay = () => {
    // Validation: Check for empty fields
    const isValid = dayTasks.every(task => task.task.trim() !== "" && task.startTime !== "" && task.endTime !== "");
    if (!isValid && dayTasks.length > 0) {
        alert(language === 'bn' ? "দয়া করে সব তথ্য পূরণ করুন" : "Please fill in all fields");
        return;
    }
    setTodoData({ ...todoData, [currentDay]: dayTasks });
    setView("weekly");
  };

  const handleSaveTodo = async () => {
    if (!currentUser) return;
    
    if (editingId) {
        const todoRef = ref(db, `todos/${currentUser.uid}/${editingId}`);
        await update(todoRef, {
            title: newTodoTitle,
            days: todoData,
            updatedAt: new Date().toISOString()
        });
    } else {
        const newRef = push(ref(db, `todos/${currentUser.uid}`));
        await set(newRef, {
            title: newTodoTitle,
            days: todoData,
            createdAt: new Date().toISOString()
        });
    }

    // Schedule Notifications
    try {
        const now = new Date();
        Object.keys(todoData).forEach(dayName => {
            const tasks = todoData[dayName];
            const dayIndex = DAY_INDICES[dayName.toLowerCase()];
            
            // Calculate next date for this day
            let nextDate = nextDay(now, dayIndex as any);
            
            tasks.forEach((task: any) => {
                if (task.startTime) {
                    // Combine date and time
                    const dateTimeStr = `${format(nextDate, "yyyy-MM-dd")} ${task.startTime}:00 GMT+0600`; // Assuming Bangladesh Time
                    console.log(`Scheduling for ${currentUser.uid}: ${task.task} at ${dateTimeStr}`);
                    scheduleNotification(currentUser.uid, task.task, dateTimeStr);
                }
            });
        });
    } catch (e) {
        console.error("Notification scheduling error", e);
    }

    setView("list");
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(language === 'bn' ? "আপনি কি নিশ্চিত যে এই টুডু লিস্টটি মুছে ফেলতে চান?" : "Are you sure you want to delete this to-do list?")) {
        await remove(ref(db, `todos/${currentUser?.uid}/${id}`));
    }
  };

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

  // Renderers
  const renderList = () => (
    <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <ArrowLeft size={24} className="text-gray-600" />
            </button>
            <h2 className="text-xl font-bold text-gray-800">{language === 'bn' ? "টুডু লিস্ট" : "To-Do List"}</h2>
        </div>

        {todos.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl shadow-sm border border-gray-100">
                <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckSquare size={32} className="text-blue-500" />
                </div>
                <p className="text-gray-500 font-medium text-lg mb-6">{language === 'bn' ? "কোনো টুডু লিস্ট তৈরি করা নেই" : "No to-do list created yet"}</p>
                <button 
                    onClick={handleCreateNew}
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-blue-700 transition-colors"
                >
                    {language === 'bn' ? "টুডু লিস্ট সেটআপ করি" : "Setup To-Do List"}
                </button>
            </div>
        ) : (
            <div className="space-y-4">
                {todos.map(todo => (
                    <div key={todo.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center group hover:border-blue-200 transition-all">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                <CheckSquare size={20} />
                            </div>
                            <h3 className="font-bold text-gray-800 text-lg">{todo.title}</h3>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => handleEdit(todo)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors">
                                <Edit2 size={18} />
                            </button>
                            <button onClick={() => handleDelete(todo.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
                
                {todos.length === 0 && ( // Only allow one todo list ideally, but keeping button if needed
                    <div className="pt-4">
                        <button 
                            onClick={handleCreateNew}
                            className="w-full bg-blue-50 text-blue-700 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors border border-blue-200"
                        >
                            <Plus size={20} />
                            {language === 'bn' ? "নতুন টুডু লিস্ট সেটআপ করুন" : "Setup New To-Do List"}
                        </button>
                    </div>
                )}
            </div>
        )}
    </div>
  );

  const renderTitle = () => (
    <div className="space-y-6">
        <div className="flex items-center gap-3 mb-8">
            <button onClick={() => setView("list")} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <ArrowLeft size={24} className="text-gray-600" />
            </button>
            <h2 className="text-xl font-bold text-gray-800">{language === 'bn' ? "টুডু লিস্টের নাম" : "To-Do List Title"}</h2>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <label className="block text-sm font-bold text-gray-700 mb-3">
                {language === 'bn' ? "আপনার টুডু লিস্টের একটি নাম দিন" : "Give your to-do list a title"}
            </label>
            <input 
                value={newTodoTitle}
                onChange={(e) => setNewTodoTitle(e.target.value)}
                placeholder={language === 'bn' ? "যেমন: সাপ্তাহিক লক্ষ্য" : "Ex: Weekly Plan"}
                className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-800 bg-gray-50 mb-8"
                autoFocus
            />
            
            <button 
                onClick={() => setView("weekly")}
                disabled={!newTodoTitle.trim()}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:bg-blue-700 transition-colors flex justify-center items-center gap-2"
            >
                {language === 'bn' ? "এগিয়ে যান" : "Next"} <ChevronRight size={20} />
            </button>
        </div>
    </div>
  );

  const renderWeekly = () => (
    <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
            <button onClick={() => setView("title")} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <ArrowLeft size={24} className="text-gray-600" />
            </button>
            <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-800">{newTodoTitle}</h2>
                <p className="text-sm text-gray-500">{language === 'bn' ? "সপ্তাহের টুডু লিস্ট সেটআপ" : "Weekly To-Do Setup"}</p>
            </div>
        </div>

        <div className="space-y-3">
            {DAYS.map(day => {
                const hasData = todoData[day]?.length > 0;
                return (
                    <div 
                        key={day}
                        onClick={() => handleDayClick(day)}
                        className={`p-5 rounded-2xl border-2 flex justify-between items-center cursor-pointer transition-all ${
                            hasData 
                            ? "border-blue-500 bg-blue-50 shadow-sm" 
                            : "border-gray-100 bg-white hover:border-blue-200"
                        }`}
                    >
                        <span className={`font-bold text-lg ${hasData ? "text-blue-800" : "text-gray-700"}`}>
                            {language === 'bn' ? BANGLA_DAYS[day] : day.charAt(0).toUpperCase() + day.slice(1)}
                        </span>
                        <div className="flex items-center gap-3">
                            {hasData && (
                                <span className="text-sm font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                                    {todoData[day].length} {language === 'bn' ? "টি কাজ" : "Tasks"}
                                </span>
                            )}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${hasData ? "bg-blue-200 text-blue-700" : "bg-gray-100 text-gray-400"}`}>
                                <ChevronRight size={18} />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>

        <div className="pt-6">
            <button 
                onClick={() => setView("preview")}
                disabled={Object.keys(todoData).length === 0}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:bg-blue-700 transition-colors flex justify-center items-center gap-2"
            >
                {language === 'bn' ? "এগিয়ে যান" : "Next"} <ChevronRight size={20} />
            </button>
        </div>
    </div>
  );

  const renderDayEdit = () => (
    <div className="space-y-6 pb-24">
        <div className="flex items-center gap-3 mb-6">
            <button onClick={() => setView("weekly")} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <ArrowLeft size={24} className="text-gray-600" />
            </button>
            <h2 className="text-xl font-bold text-gray-800">
                {language === 'bn' ? BANGLA_DAYS[currentDay] : currentDay.charAt(0).toUpperCase() + currentDay.slice(1)}
            </h2>
        </div>

        {/* Routine Warning */}
        {routineForDay.length > 0 && (
            <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 mb-6">
                <p className="font-bold text-orange-800 flex items-center gap-2 mb-2">
                    <AlertCircle size={18}/> 
                    {language === 'bn' ? "পড়ার রুটিনের সময় (এই সময়ে কাজ দেওয়া যাবে না):" : "Routine Times (Blocked):"}
                </p>
                <div className="space-y-1.5 mt-2">
                    {routineForDay.map((r, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-orange-700 bg-orange-100/50 px-3 py-1.5 rounded-lg">
                            <span className="font-semibold">{r.subject}</span>
                            <span className="text-orange-400">•</span>
                            <span>{formatTime(r.startTime)} - {formatTime(r.endTime)}</span>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {DAYS.indexOf(currentDay) > 0 && (
            <div className="flex items-center gap-3 mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <input 
                    type="checkbox" 
                    id="sameAsPrev"
                    checked={isSameAsPrevious}
                    onChange={handleSameAsPreviousChange}
                    className="w-5 h-5 text-blue-600 rounded border-blue-300 focus:ring-blue-500"
                />
                <label htmlFor="sameAsPrev" className="font-bold text-blue-800 cursor-pointer select-none">
                    {language === 'bn' ? "আগের দিনের মতো সেম করুন" : "Same as previous day"}
                </label>
            </div>
        )}

        <div className="space-y-4">
            {dayTasks.map((task, index) => (
                <div key={index} className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-4 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                    <button 
                        onClick={() => removeTask(index)}
                        className="absolute top-4 right-4 text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-full transition-colors"
                    >
                        <Trash2 size={18} />
                    </button>
                    
                    <div className="flex justify-between items-center pr-8">
                        <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                            {language === 'bn' ? "কাজ" : "Task"} {index + 1}
                        </span>
                    </div>
                    
                    <div>
                        <input 
                            placeholder={language === 'bn' ? "কাজের বিবরণ লিখুন..." : "Enter task description..."}
                            value={task.task}
                            onChange={(e) => updateTask(index, "task", e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 bg-gray-50 font-medium"
                        />
                    </div>
                    
                    <div className="flex gap-3">
                        <div className="flex-1">
                            <label className="text-xs font-bold text-gray-500 block mb-1.5 ml-1">{language === 'bn' ? "শুরুর সময়" : "Start Time"}</label>
                            <div className="relative">
                                <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input 
                                    type="time"
                                    value={task.startTime}
                                    onChange={(e) => updateTask(index, "startTime", e.target.value)}
                                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 bg-gray-50 font-medium"
                                />
                            </div>
                        </div>
                        <div className="flex-1">
                            <label className="text-xs font-bold text-gray-500 block mb-1.5 ml-1">{language === 'bn' ? "শেষ সময়" : "End Time"}</label>
                            <div className="relative">
                                <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input 
                                    type="time"
                                    value={task.endTime}
                                    onChange={(e) => updateTask(index, "endTime", e.target.value)}
                                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 bg-gray-50 font-medium"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>

        <button 
            onClick={addTask}
            className="w-full py-4 border-2 border-dashed border-blue-200 rounded-2xl text-blue-600 font-bold hover:bg-blue-50 flex items-center justify-center gap-2 transition-colors mt-4"
        >
            <Plus size={20} /> {language === 'bn' ? "নতুন কাজ যোগ করুন" : "Add New Task"}
        </button>

        <div className="fixed bottom-24 left-0 right-0 px-4 z-10">
            <div className="max-w-md mx-auto">
                <button 
                    onClick={saveDay}
                    className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors"
                >
                    {language === 'bn' ? "সেভ করুন" : "Save Day"}
                </button>
            </div>
        </div>
    </div>
  );

  const renderPreview = () => (
    <div className="space-y-6 pb-32">
        <div className="flex items-center gap-3 mb-6">
            <button onClick={() => setView("weekly")} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <ArrowLeft size={24} className="text-gray-600" />
            </button>
            <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-800">{newTodoTitle}</h2>
                <p className="text-sm text-gray-500">{language === 'bn' ? "পূর্ণ টুডু লিস্ট প্রিভিউ" : "Full To-Do Preview"}</p>
            </div>
        </div>

        <div className="space-y-6">
            {DAYS.map(day => {
                const tasks = todoData[day] || [];
                if (tasks.length === 0) return null;
                
                return (
                    <div key={day} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-blue-50 px-5 py-3 border-b border-blue-100">
                            <h3 className="font-bold text-blue-900 text-lg">
                                {language === 'bn' ? BANGLA_DAYS[day] : day.charAt(0).toUpperCase() + day.slice(1)}
                            </h3>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {tasks.map((task: any, idx: number) => (
                                <div key={idx} className="p-4 flex flex-col gap-2">
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 mt-0.5 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs shrink-0">
                                            {idx + 1}
                                        </div>
                                        <span className="font-bold text-gray-800 text-base leading-snug">{task.task}</span>
                                    </div>
                                    <div className="ml-9 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 flex items-center gap-1.5 self-start">
                                        <Clock size={14} className="text-gray-500" />
                                        <span className="text-sm font-bold text-gray-700">
                                            {formatTime(task.startTime)} - {formatTime(task.endTime)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>

        <div className="fixed bottom-16 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent z-10">
            <div className="max-w-md mx-auto">
                <TapAndHoldButton 
                    onSuccess={handleSaveTodo} 
                    label={language === 'bn' ? "সেটআপ করতে ট্যাপ করে ধরে রাখুন" : "Tap and hold to setup"}
                />
            </div>
        </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="max-w-md mx-auto px-2">
        {view === "list" && renderList()}
        {view === "title" && renderTitle()}
        {view === "weekly" && renderWeekly()}
        {view === "day_edit" && renderDayEdit()}
        {view === "preview" && renderPreview()}
      </div>
    </DashboardLayout>
  );
}
