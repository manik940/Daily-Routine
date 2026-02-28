import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ref, push, set, onValue, remove, get } from "firebase/database";
import { db } from "../../firebase";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import DashboardLayout from "../../components/DashboardLayout";
import TapAndHoldButton from "../../components/TapAndHoldButton";
import { Plus, Trash2, ArrowLeft, Clock, AlertCircle } from "lucide-react";
import { format, nextDay } from "date-fns";
import { scheduleNotification } from "../../lib/onesignal";

const DAYS = ["saturday", "sunday", "monday", "tuesday", "wednesday", "thursday", "friday"];
const DAY_INDICES: { [key: string]: number } = {
    "sunday": 0, "monday": 1, "tuesday": 2, "wednesday": 3, "thursday": 4, "friday": 5, "saturday": 6
};

export default function TodoSetup() {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [todos, setTodos] = useState<any[]>([]);
  const [view, setView] = useState<"list" | "create" | "day_edit" | "preview">("list");
  
  const [newTodoTitle, setNewTodoTitle] = useState("");
  const [todoData, setTodoData] = useState<any>({});
  
  const [currentDay, setCurrentDay] = useState("");
  const [dayTasks, setDayTasks] = useState<any[]>([]);
  const [routineForDay, setRoutineForDay] = useState<any[]>([]);

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
    setNewTodoTitle("");
    setTodoData({});
    setView("create");
  };

  const handleDayClick = async (day: string) => {
    setCurrentDay(day);
    await fetchRoutineForDay(day);
    const existing = todoData[day] || [];
    setDayTasks(existing);
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

  const saveDay = () => {
    setTodoData({ ...todoData, [currentDay]: dayTasks });
    setView("create");
  };

  const handleSaveTodo = async () => {
    if (!currentUser) return;
    const newRef = push(ref(db, `todos/${currentUser.uid}`));
    await set(newRef, {
        title: newTodoTitle,
        days: todoData,
        createdAt: new Date().toISOString()
    });

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
    if (window.confirm(t('delete_confirm'))) {
        await remove(ref(db, `todos/${currentUser?.uid}/${id}`));
    }
  };

  // Renderers
  const renderList = () => (
    <div className="space-y-4">
        {todos.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
                <p>{t('no_todo')}</p>
            </div>
        ) : (
            todos.map(todo => (
                <div key={todo.id} className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center">
                    <h3 className="font-semibold">{todo.title}</h3>
                    <button onClick={() => handleDelete(todo.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-full">
                        <Trash2 size={18} />
                    </button>
                </div>
            ))
        )}
        
        <button 
            onClick={handleCreateNew}
            className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-md hover:bg-emerald-700"
        >
            <Plus size={20} />
            {t('create_new_todo')}
        </button>
    </div>
  );

  const renderCreate = () => (
    <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
            <button onClick={() => setView("list")} className="p-2 hover:bg-gray-100 rounded-full">
                <ArrowLeft size={20} />
            </button>
            <h2 className="text-lg font-bold">New To-Do List</h2>
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">List Title</label>
            <input 
                value={newTodoTitle}
                onChange={(e) => setNewTodoTitle(e.target.value)}
                placeholder="Ex: Weekly Plan"
                className="w-full px-4 py-2 rounded-lg border border-gray-300"
            />
        </div>

        <div className="space-y-2">
            {DAYS.map(day => (
                <div 
                    key={day}
                    onClick={() => handleDayClick(day)}
                    className={`p-4 rounded-lg border flex justify-between items-center cursor-pointer hover:bg-gray-50 ${
                        todoData[day]?.length > 0 ? "border-emerald-500 bg-emerald-50" : "border-gray-200"
                    }`}
                >
                    <span className="capitalize font-medium">{t(day.substring(0, 3))}</span>
                    <div className="flex items-center gap-2 text-gray-500">
                        <span className="text-xs">{todoData[day]?.length || 0} Tasks</span>
                        <Clock size={16} />
                    </div>
                </div>
            ))}
        </div>

        <button 
            onClick={() => setView("preview")}
            disabled={!newTodoTitle || Object.keys(todoData).length === 0}
            className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
            Preview & Save
        </button>
    </div>
  );

  const renderDayEdit = () => (
    <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
            <button onClick={() => setView("create")} className="p-2 hover:bg-gray-100 rounded-full">
                <ArrowLeft size={20} />
            </button>
            <h2 className="text-lg font-bold capitalize">{t(currentDay.substring(0, 3))} Tasks</h2>
        </div>

        {/* Routine Warning */}
        {routineForDay.length > 0 && (
            <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-700 mb-4">
                <p className="font-semibold flex items-center gap-2"><AlertCircle size={16}/> Routine Times (Blocked):</p>
                <ul className="list-disc pl-5 mt-1 text-xs">
                    {routineForDay.map((r, i) => (
                        <li key={i}>{r.subject}: {r.startTime} - {r.endTime}</li>
                    ))}
                </ul>
            </div>
        )}

        <div className="space-y-4">
            {dayTasks.map((task, index) => (
                <div key={index} className="p-3 bg-white rounded-lg border border-gray-200 space-y-3 relative">
                    <button 
                        onClick={() => removeTask(index)}
                        className="absolute top-2 right-2 text-red-400 hover:text-red-600"
                    >
                        <Trash2 size={16} />
                    </button>
                    
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-400">Task #{index + 1}</span>
                    </div>
                    
                    <input 
                        placeholder={t('task_desc')}
                        value={task.task}
                        onChange={(e) => updateTask(index, "task", e.target.value)}
                        className="w-full px-3 py-2 rounded border border-gray-300 text-sm"
                    />
                    
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <label className="text-xs text-gray-500 block mb-1">{t('start_time')}</label>
                            <input 
                                type="time"
                                value={task.startTime}
                                onChange={(e) => updateTask(index, "startTime", e.target.value)}
                                className="w-full px-2 py-1 rounded border border-gray-300 text-sm"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-xs text-gray-500 block mb-1">{t('end_time')}</label>
                            <input 
                                type="time"
                                value={task.endTime}
                                onChange={(e) => updateTask(index, "endTime", e.target.value)}
                                className="w-full px-2 py-1 rounded border border-gray-300 text-sm"
                            />
                        </div>
                    </div>
                </div>
            ))}
        </div>

        <button 
            onClick={addTask}
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-medium hover:bg-gray-50 flex items-center justify-center gap-2"
        >
            <Plus size={20} /> Add Task
        </button>

        <button 
            onClick={saveDay}
            className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold"
        >
            Save Day
        </button>
    </div>
  );

  const renderPreview = () => (
    <div className="space-y-6 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-full">
            <button onClick={() => setView("create")} className="p-2 hover:bg-gray-100 rounded-full mb-4 self-start">
                <ArrowLeft size={20} />
            </button>
            <h2 className="text-xl font-bold text-center mb-2">{newTodoTitle}</h2>
            <p className="text-center text-gray-500 text-sm mb-8">Weekly To-Do Preview</p>
            
            <div className="space-y-2 mb-8 max-h-60 overflow-y-auto border p-4 rounded-lg bg-gray-50">
                {DAYS.map(day => (
                    todoData[day]?.length > 0 && (
                        <div key={day} className="flex justify-between text-sm">
                            <span className="capitalize font-medium">{t(day.substring(0, 3))}</span>
                            <span>{todoData[day].length} Tasks</span>
                        </div>
                    )
                ))}
            </div>
        </div>

        <TapAndHoldButton 
            onSuccess={handleSaveTodo} 
            label={t('tap_hold_setup')}
        />
    </div>
  );

  return (
    <DashboardLayout>
      <div className="max-w-md mx-auto">
        {view === "list" && renderList()}
        {view === "create" && renderCreate()}
        {view === "day_edit" && renderDayEdit()}
        {view === "preview" && renderPreview()}
      </div>
    </DashboardLayout>
  );
}
