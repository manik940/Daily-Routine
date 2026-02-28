import DashboardLayout from "../components/DashboardLayout";
import { useLanguage } from "../contexts/LanguageContext";

export default function AppInfo() {
  const { t } = useLanguage();

  return (
    <DashboardLayout>
      <div className="max-w-md mx-auto space-y-6">
        <h2 className="text-xl font-bold text-center">{t('app_info')}</h2>
        
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <InfoItem label="App Name" value="Daily Routine" />
            <InfoItem label="App Goal" value="Ease of routine setup at all times" />
            <InfoItem label="App Language" value="BN + EN" />
            <InfoItem label="App Theme" value="Default" />
            <InfoItem label="Database Provider" value="Firebase" />
            <InfoItem label="Structure and Design by" value="MD Manik Hossen" />
            <InfoItem label="Developed by" value="MD Manik Hossen" />
            <InfoItem label="Coding and function setup by" value="Ai" />
            <InfoItem label="App Version" value="1.0.0" />
        </div>
      </div>
    </DashboardLayout>
  );
}

const InfoItem = ({ label, value }: { label: string, value: string }) => (
    <div>
        <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
        <p className="font-medium text-gray-800">{value}</p>
    </div>
);
