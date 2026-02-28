import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import DashboardLayout from "../../components/DashboardLayout";
import { ref, push, set, onValue, remove } from "firebase/database";
import { db } from "../../firebase";
import { Plus, Trash2, Calendar, CheckCircle2, Edit2, Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format, addDays } from "date-fns";
import toast from "react-hot-toast";

export default function GoalSetup() {
  const { currentUser } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'today' | 'tomorrow'>('today');
  const [goals, setGoals] = useState<any[]>([]);
  const [newGoal, setNewGoal] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  // Calculate dates using local time
  const todayDate = new Date();
  const tomorrowDate = addDays(todayDate, 1);

  const currentDateStr = activeTab === 'today' 
    ? format(todayDate, 'yyyy-MM-dd')
    : format(tomorrowDate, 'yyyy-MM-dd');

  // Helper to format date for display
  const getDisplayDate = (date: Date) => {
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();
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

    return `${banglaDays[dayOfWeek]}, ${banglaDigits(day)} ${banglaMonths[month]} ${banglaDigits(year)}`;
  };

  useEffect(() => {
    if (!currentUser) return;

    const goalsRef = ref(db, `goals/${currentUser.uid}/${currentDateStr}`);
    const unsubscribe = onValue(goalsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Handle both array (legacy) and object (push) structures
        let goalsArray: any[] = [];
        if (Array.isArray(data)) {
            // If it was saved as an array previously (legacy support)
            goalsArray = data.map((text, index) => ({ id: index.toString(), text }));
        } else if (data.items && Array.isArray(data.items)) {
             // Another legacy format check
             goalsArray = data.items.map((text: string, index: number) => ({ id: index.toString(), text }));
        } else {
            // Standard Firebase list object
            goalsArray = Object.entries(data).map(([key, value]: [string, any]) => ({
                id: key,
                text: typeof value === 'string' ? value : value.text
            }));
        }
        setGoals(goalsArray);
      } else {
        setGoals([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser, currentDateStr]);

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.trim()) return;

    const newGoalObj = {
        id: Date.now().toString(),
        text: newGoal,
        completed: false,
        createdAt: new Date().toISOString()
    };

    setGoals([...goals, newGoalObj]);
    setNewGoal("");
  };

  const handleDeleteGoal = (goalId: string) => {
    setGoals(goals.filter(g => g.id !== goalId));
  };

  const startEdit = (goal: any) => {
    setEditingId(goal.id);
    setEditText(goal.text);
  };

  const saveEdit = (goalId: string) => {
    if (!editText.trim()) return;
    setGoals(goals.map(g => g.id === goalId ? { ...g, text: editText } : g));
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const handleUpdateGoals = async () => {
    if (!currentUser) return;
    setLoading(true);
    
    try {
        const goalsRef = ref(db, `goals/${currentUser.uid}/${currentDateStr}`);
        // Convert array to object for Firebase or keep as list
        // Using set to overwrite the entire list for this date ensures sync
        const goalsData = goals.reduce((acc, goal) => {
            acc[goal.id] = {
                text: goal.text,
                completed: goal.completed || false,
                createdAt: goal.createdAt || new Date().toISOString()
            };
            return acc;
        }, {} as Record<string, any>);

        await set(goalsRef, goalsData);
        toast.success(language === 'bn' ? "গোল আপডেট করা হয়েছে!" : "Goals updated successfully!");
        navigate('/dashboard');
    } catch (error) {
        console.error("Error updating goals:", error);
        toast.error(language === 'bn' ? "গোল আপডেট করতে সমস্যা হয়েছে।" : "Failed to update goals.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-md mx-auto px-4 py-2 flex flex-col min-h-[calc(100vh-100px)]">
        {/* Header - Removed back button as requested */}
        <div className="flex items-center justify-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Daily Goal সেটআপ</h2>
        </div>

        {/* Tab Switcher */}
        <div className="bg-gray-100 p-1.5 rounded-2xl flex mb-8 shadow-inner">
            <button 
                onClick={() => setActiveTab('today')}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                    activeTab === 'today' 
                    ? 'bg-white text-emerald-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
            >
                আজকের গোল
            </button>
            <button 
                onClick={() => setActiveTab('tomorrow')}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                    activeTab === 'tomorrow' 
                    ? 'bg-white text-emerald-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
            >
                আগামীকালকের গোল
            </button>
        </div>

        {/* Date Display */}
        <div className="text-center mb-8">
            <div className="inline-block px-4 py-1.5 bg-emerald-50 rounded-full border border-emerald-100 mb-2">
                <p className="font-bold text-emerald-800">
                    {getDisplayDate(activeTab === 'today' ? todayDate : tomorrowDate)}
                </p>
            </div>
            <p className="text-xs text-gray-500 font-medium">
                {activeTab === 'today' ? "আজকের জন্য আপনার লক্ষ্য নির্ধারণ করুন" : "আগামীকালের জন্য আপনার লক্ষ্য নির্ধারণ করুন"}
            </p>
        </div>

        {/* Add Goal Input */}
        <form onSubmit={handleAddGoal} className="mb-8 relative">
            <input 
                type="text" 
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                placeholder="নতুন গোল লিখুন..."
                className="w-full pl-5 pr-14 py-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none shadow-sm text-gray-800 placeholder-gray-400 bg-white"
            />
            <button 
                type="submit"
                disabled={!newGoal.trim()}
                className="absolute right-2 top-2 bottom-2 aspect-square bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white rounded-xl flex items-center justify-center transition-all shadow-sm"
            >
                <Plus size={24} />
            </button>
        </form>

        {/* Goal List */}
        <div className="space-y-3 flex-1 mb-8">
            {goals.map((goal, index) => (
                <div key={goal.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex justify-between items-center shadow-sm group hover:border-emerald-200 transition-all">
                    {editingId === goal.id ? (
                        <div className="flex-1 flex items-center gap-2">
                            <input
                                type="text"
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="flex-1 px-3 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-gray-800"
                                autoFocus
                            />
                            <button onClick={() => saveEdit(goal.id)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors">
                                <Check size={20} />
                            </button>
                            <button onClick={cancelEdit} className="p-2 text-gray-400 hover:bg-gray-50 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-3 flex-1">
                                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm shrink-0">
                                    {index + 1}
                                </div>
                                <span className="text-gray-700 font-medium leading-snug">{goal.text}</span>
                            </div>
                            <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all">
                                <button 
                                    onClick={() => startEdit(goal)}
                                    className="text-gray-400 hover:text-blue-500 p-2 rounded-full hover:bg-blue-50 transition-all"
                                >
                                    <Edit2 size={18} />
                                </button>
                                <button 
                                    onClick={() => handleDeleteGoal(goal.id)}
                                    className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-all"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </>
                    )}
                </div>
            ))}
            
            {goals.length === 0 && !loading && (
                <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50/50">
                    <Calendar size={48} className="mx-auto mb-3 text-gray-300" />
                    <p className="font-medium">কোন গোল সেট করা হয়নি</p>
                </div>
            )}
        </div>

        {/* Publish Button (Normal flow, not fixed) */}
        <div className="mt-auto pb-8">
            <button 
                type="button"
                onClick={handleUpdateGoals}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
                <CheckCircle2 size={20} />
                আপডেট করুন
            </button>
        </div>

      </div>
    </DashboardLayout>
  );
}
