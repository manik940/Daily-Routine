import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useLanguage } from '../contexts/LanguageContext';
import { Mail } from 'lucide-react';

export default function HelpSupport() {
  const { t } = useLanguage();

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6">{t('help_support')}</h2>
          
          <div className="flex items-center gap-4 p-4 bg-emerald-50 text-emerald-700 rounded-xl mb-6">
            <Mail size={28} />
            <div>
              <p className="text-sm opacity-80">Support Email:</p>
              <p className="font-semibold text-lg">edustream1094@gmail.com</p>
            </div>
          </div>

          <p className="text-gray-700 leading-relaxed text-lg mb-6">
            যেকোনো সাহায্য বা প্রয়োজন এই ঠিকানায় মেইল পাঠান,, সাকসেসফুলভাবে ইমেইল পৌঁছালে ৭২ ঘণ্টার মধ্যে একশন নেওয়া হবে,, ধন্যবাদ!!
          </p>

          <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
            <h3 className="text-amber-800 font-bold mb-2">সতর্কতা :</h3>
            <p className="text-amber-900 leading-relaxed">
              ইমেইল পাঠানোর ক্ষেত্রে,, অবশ্যই যেই ইমেইল দিয়ে একাউন্ট ক্রিয়েট করেছেন সেই মেইল থেকেই ইমেইল পাঠাতে হবে,, এক্ষেত্রে ইমেইলে অবশ্যই ইউজারের নাম, ইউনিক আইডি এবং ইমেইল উল্লেখিত রাখতে হবে,, নয়তো এটিকে Unknown ইমেইল হিসেবে গণনা করা হবে!!
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
