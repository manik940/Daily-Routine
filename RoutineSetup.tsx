import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ref, push, set, onValue, remove } from "firebase/database";
import { db } from "../../firebase";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import DashboardLayout from "../../components/DashboardLayout";
import TapAndHoldButton from "../../components/TapAndHoldButton";
import { Plus, Trash2, Edit2, ChevronRight, ArrowLeft, Copy } from "lucide-react";
import { motion } from "framer-motion";

const DAYS = ["saturday", "sunday", "monday", "tuesday", "wednesday", "thursday", "friday"];

export default function RoutineSetup() {
  const { userData, currentUser } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [routines, setRoutines] = useState<any[]>([]);
  const [view, setView] = useState<"list" | "create" | "day_edit" | "preview">("list");
  
  // Create State
  const [newRoutineTitle, setNewRoutineTitle] = useState("");
  const [routineData, setRoutineData] = useState<any>({});
  
  // Day Edit State
  const [currentDay, setCurrentDay] = useState("");
  const [subjectCount, setSubjectCount] = useState(0);
  const [daySubjects, setDaySubjects] = useState<any[]>([]);

  useEffect(() => {
    if (currentUser) {
      const routinesRef = ref(db, `routines/${currentUser.uid}`);
      onValue(routinesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const list = Object.keys(data).map(key => ({ id: key, ...data[key] }));
          setRoutines(list);
        } else {
          setRoutines([]);
        }
      });
    }
  }, [currentUser]);

  // Handlers
  const handleCreateNew = () => {
    setNewRoutineTitle("");
    setRoutineData({});
    setView("create");
  };

  const handleDayClick = (day: string) => {
    setCurrentDay(day);
    const existing = routineData[day] || [];
    setDaySubjects(existing);
    setSubjectCount(existing.length || 0);
    setView("day_edit");
  };

  const handleSubjectCountChange = (count: number) => {
    setSubjectCount(count);
    const newSubjects = [...daySubjects];
    if (count > newSubjects.length) {
        for (let i = newSubjects.length; i < count; i++) {
            newSubjects.push({ subject: "", startTime: "", endTime: "" });
        }
    } else {
        newSubjects.splice(count);
    }
    setDaySubjects(newSubjects);
  };

  const updateSubject = (index: number, field: string, value: string) => {
    const newSubjects = [...daySubjects];
    newSubjects[index] = { ...newSubjects[index], [field]: value };
    setDaySubjects(newSubjects);
  };

  const saveDay = () => {
    setRoutineData({ ...routineData, [currentDay]: daySubjects });
    setView("create");
  };

  const copyFromPrevious = () => {
    const currentIndex = DAYS.indexOf(currentDay);
    if (currentIndex > 0) {
        const prevDay = DAYS[currentIndex - 1];
        if (routineData[prevDay]) {
            setDaySubjects([...routineData[prevDay]]);
            setSubjectCount(routineData[prevDay].length);
        }
    }
  };

  const handleSaveRoutine = async () => {
    if (!currentUser) return;
    const newRef = push(ref(db, `routines/${currentUser.uid}`));
    await set(newRef, {
        title: newRoutineTitle,
        days: routineData,
        createdAt: new Date().toISOString()
    });
    setView("list");
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t('delete_confirm'))) {
        await remove(ref(db, `routines/${currentUser?.uid}/${id}`));
    }
  };

  // Renderers
  const renderList = () => (
    <div className="space-y-4">
        {routines.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
                <p>{t('no_routine')}</p>
            </div>
        ) : (
            routines.map(routine => (
                <div key={routine.id} className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center">
                    <h3 className="font-semibold">{routine.title}</h3>
                    <div className="flex gap-2">
                        {/* Edit not fully implemented for brevity, just delete */}
                        <button onClick={() => handleDelete(routine.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-full">
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>
            ))
        )}
        
        <button 
            onClick={handleCreateNew}
            className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-md hover:bg-emerald-700"
        >
            <Plus size={20} />
            {t('create_new_routine')}
        </button>
    </div>
  );

  const renderCreate = () => (
    <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
            <button onClick={() => setView("list")} className="p-2 hover:bg-gray-100 rounded-full">
                <ArrowLeft size={20} />
            </button>
            <h2 className="text-lg font-bold">New Routine</h2>
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Routine Title</label>
            <input 
                value={newRoutineTitle}
                onChange={(e) => setNewRoutineTitle(e.target.value)}
                placeholder="Ex: Class 9 Routine"
                className="w-full px-4 py-2 rounded-lg border border-gray-300"
            />
        </div>

        <div className="space-y-2">
            {DAYS.map(day => (
                <div 
                    key={day}
                    onClick={() => handleDayClick(day)}
                    className={`p-4 rounded-lg border flex justify-between items-center cursor-pointer hover:bg-gray-50 ${
                        routineData[day]?.length > 0 ? "border-emerald-500 bg-emerald-50" : "border-gray-200"
                    }`}
                >
                    <span className="capitalize font-medium">{t(day.substring(0, 3))}</span>
                    <div className="flex items-center gap-2 text-gray-500">
                        <span className="text-xs">{routineData[day]?.length || 0} Subjects</span>
                        <ChevronRight size={18} />
                    </div>
                </div>
            ))}
        </div>

        <button 
            onClick={() => setView("preview")}
            disabled={!newRoutineTitle || Object.keys(routineData).length === 0}
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
            <h2 className="text-lg font-bold capitalize">{t(currentDay.substring(0, 3))} Setup</h2>
        </div>

        <div className="flex justify-between items-center">
            <label className="text-sm font-medium">Total Subjects (1-10)</label>
            <select 
                value={subjectCount} 
                onChange={(e) => handleSubjectCountChange(Number(e.target.value))}
                className="px-3 py-1 rounded border"
            >
                <option value={0}>0</option>
                {[...Array(10)].map((_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
            </select>
        </div>

        {DAYS.indexOf(currentDay) > 0 && (
            <button 
                onClick={copyFromPrevious}
                className="text-sm text-emerald-600 flex items-center gap-1 hover:underline"
            >
                <Copy size={14} />
                {t('same_as')} {t(DAYS[DAYS.indexOf(currentDay) - 1].substring(0, 3))}
            </button>
        )}

        <div className="space-y-4">
            {daySubjects.map((subject, index) => (
                <div key={index} className="p-3 bg-white rounded-lg border border-gray-200 space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-400">#{index + 1}</span>
                    </div>
                    <input 
                        placeholder={t('subject')}
                        value={subject.subject}
                        onChange={(e) => updateSubject(index, "subject", e.target.value)}
                        className="w-full px-3 py-2 rounded border border-gray-300 text-sm"
                    />
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <label className="text-xs text-gray-500 block mb-1">{t('start_time')}</label>
                            <input 
                                type="time"
                                value={subject.startTime}
                                onChange={(e) => updateSubject(index, "startTime", e.target.value)}
                                className="w-full px-2 py-1 rounded border border-gray-300 text-sm"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-xs text-gray-500 block mb-1">{t('end_time')}</label>
                            <input 
                                type="time"
                                value={subject.endTime}
                                onChange={(e) => updateSubject(index, "endTime", e.target.value)}
                                className="w-full px-2 py-1 rounded border border-gray-300 text-sm"
                            />
                        </div>
                    </div>
                </div>
            ))}
        </div>

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
            <h2 className="text-xl font-bold text-center mb-2">{newRoutineTitle}</h2>
            <p className="text-center text-gray-500 text-sm mb-8">Weekly Routine Preview</p>
            
            {/* Simple Preview List */}
            <div className="space-y-2 mb-8 max-h-60 overflow-y-auto border p-4 rounded-lg bg-gray-50">
                {DAYS.map(day => (
                    routineData[day]?.length > 0 && (
                        <div key={day} className="flex justify-between text-sm">
                            <span className="capitalize font-medium">{t(day.substring(0, 3))}</span>
                            <span>{routineData[day].length} Subjects</span>
                        </div>
                    )
                ))}
            </div>
        </div>

        <TapAndHoldButton 
            onSuccess={handleSaveRoutine} 
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
