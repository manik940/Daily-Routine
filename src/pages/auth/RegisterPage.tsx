import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { updatePassword } from "firebase/auth";
import { ref, set } from "firebase/database";
import { auth, db } from "../../firebase";
import toast from "react-hot-toast";
import AuthLayout from "../../components/AuthLayout";
import PinInput from "../../components/PinInput";
import { useLanguage } from "../../contexts/LanguageContext";
import { useAuth } from "../../contexts/AuthContext";
import { ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const { t } = useLanguage();
  const { refreshUserData } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    roll: "",
    class: "",
    group: "",
    sscYear: "",
    section: "",
    shift: "",
    school: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!email || !auth.currentUser) {
      navigate("/auth/email");
    }
  }, [email, navigate]);

  if (!email) {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generateUniqueId = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleNextStep = () => {
    const { name, roll, class: userClass, group, sscYear, section, shift, school } = formData;
    
    if (!name || !roll || !userClass || !section || !shift || !school) {
      toast.error("দয়া করে সম্পূর্ণ ফর্মটি পূরণ করুন");
      return;
    }

    if (userClass === "9" || userClass === "10") {
      if (!group || !sscYear) {
        toast.error("দয়া করে সম্পূর্ণ ফর্মটি পূরণ করুন");
        return;
      }
    }

    setStep(2);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("পাসওয়ার্ড মিলছে না");
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      if (!auth.currentUser) {
        throw new Error("User session lost. Please try again.");
      }

      // Update password from the temporary one to the user's chosen one
      await updatePassword(auth.currentUser, formData.password);
      
      const user = auth.currentUser;
      const uniqueId = generateUniqueId();
      
      const photoURL = ""; 

      const userData = {
        email,
        name: formData.name,
        roll: formData.roll,
        class: formData.class,
        group: formData.group || "",
        sscYear: formData.sscYear || "",
        section: formData.section,
        shift: formData.shift,
        school: formData.school,
        uniqueId,
        photoURL,
        createdAt: new Date().toISOString()
      };

      // Save Data to RTDB
      await set(ref(db, 'users/' + user.uid), userData);

      // FORCE REFRESH USER DATA to avoid race condition
      await refreshUserData();

      navigate("/dashboard");
    } catch (err: any) {
      console.error("Registration error:", err);
      setError("রেজিস্ট্রেশন ব্যর্থ হয়েছে: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input type="email" value={email} disabled className="w-full px-4 py-2 bg-gray-100 rounded-lg border border-gray-300" />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">{t('name')}</label>
        <input name="name" required onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
            <label className="block text-sm font-medium text-gray-700">{t('roll')}</label>
            <input name="roll" required onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300" />
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700">{t('class')}</label>
            <select name="class" required onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300">
                <option value="">Select</option>
                {[3,4,5,6,7,8,9,10].map(c => <option key={c} value={c}>Class {c}</option>)}
            </select>
        </div>
      </div>

      {(formData.class === "9" || formData.class === "10") && (
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">{t('group')}</label>
                <select name="group" required onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300">
                    <option value="">Select</option>
                    <option value="science">{t('science')}</option>
                    <option value="humanities">{t('humanities')}</option>
                    <option value="business">{t('business')}</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">{t('ssc_year')}</label>
                <select name="sscYear" required onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300">
                    <option value="">Select</option>
                    {["2026","2027","2028","2029","2030"].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
            </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
            <label className="block text-sm font-medium text-gray-700">{t('section')}</label>
            <select name="section" required onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300">
                <option value="">Select</option>
                {["A","B","C","D","None"].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700">{t('shift')}</label>
            <select name="shift" required onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300">
                <option value="">Select</option>
                <option value="morning">{t('morning')}</option>
                <option value="day">{t('day')}</option>
                <option value="none">{t('none')}</option>
            </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">{t('school')}</label>
        <input name="school" required onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300" />
      </div>

      <button
        type="button"
        onClick={handleNextStep}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg mt-4 flex items-center justify-center gap-2"
      >
        {t('next')} <ArrowRight size={20} />
      </button>
    </div>
  );

  const renderStep2 = () => (
    <form onSubmit={handleRegister} className="space-y-6">
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4 text-center">Password (6 Digits)</label>
        <PinInput 
            length={6}
            onChange={(val) => setFormData({ ...formData, password: val })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4 text-center">Confirm Password</label>
        <PinInput 
            length={6}
            onChange={(val) => setFormData({ ...formData, confirmPassword: val })}
        />
      </div>

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      <div className="flex gap-4">
        <button
            type="button"
            onClick={() => setStep(1)}
            className="flex-1 bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-lg"
        >
            Back
        </button>
        <button
            type="submit"
            disabled={loading || formData.password.length < 6}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md flex items-center justify-center gap-2"
        >
            {loading ? "Registering..." : t('register')}
        </button>
      </div>
    </form>
  );

  return (
    <AuthLayout>
      <div className="flex-1 flex flex-col p-6 max-w-md mx-auto w-full justify-center overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">{t('register')}</h2>
        {step === 1 ? renderStep1() : renderStep2()}
      </div>
    </AuthLayout>
  );
}
