import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
import AuthLayout from "../../components/AuthLayout";
import PinInput from "../../components/PinInput";
import { useLanguage } from "../../contexts/LanguageContext";
import { ArrowRight } from "lucide-react";

export default function PasswordPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!email) {
    navigate("/auth/email");
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
        setError("পাসওয়ার্ড অন্তত ৬ সংখ্যার হতে হবে");
        return;
    }
    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (err: any) {
      console.error("Login error:", err);
      if (err.code === 'auth/user-not-found') {
         navigate("/auth/register", { state: { email } });
      } else if (err.code === 'auth/wrong-password') {
        setError("ভুল পাসওয়ার্ড। আবার চেষ্টা করুন।");
      } else {
        setError("লগইন ব্যর্থ হয়েছে।");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="flex-1 flex flex-col p-6 max-w-md mx-auto w-full justify-center">
        <h2 className="text-2xl font-bold mb-2 text-center">{t('login')}</h2>
        <p className="text-center text-gray-500 mb-8">{email}</p>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                {t('password_placeholder')} (6 Digits)
            </label>
            <PinInput 
                length={6} 
                onChange={setPassword} 
                onComplete={(val) => setPassword(val)}
            />
          </div>

          <div className="flex justify-end">
            <button
                type="button"
                onClick={() => navigate("/auth/forgot-password")}
                className="text-sm text-emerald-600 hover:underline"
            >
                {t('forgot_password')}
            </button>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading || password.length < 6}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? "Logging in..." : t('login')}
            {!loading && <ArrowRight size={20} />}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}
