import DashboardLayout from "../components/DashboardLayout";
import { useLanguage } from "../contexts/LanguageContext";

export default function UserManual() {
  const { t } = useLanguage();

  return (
    <DashboardLayout>
      <div className="max-w-md mx-auto space-y-6">
        <h2 className="text-xl font-bold text-center">{t('user_manual')}</h2>
        
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6 text-gray-700 leading-relaxed">
            <section>
                <h3 className="font-bold text-emerald-600 mb-2">১. ভূমিকা</h3>
                <p>Daily Routine অ্যাপটি শিক্ষার্থীদের দৈনন্দিন পড়াশোনা এবং কাজগুলো গুছিয়ে রাখার জন্য তৈরি করা হয়েছে।</p>
            </section>

            <section>
                <h3 className="font-bold text-emerald-600 mb-2">২. রুটিন সেটআপ</h3>
                <p>মেনু থেকে 'পড়ার রুটিন সেটআপ' এ যান। নতুন রুটিন তৈরি করতে প্লাস আইকনে ক্লিক করুন। প্রতিটি বারের জন্য বিষয় এবং সময় নির্ধারণ করুন। প্রিভিউ দেখে ট্যাপ করে ধরে রেখে সেভ করুন।</p>
            </section>

            <section>
                <h3 className="font-bold text-emerald-600 mb-2">৩. টু-ডু লিস্ট</h3>
                <p>প্রতিদিনের ছোট ছোট কাজগুলো মনে রাখতে টু-ডু লিস্ট ব্যবহার করুন। রুটিনের সাথে সাংঘর্ষিক সময়গুলো এড়িয়ে চলুন।</p>
            </section>

            <section>
                <h3 className="font-bold text-emerald-600 mb-2">৪. ডেইলি গোল</h3>
                <p>প্রতিদিন সকালে বা আগের রাতে আপনার লক্ষ্যগুলো ঠিক করুন। এটি আপনাকে ফোকাসড থাকতে সাহায্য করবে।</p>
            </section>

            <section>
                <h3 className="font-bold text-emerald-600 mb-2">৫. সেটিংস</h3>
                <p>ভাষা পরিবর্তন, থিম পরিবর্তন এবং পাসওয়ার্ড পরিবর্তনের জন্য সেটিংস অপশন ব্যবহার করুন।</p>
            </section>
        </div>
      </div>
    </DashboardLayout>
  );
}
