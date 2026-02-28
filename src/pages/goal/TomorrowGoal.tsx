import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ref, set, onValue } from "firebase/database";
import { db } from "../../firebase";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import DashboardLayout from "../../components/DashboardLayout";
import { Plus, Trash2, Calendar as CalendarIcon } from "lucide-react";
import { format, addDays } from "date-fns";

export default function TomorrowGoal() {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const tomorrow = format(addDays(new Date(), 1), "yyyy-MM-dd");
  const [goals, setGoals] = useState<string[]>([""]);

  useEffect(() => {
    if (currentUser) {
      const goalRef = ref(db, `goals/${currentUser.uid}/${tomorrow}`);
      onValue(goalRef, (snapshot) => {
        if (snapshot.exists()) {
          setGoals(snapshot.val().items || [""]);
        }
      });
    }
  }, [currentUser, tomorrow]);

  const handleAddGoalInput = () => {
    setGoals([...goals, ""]);
  };

  const updateGoal = (index: number, value: string) => {
    const newGoals = [...goals];
    newGoals[index] = value;
    setGoals(newGoals);
  };

  const removeGoal = (index: number) => {
    const newGoals = [...goals];
    newGoals.splice(index, 1);
    setGoals(newGoals);
  };

  const handlePublish = async () => {
    if (!currentUser) return;
    const validGoals = goals.filter(g => g.trim() !== "");
    if (validGoals.length === 0) return;

    await set(ref(db, `goals/${currentUser.uid}/${tomorrow}`), {
        date: tomorrow,
        items: validGoals,
        createdAt: new Date().toISOString()
    });
    
    alert(t('success'));
    navigate("/dashboard");
  };

  return (
    <DashboardLayout>
      <div className="max-w-md mx-auto space-y-6">
        <h2 className="text-xl font-bold text-center">Tomorrow's Goal Setup</h2>
        
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-2">Date (Locked)</label>
            <div className="relative">
                <input 
                    type="date" 
                    value={tomorrow}
                    disabled
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 pl-10 bg-gray-100 text-gray-500"
                />
                <CalendarIcon className="absolute left-3 top-3.5 text-gray-400" size={20} />
            </div>
        </div>

        <div className="space-y-4">
            {goals.map((goal, index) => (
                <div key={index} className="flex gap-2 items-center">
                    <input 
                        value={goal}
                        onChange={(e) => updateGoal(index, e.target.value)}
                        placeholder={`Goal ${index + 1}`}
                        className="flex-1 px-4 py-3 rounded-lg border border-gray-300"
                    />
                    {goals.length > 1 && (
                        <button onClick={() => removeGoal(index)} className="text-red-400 p-2">
                            <Trash2 size={20} />
                        </button>
                    )}
                </div>
            ))}
        </div>

        <button 
            onClick={handleAddGoalInput}
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-medium hover:bg-gray-50 flex items-center justify-center gap-2"
        >
            <Plus size={20} /> {t('add_goal')}
        </button>

        <button 
            onClick={handlePublish}
            disabled={goals.filter(g => g.trim() !== "").length === 0}
            className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold shadow-md disabled:opacity-50"
        >
            {t('publish')}
        </button>
      </div>
    </DashboardLayout>
  );
}
