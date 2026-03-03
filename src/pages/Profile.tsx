import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import DashboardLayout from "../components/DashboardLayout";
import UserAvatar from "../components/UserAvatar";
import { Copy, Check, ArrowLeft, Bell } from "lucide-react";
import { sendPushNotification } from "../services/notificationService";
import toast from "react-hot-toast";

export default function Profile() {
  const { userData } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const copyId = () => {
    if (userData?.uniqueId) {
        navigator.clipboard.writeText(userData.uniqueId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
  };

  const testNotification = async () => {
    const res = await sendPushNotification({
        title: "টেস্ট নোটিফিকেশন 🔔",
        message: "আপনার নোটিফিকেশন সিস্টেমটি সঠিকভাবে কাজ করছে!",
    });
    if (res.success) {
        toast.success("নোটিফিকেশন পাঠানো হয়েছে!");
    } else {
        toast.error("নোটিফিকেশন পাঠাতে ব্যর্থ হয়েছে!");
        console.error(res.error);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-xl font-bold">{t('profile')}</h2>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="bg-emerald-600 h-24"></div>
            <div className="px-6 pb-6">
                <div className="relative -mt-12 mb-4 flex justify-center">
                    <UserAvatar 
                        name={userData?.name} 
                        src={userData?.photoURL} 
                        size="xl"
                        className="border-4 border-white shadow-md"
                    />
                </div>
                
                <div className="text-center mb-6">
                    <h3 className="text-xl font-bold">{userData?.name}</h3>
                    <p className="text-gray-500 text-sm">{userData?.email}</p>
                </div>

                <div className="bg-emerald-50 rounded-lg p-4 flex justify-between items-center mb-6 border border-emerald-100">
                    <div>
                        <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider">{t('unique_id')}</p>
                        <p className="text-lg font-mono font-bold text-gray-800">{userData?.uniqueId}</p>
                    </div>
                    <button onClick={copyId} className="p-2 bg-white rounded-full shadow-sm text-emerald-600 hover:bg-emerald-100 transition-colors">
                        {copied ? <Check size={20} /> : <Copy size={20} />}
                    </button>
                </div>

                <div className="mb-6">
                    <button 
                        onClick={testNotification}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-white border-2 border-emerald-500 text-emerald-600 rounded-xl font-bold hover:bg-emerald-50 transition-all active:scale-95"
                    >
                        <Bell size={20} />
                        টেস্ট নোটিফিকেশন পাঠান
                    </button>
                </div>

                <div className="space-y-3 text-sm">
                    <InfoRow label={t('school')} value={userData?.school} />
                    <InfoRow label={t('class')} value={userData?.class} />
                    <InfoRow label={t('roll')} value={userData?.roll} />
                    {userData?.group && <InfoRow label={t('group')} value={userData?.group} />}
                    <InfoRow label={t('section')} value={userData?.section} />
                    <InfoRow label={t('shift')} value={userData?.shift} />
                </div>
            </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

const InfoRow = ({ label, value }: { label: string, value?: string }) => (
    <div className="flex justify-between py-2 border-b border-gray-100 last:border-0">
        <span className="text-gray-500">{label}</span>
        <span className="font-medium text-gray-800">{value || "N/A"}</span>
    </div>
);
