import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebase";
import AuthLayout from "../../components/AuthLayout";
import { useLanguage } from "../../contexts/LanguageContext";
import { ArrowLeft, ArrowRight } from "lucide-react";

type Step = "email" | "sent";

export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError(t('email_placeholder'));
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      await sendPasswordResetEmail(auth, email);
      setStep("sent");
    } catch (err: any) {
      console.error("Password reset error:", err);
      // Even if user not found, it's good practice to show success to prevent email enumeration,
      // but Firebase might throw auth/user-not-found. We can just show the success message anyway,
      // or show the error. Let's show the success message to match the requirement.
      setStep("sent");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="flex-1 flex flex-col p-6 max-w-md mx-auto w-full justify-center">
        {/* Header with Back Button */}
        <div className="flex items-center mb-6">
          <button 
            onClick={() => {
                if (step === 'email') navigate(-1);
                else if (step === 'sent') setStep('email');
            }}
            className="p-2 hover:bg-gray-100 rounded-full mr-2"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <h2 className="text-xl font-bold text-gray-800">
            {t('forgot_password')}
          </h2>
        </div>

        {/* Step 1: Email Input */}
        {step === "email" && (
          <form onSubmit={handleEmailSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('email_placeholder')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                placeholder="example@email.com"
                required
              />
            </div>
            
            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? "Sending..." : "এগিয়ে যান"}
              {!loading && <ArrowRight size={20} />}
            </button>
          </form>
        )}

        {/* Step 2: Success Message */}
        {step === "sent" && (
          <div className="text-center space-y-6">
            <p className="text-gray-700 text-lg">
              ইউজারটির ইমেইলে একটি পাসওয়ার্ড রিসেট লিংক পাঠানো হয়েছে সেখান থেকে যেন ইউজার পাসওয়ার্ড আপডেট করে দেয়।
            </p>
            <button
              onClick={() => navigate("/")}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md flex items-center justify-center gap-2"
            >
              লগইন পেজে ফিরে যান
            </button>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}
