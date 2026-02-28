import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../../components/AuthLayout";
import PinInput from "../../components/PinInput";
import { useLanguage } from "../../contexts/LanguageContext";
import { ArrowLeft, ArrowRight, Timer } from "lucide-react";

type Step = "email" | "otp" | "password";

export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [timer, setTimer] = useState(300); // 5 minutes in seconds
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === "otp" && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError(t('email_placeholder'));
      return;
    }
    
    setLoading(true);
    // Simulate OTP generation
    setTimeout(() => {
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      setGeneratedOtp(code);
      
      // In a real app, this would be sent via email using a backend service (e.g., SendGrid, Nodemailer).
      // Since we don't have an email server configured, we show it for testing.
      console.log("Generated OTP:", code);
      
      setStep("otp");
      setTimer(300);
      setLoading(false);
      setError("");
    }, 1000);
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (timer === 0) {
      setError(t('otp_expired'));
      return;
    }
    if (otp !== generatedOtp) {
      setError(t('invalid_otp'));
      return;
    }
    
    setStep("password");
    setError("");
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
        setError("Password must be 6 digits");
        return;
    }
    if (newPassword !== confirmPassword) {
      setError(t('passwords_do_not_match'));
      return;
    }

    setLoading(true);
    // Simulate password update
    setTimeout(() => {
      setLoading(false);
      alert(t('password_reset_success'));
      navigate("/");
    }, 1500);
  };

  return (
    <AuthLayout>
      <div className="flex-1 flex flex-col p-6 max-w-md mx-auto w-full justify-center">
        {/* Header with Back Button */}
        <div className="flex items-center mb-6">
          <button 
            onClick={() => {
                if (step === 'email') navigate(-1);
                else if (step === 'otp') setStep('email');
                else if (step === 'password') setStep('otp');
            }}
            className="p-2 hover:bg-gray-100 rounded-full mr-2"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <h2 className="text-xl font-bold text-gray-800">
            {step === 'email' && t('forgot_password')}
            {step === 'otp' && t('enter_otp')}
            {step === 'password' && t('new_password')}
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
              {loading ? "Sending..." : t('next')}
              {!loading && <ArrowRight size={20} />}
            </button>
          </form>
        )}

        {/* Step 2: OTP Input */}
        {step === "otp" && (
          <form onSubmit={handleOtpSubmit} className="space-y-6">
            <div className="text-center mb-4">
                <p className="text-gray-600 mb-1">{t('otp_sent_to')}</p>
                <p className="font-medium text-gray-800">{email}</p>
            </div>

            {/* Development Mode OTP Display */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center mb-4">
                <p className="text-xs text-yellow-800 font-medium uppercase tracking-wide mb-1">Development Mode</p>
                <p className="text-sm text-yellow-700">
                    Real email sending requires a backend server. <br/>
                    Use this code to test: <span className="font-bold text-lg text-black">{generatedOtp}</span>
                </p>
            </div>

            <div className="flex justify-center">
                <PinInput 
                    length={4} 
                    onChange={setOtp} 
                    onComplete={(val) => setOtp(val)}
                />
            </div>

            <div className="flex justify-center items-center gap-2 text-gray-500 font-mono">
                <Timer size={16} />
                <span>{formatTime(timer)}</span>
            </div>
            
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <button
              type="submit"
              disabled={otp.length !== 4}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {t('confirm')}
            </button>
          </form>
        )}

        {/* Step 3: New Password */}
        {step === "password" && (
          <form onSubmit={handlePasswordSubmit} className="space-y-8">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                    {t('enter_new_password')}
                </label>
                <div className="flex justify-center">
                    <PinInput 
                        length={6} 
                        onChange={setNewPassword} 
                        onComplete={(val) => setNewPassword(val)}
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                    {t('re_enter_password')}
                </label>
                <div className="flex justify-center">
                    <PinInput 
                        length={6} 
                        onChange={setConfirmPassword} 
                        onComplete={(val) => setConfirmPassword(val)}
                    />
                </div>
            </div>
            
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading || newPassword.length !== 6 || confirmPassword.length !== 6}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? "Updating..." : t('confirm')}
            </button>
          </form>
        )}
      </div>
    </AuthLayout>
  );
}
