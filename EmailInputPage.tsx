import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchSignInMethodsForEmail } from "firebase/auth";
import { ref, query, orderByChild, equalTo, get } from "firebase/database";
import { auth, db } from "../../firebase";
import AuthLayout from "../../components/AuthLayout";
import { useLanguage } from "../../contexts/LanguageContext";
import { ArrowRight } from "lucide-react";

export default function EmailInputPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError("");

    try {
      // 1. Check Realtime Database first (Most reliable for our app structure)
      // We check if any user has this email in the 'users' node
      const usersRef = ref(db, 'users');
      const q = query(usersRef, orderByChild('email'), equalTo(email));
      const snapshot = await get(q);

      if (snapshot.exists()) {
        // User found in database -> Go to Password Page (Login)
        console.log("User found in DB, redirecting to password page");
        navigate("/auth/password", { state: { email } });
      } else {
        // User NOT found in database -> Go to Register Page
        console.log("User not found in DB, redirecting to register page");
        navigate("/auth/register", { state: { email } });
      }
    } catch (err: any) {
      console.error("Email check error:", err);
      // If DB check fails (e.g. permission issue), try Auth check as fallback
      try {
        const methods = await fetchSignInMethodsForEmail(auth, email);
        if (methods.length > 0) {
            navigate("/auth/password", { state: { email } });
        } else {
            navigate("/auth/register", { state: { email } });
        }
      } catch (authErr) {
        // If everything fails, default to password page to not block potential users
        // or show error. Let's show error to be safe or default to register?
        // Safest default for UX is usually register if we are unsure, or password.
        // Let's default to Register if we really can't tell, assuming new user.
        // But actually, let's just log it and maybe try password page as it handles "user not found" error too.
        navigate("/auth/password", { state: { email } });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="flex-1 flex flex-col p-6 max-w-md mx-auto w-full justify-center">
        <h2 className="text-2xl font-bold mb-6 text-center">{t('login_register')}</h2>
        
        <form onSubmit={handleNext} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('email_placeholder')}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? "Checking..." : t('next')}
            {!loading && <ArrowRight size={20} />}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}
