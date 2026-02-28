import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import DashboardLayout from "../components/DashboardLayout";
import UserAvatar from "../components/UserAvatar";
import { Copy, Check } from "lucide-react";

export default function Profile() {
  const { userData } = useAuth();
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const copyId = () => {
    if (userData?.uniqueId) {
        navigator.clipboard.writeText(userData.uniqueId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-md mx-auto space-y-6">
        <h2 className="text-xl font-bold text-center">{t('profile')}</h2>
        
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
