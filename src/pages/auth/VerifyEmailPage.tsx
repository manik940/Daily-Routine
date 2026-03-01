import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { auth } from "../../firebase";
import AuthLayout from "../../components/AuthLayout";
import { useLanguage } from "../../contexts/LanguageContext";
import { CheckCircle, XCircle, Loader2, ArrowRight } from "lucide-react";

export default function VerifyEmailPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [error, setError] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        let email = null;
        try {
          email = window.localStorage.getItem('emailForSignIn');
        } catch (e) {}
        
        if (!email) {
          // If email is missing from local storage, ask the user for it
          email = window.prompt('Please provide your email for confirmation');
        }

        if (email) {
          try {
            await signInWithEmailLink(auth, email, window.location.href);
            try {
              window.localStorage.removeItem('emailForSignIn');
            } catch (e) {}
            setStatus('success');
          } catch (err: any) {
            console.error("Verification error:", err);
            setStatus('error');
            setError(err.message);
          }
        } else {
            setStatus('error');
            setError("Email is required for verification.");
        }
      } else {
        setStatus('error');
        setError("Invalid verification link.");
      }
    };

    verifyEmail();
  }, []);

  return (
    <AuthLayout>
      <div className="flex-1 flex flex-col p-6 max-w-md mx-auto w-full justify-center text-center">
        {status === 'verifying' && (
            <div className="space-y-4">
                <Loader2 size={48} className="text-emerald-600 animate-spin mx-auto" />
                <h2 className="text-xl font-bold text-gray-800">{t('verifying_email')}</h2>
            </div>
        )}

        {status === 'success' && (
            <div className="space-y-6">
                <div className="bg-green-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto animate-bounce">
                    <CheckCircle size={40} className="text-green-600" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('email_verified')}</h2>
                    <p className="text-gray-600">Your email has been successfully verified.</p>
                </div>
                
                <button
                    onClick={() => navigate("/auth/register")}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md flex items-center justify-center gap-2"
                >
                    {t('go_to_app')}
                    <ArrowRight size={20} />
                </button>
            </div>
        )}

        {status === 'error' && (
            <div className="space-y-6">
                <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                    <XCircle size={40} className="text-red-600" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('verification_failed')}</h2>
                    <p className="text-red-500 text-sm">{error}</p>
                </div>
                
                <button
                    onClick={() => navigate("/")}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-lg"
                >
                    {t('back_to_login')}
                </button>
            </div>
        )}
      </div>
    </AuthLayout>
  );
}
