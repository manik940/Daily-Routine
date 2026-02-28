import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ref, push, set, onValue, remove, update } from "firebase/database";
import { db } from "../../firebase";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import DashboardLayout from "../../components/DashboardLayout";
import TapAndHoldButton from "../../components/TapAndHoldButton";
import { Plus, Trash2, Edit2, ChevronRight, ArrowLeft, Copy, Calendar, Clock, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

const DAYS = ["saturday", "sunday", "monday", "tuesday", "wednesday", "thursday", "friday"];

const BANGLA_DAYS: Record<string, string> = {
    saturday: "শনিবার",
    sunday: "রবিবার",
    monday: "সোমবার",
    tuesday: "মঙ্গলবার",
    wednesday: "বুধবার",
    thursday: "বৃহস্পতিবার",
    friday: "শুক্রবার"
};

export default function RoutineSetup() {
  const { currentUser } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  
  const [routines, setRoutines] = useState<any[]>([]);
  const [view, setView] = useState<"list" | "title" | "weekly" | "day_edit" | "preview">("list");
  
  // Create/Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newRoutineTitle, setNewRoutineTitle] = useState("");
  const [routineData, setRoutineData] = useState<any>({});
  
  // Day Edit State
  const [currentDay, setCurrentDay] = useState("");
  const [subjectCount, setSubjectCount] = useState(0);
  const [daySubjects, setDaySubjects] = useState<any[]>([]);
  const [isSameAsPrevious, setIsSameAsPrevious] = useState(false);

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
    setEditingId(null);
    setNewRoutineTitle("");
    setRoutineData({});
    setView("title");
  };

  const handleEdit = (routine: any) => {
    setEditingId(routine.id);
    setNewRoutineTitle(routine.title);
    setRoutineData(routine.days || {});
    setView("title");
  };

  const handleDayClick = (day: string) => {
    setCurrentDay(day);
    const existing = routineData[day] || [];
    setDaySubjects(existing);
    setSubjectCount(existing.length || 0);
    setIsSameAsPrevious(false);
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
    // Validation: Check for empty fields
    const isValid = daySubjects.every(sub => sub.subject.trim() !== "" && sub.startTime !== "" && sub.endTime !== "");
    if (!isValid && daySubjects.length > 0) {
        alert(language === 'bn' ? "দয়া করে সব তথ্য পূরণ করুন" : "Please fill in all fields");
        return;
    }
    setRoutineData({ ...routineData, [currentDay]: daySubjects });
    setView("weekly");
  };

  const handleSameAsPreviousChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsSameAsPrevious(checked);
    if (checked) {
      const currentIndex = DAYS.indexOf(currentDay);
      if (currentIndex > 0) {
          const prevDay = DAYS[currentIndex - 1];
          if (routineData[prevDay]) {
              setDaySubjects(JSON.parse(JSON.stringify(routineData[prevDay])));
              setSubjectCount(routineData[prevDay].length);
          } else {
              alert(language === 'bn' ? "আগের দিনের কোনো রুটিন নেই" : "No routine for previous day");
              setIsSameAsPrevious(false);
          }
      }
    } else {
      setDaySubjects([]);
      setSubjectCount(0);
    }
  };

  const handleSaveRoutine = async () => {
    if (!currentUser) return;
    
    if (editingId) {
        const routineRef = ref(db, `routines/${currentUser.uid}/${editingId}`);
        await update(routineRef, {
            title: newRoutineTitle,
            days: routineData,
            updatedAt: new Date().toISOString()
        });
    } else {
        const newRef = push(ref(db, `routines/${currentUser.uid}`));
        await set(newRef, {
            title: newRoutineTitle,
            days: routineData,
            createdAt: new Date().toISOString()
        });
    }
    setView("list");
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(language === 'bn' ? "আপনি কি নিশ্চিত যে এই রুটিনটি মুছে ফেলতে চান?" : "Are you sure you want to delete this routine?")) {
        await remove(ref(db, `routines/${currentUser?.uid}/${id}`));
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
            <h2 className="text-xl font-bold text-gray-800">{language === 'bn' ? "পড়ার রুটিন" : "Reading Routine"}</h2>
        </div>

        {routines.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl shadow-sm border border-gray-100">
                <div className="bg-emerald-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar size={32} className="text-emerald-500" />
                </div>
                <p className="text-gray-500 font-medium text-lg mb-6">{language === 'bn' ? "কোনো রুটিন তৈরি করা নেই" : "No routine created yet"}</p>
                <button 
                    onClick={handleCreateNew}
                    className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-emerald-700 transition-colors"
                >
                    {language === 'bn' ? "নতুন রুটিন তৈরি করি" : "Create New Routine"}
                </button>
            </div>
        ) : (
            <div className="space-y-4">
                {routines.map(routine => (
                    <div key={routine.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center group hover:border-emerald-200 transition-all">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                                <BookOpen size={20} />
                            </div>
                            <h3 className="font-bold text-gray-800 text-lg">{routine.title}</h3>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => handleEdit(routine)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors">
                                <Edit2 size={18} />
                            </button>
                            <button onClick={() => handleDelete(routine.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
                
                <div className="pt-4">
                    <button 
                        onClick={handleCreateNew}
                        className="w-full bg-emerald-50 text-emerald-700 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-100 transition-colors border border-emerald-200"
                    >
                        <Plus size={20} />
                        {language === 'bn' ? "নতুন রুটিন সেটআপ করুন" : "Setup New Routine"}
                    </button>
                </div>
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
            <h2 className="text-xl font-bold text-gray-800">{language === 'bn' ? "রুটিনের নাম" : "Routine Title"}</h2>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <label className="block text-sm font-bold text-gray-700 mb-3">
                {language === 'bn' ? "আপনার রুটিনের একটি নাম দিন" : "Give your routine a title"}
            </label>
            <input 
                value={newRoutineTitle}
                onChange={(e) => setNewRoutineTitle(e.target.value)}
                placeholder={language === 'bn' ? "যেমন: নবম শ্রেণীর রুটিন" : "Ex: Class 9 Routine"}
                className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-gray-800 bg-gray-50 mb-8"
                autoFocus
            />
            
            <button 
                onClick={() => setView("weekly")}
                disabled={!newRoutineTitle.trim()}
                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:bg-emerald-700 transition-colors flex justify-center items-center gap-2"
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
                <h2 className="text-xl font-bold text-gray-800">{newRoutineTitle}</h2>
                <p className="text-sm text-gray-500">{language === 'bn' ? "সপ্তাহের রুটিন সেটআপ" : "Weekly Routine Setup"}</p>
            </div>
        </div>

        <div className="space-y-3">
            {DAYS.map(day => {
                const hasData = routineData[day]?.length > 0;
                return (
                    <div 
                        key={day}
                        onClick={() => handleDayClick(day)}
                        className={`p-5 rounded-2xl border-2 flex justify-between items-center cursor-pointer transition-all ${
                            hasData 
                            ? "border-emerald-500 bg-emerald-50 shadow-sm" 
                            : "border-gray-100 bg-white hover:border-emerald-200"
                        }`}
                    >
                        <span className={`font-bold text-lg ${hasData ? "text-emerald-800" : "text-gray-700"}`}>
                            {language === 'bn' ? BANGLA_DAYS[day] : day.charAt(0).toUpperCase() + day.slice(1)}
                        </span>
                        <div className="flex items-center gap-3">
                            {hasData && (
                                <span className="text-sm font-bold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">
                                    {routineData[day].length} {language === 'bn' ? "টি বিষয়" : "Subjects"}
                                </span>
                            )}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${hasData ? "bg-emerald-200 text-emerald-700" : "bg-gray-100 text-gray-400"}`}>
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
                disabled={Object.keys(routineData).length === 0}
                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:bg-emerald-700 transition-colors flex justify-center items-center gap-2"
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

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
            <div className="flex justify-between items-center">
                <label className="font-bold text-gray-700">{language === 'bn' ? "বিষয়ের সংখ্যা (১-১০)" : "Number of Subjects (1-10)"}</label>
                <select 
                    value={subjectCount} 
                    onChange={(e) => handleSubjectCountChange(Number(e.target.value))}
                    className="px-4 py-2 rounded-xl border-2 border-emerald-100 bg-emerald-50 text-emerald-800 font-bold focus:outline-none focus:border-emerald-500"
                >
                    <option value={0}>0</option>
                    {[...Array(10)].map((_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
                </select>
            </div>
        </div>

        {DAYS.indexOf(currentDay) > 0 && (
            <div className="flex items-center gap-3 mb-6 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <input 
                    type="checkbox" 
                    id="sameAsPrev"
                    checked={isSameAsPrevious}
                    onChange={handleSameAsPreviousChange}
                    className="w-5 h-5 text-emerald-600 rounded border-emerald-300 focus:ring-emerald-500"
                />
                <label htmlFor="sameAsPrev" className="font-bold text-emerald-800 cursor-pointer select-none">
                    {language === 'bn' ? "আগের দিনের মতো সেম করুন" : "Same as previous day"}
                </label>
            </div>
        )}

        <div className="space-y-4">
            {daySubjects.map((subject, index) => (
                <div key={index} className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-4 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                            {language === 'bn' ? "বিষয়" : "Subject"} {index + 1}
                        </span>
                    </div>
                    
                    <div>
                        <input 
                            placeholder={language === 'bn' ? "বিষয়ের নাম লিখুন..." : "Enter subject name..."}
                            value={subject.subject}
                            onChange={(e) => updateSubject(index, "subject", e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none text-gray-800 bg-gray-50 font-medium"
                        />
                    </div>
                    
                    <div className="flex gap-3">
                        <div className="flex-1">
                            <label className="text-xs font-bold text-gray-500 block mb-1.5 ml-1">{language === 'bn' ? "শুরুর সময়" : "Start Time"}</label>
                            <div className="relative">
                                <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input 
                                    type="time"
                                    value={subject.startTime}
                                    onChange={(e) => updateSubject(index, "startTime", e.target.value)}
                                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none text-gray-800 bg-gray-50 font-medium"
                                />
                            </div>
                        </div>
                        <div className="flex-1">
                            <label className="text-xs font-bold text-gray-500 block mb-1.5 ml-1">{language === 'bn' ? "শেষ সময়" : "End Time"}</label>
                            <div className="relative">
                                <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input 
                                    type="time"
                                    value={subject.endTime}
                                    onChange={(e) => updateSubject(index, "endTime", e.target.value)}
                                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none text-gray-800 bg-gray-50 font-medium"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>

        <div className="fixed bottom-24 left-0 right-0 px-4 z-10">
            <div className="max-w-md mx-auto">
                <button 
                    onClick={saveDay}
                    className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-colors"
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
                <h2 className="text-xl font-bold text-gray-800">{newRoutineTitle}</h2>
                <p className="text-sm text-gray-500">{language === 'bn' ? "পূর্ণ রুটিন প্রিভিউ" : "Full Routine Preview"}</p>
            </div>
        </div>

        <div className="space-y-6">
            {DAYS.map(day => {
                const subjects = routineData[day] || [];
                if (subjects.length === 0) return null;
                
                return (
                    <div key={day} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-emerald-50 px-5 py-3 border-b border-emerald-100">
                            <h3 className="font-bold text-emerald-900 text-lg">
                                {language === 'bn' ? BANGLA_DAYS[day] : day.charAt(0).toUpperCase() + day.slice(1)}
                            </h3>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {subjects.map((sub: any, idx: number) => (
                                <div key={idx} className="p-4 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 font-bold text-sm">
                                            {idx + 1}
                                        </div>
                                        <span className="font-bold text-gray-800 text-lg">{sub.subject}</span>
                                    </div>
                                    <div className="bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 flex items-center gap-1.5">
                                        <Clock size={14} className="text-gray-500" />
                                        <span className="text-sm font-bold text-gray-700">
                                            {formatTime(sub.startTime)} - {formatTime(sub.endTime)}
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
                    onSuccess={handleSaveRoutine} 
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
