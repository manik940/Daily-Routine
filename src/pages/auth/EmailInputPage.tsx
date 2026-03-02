import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchSignInMethodsForEmail, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { ref, query, orderByChild, equalTo, get } from "firebase/database";
import { auth, db } from "../../firebase";
import AuthLayout from "../../components/AuthLayout";
import { useLanguage } from "../../contexts/LanguageContext";
import { ArrowRight, ArrowLeft } from "lucide-react";

export default function EmailInputPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"email" | "verify">("email");
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === "verify" && !isVerified) {
      interval = setInterval(async () => {
        if (auth.currentUser) {
          await auth.currentUser.reload();
          if (auth.currentUser.emailVerified) {
            setIsVerified(true);
            clearInterval(interval);
          }
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [step, isVerified]);

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError("");

    try {
      // 1. Check Realtime Database first (Most reliable for our app structure)
      const usersRef = ref(db, 'users');
      const q = query(usersRef, orderByChild('email'), equalTo(email));
      const snapshot = await get(q);

      if (snapshot.exists()) {
        // User found in database -> Go to Password Page (Login)
        navigate("/auth/password", { state: { email } });
      } else {
        // User NOT found in database -> Handle Verification Flow
        const tempPassword = "TempPassword123!@#";
        try {
          // Try to sign in with temp password (in case they abandoned registration before)
          const userCredential = await signInWithEmailAndPassword(auth, email, tempPassword);
          if (userCredential.user.emailVerified) {
            navigate("/auth/register", { state: { email } });
          } else {
            await sendEmailVerification(userCredential.user);
            setStep("verify");
          }
        } catch (signInErr: any) {
          if (signInErr.code === 'auth/user-not-found' || signInErr.code === 'auth/invalid-credential') {
            try {
              // Create new user with temp password
              const newUserCredential = await createUserWithEmailAndPassword(auth, email, tempPassword);
              await sendEmailVerification(newUserCredential.user);
              setStep("verify");
            } catch (createErr: any) {
              if (createErr.code === 'auth/email-already-in-use') {
                // They have an account with a real password but aren't in DB.
                // This is a rare edge case, send to password page to login.
                navigate("/auth/password", { state: { email } });
              } else {
                setError("An error occurred. Please try again.");
                console.error(createErr);
              }
            }
          } else if (signInErr.code === 'auth/wrong-password') {
             // They have a real password but aren't in DB.
             navigate("/auth/password", { state: { email } });
          } else {
             setError("An error occurred. Please try again.");
             console.error(signInErr);
          }
        }
      }
    } catch (err: any) {
      console.error("Email check error:", err);
      // Fallback
      navigate("/auth/password", { state: { email } });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="flex-1 flex flex-col p-6 max-w-md mx-auto w-full justify-center">
        {step === "email" && (
          <>
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
          </>
        )}

        {step === "verify" && (
          <div className="space-y-6">
            <div className="flex items-center mb-6">
              <button 
                onClick={() => setStep("email")}
                className="p-2 hover:bg-gray-100 rounded-full mr-2"
              >
                <ArrowLeft size={24} className="text-gray-600" />
              </button>
              <h2 className="text-xl font-bold text-gray-800">
                ইমেইল ভেরিফিকেশন
              </h2>
            </div>
            
            <div className="text-center">
              <div className="bg-emerald-50 p-6 rounded-2xl mb-6 border border-emerald-100">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📧</span>
                </div>
                <p className="text-gray-700 font-medium leading-relaxed">
                  আপনার ইমেইলে একটি ভেরিফিকেশন লিংক পাঠানো হয়েছে। দয়া করে আপনার ইমেইল চেক করুন এবং লিংকে ক্লিক করে ভেরিফাই করুন।
                </p>
              </div>
              
              <p className="text-sm text-gray-500 mb-6 italic">
                * ইমেইল ভেরিফাই করার পর নিচের বাটনটি সচল হবে।
              </p>
              
              <button
                onClick={() => navigate("/auth/register", { state: { email } })}
                disabled={!isVerified}
                className={`w-full font-semibold py-4 px-6 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all duration-500 ${
                  isVerified 
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white opacity-100 scale-100' 
                    : 'bg-gray-300 text-gray-500 opacity-50 cursor-not-allowed scale-95'
                }`}
              >
                এগিয়ে যান <ArrowRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}
