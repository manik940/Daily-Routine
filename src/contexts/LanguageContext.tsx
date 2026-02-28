import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "bn" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<Language, string>> = {
  "app_name": { bn: "Daily Routine", en: "Daily Routine" },
  "login_register": { bn: "লগইন / রেজিস্ট্রেশন", en: "Login / Registration" },
  "email_placeholder": { bn: "আপনার ইমেইল দিন", en: "Enter your email" },
  "next": { bn: "এগিয়ে যান", en: "Next" },
  "password_placeholder": { bn: "পাসওয়ার্ড দিন", en: "Enter Password" },
  "login": { bn: "লগইন", en: "Login" },
  "register": { bn: "রেজিস্টার", en: "Register" },
  "forgot_password": { bn: "পাসওয়ার্ড ভুলে গেছেন?", en: "Forgot Password?" },
  "name": { bn: "নাম", en: "Name" },
  "roll": { bn: "রোল", en: "Roll" },
  "class": { bn: "শ্রেণী", en: "Class" },
  "group": { bn: "বিভাগ", en: "Group" },
  "ssc_year": { bn: "এসএসসি ব্যাচ", en: "SSC Batch" },
  "section": { bn: "শাখা", en: "Section" },
  "shift": { bn: "সিফট", en: "Shift" },
  "school": { bn: "বিদ্যালয় এর নাম", en: "School Name" },
  "science": { bn: "বিজ্ঞান", en: "Science" },
  "humanities": { bn: "মানবিক", en: "Humanities" },
  "business": { bn: "ব্যবসায় শিক্ষা", en: "Business Studies" },
  "morning": { bn: "প্রভাতী", en: "Morning" },
  "day": { bn: "দিবা", en: "Day" },
  "none": { bn: "নেই", en: "None" },
  "welcome": { bn: "স্বাগতম", en: "Welcome" },
  "todays_todo": { bn: "আজকের To-Do-List", en: "Today's To-Do List" },
  "todays_routine": { bn: "আজকের পড়ার রুটিন", en: "Today's Routine" },
  "todays_goal": { bn: "আজকের Goal", en: "Today's Goal" },
  "daily_goal_setup": { bn: "ডেইলি Goal সেটআপ", en: "Daily Goal Setup" },
  "routine_setup": { bn: "পড়ার রুটিন সেটআপ", en: "Routine Setup" },
  "todo_setup": { bn: "To-Do-List সেটআপ", en: "To-Do List Setup" },
  "settings": { bn: "সেটিংস", en: "Settings" },
  "profile": { bn: "প্রোফাইল", en: "Profile" },
  "app_info": { bn: "App info", en: "App Info" },
  "user_manual": { bn: "ইউজার ম্যানুয়াল", en: "User Manual" },
  "logout": { bn: "লগ আউট", en: "Logout" },
  "menu": { bn: "মেনু", en: "Menu" },
  "home": { bn: "হোম", en: "Home" },
  "back": { bn: "ফিরে যান", en: "Back" },
  "cancel": { bn: "বাতিল", en: "Cancel" },
  "update": { bn: "আপডেট", en: "Update" },
  "delete": { bn: "ডিলিট", en: "Delete" },
  "current_password": { bn: "বর্তমান পাসওয়ার্ড", en: "Current Password" },
  "new_password": { bn: "নতুন পাসওয়ার্ড", en: "New Password" },
  "confirm_password": { bn: "পাসওয়ার্ড নিশ্চিত করুন", en: "Confirm Password" },
  "password_mismatch": { bn: "নতুন পাসওয়ার্ড মিলছে না", en: "New passwords do not match" },
  "password_updated": { bn: "পাসওয়ার্ড সফলভাবে আপডেট হয়েছে", en: "Password updated successfully" },
  "delete_account_title": { bn: "একাউন্ট ডিলিটেশন", en: "Delete Account" },
  "delete_warning": { bn: "এই কাজটি অপরিবর্তনীয়। আপনার সমস্ত ডেটা স্থায়ীভাবে মুছে ফেলা হবে।", en: "This action is irreversible. All your data will be permanently deleted." },
  "enter_password_confirm": { bn: "নিশ্চিত করতে পাসওয়ার্ড দিন", en: "Enter password to confirm" },
  "items": { bn: "টি আইটেম", en: "Items" },
  "create_new": { bn: "নতুন তৈরি করুন", en: "Create New" },
  "have_productive_day": { bn: "আপনার দিনটি শুভ হোক!", en: "Have a productive day!" },
  "todays_tasks": { bn: "আজকের টাস্ক সমূহ", en: "Today's Tasks" },
  "blue": { bn: "নীল", en: "Blue" },
  "red": { bn: "লাল", en: "Red" },
  "green": { bn: "সবুজ", en: "Green" },
  "orange": { bn: "কমলা", en: "Orange" },
  "default": { bn: "ডিফল্ট", en: "Default" },
  "create_new_routine": { bn: "নতুন রুটিন তৈরি করি", en: "Create New Routine" },
  "create_new_todo": { bn: "টুডু লিস্ট সেটাপ করি", en: "Setup To-Do List" },
  "tap_hold_setup": { bn: "সেটআপ করতে ট্যাপ করে ধরে রাখুন", en: "Tap and hold to setup" },
  "sat": { bn: "শনিবার", en: "Saturday" },
  "sun": { bn: "রবিবার", en: "Sunday" },
  "mon": { bn: "সোমবার", en: "Monday" },
  "tue": { bn: "মঙ্গলবার", en: "Tuesday" },
  "wed": { bn: "বুধবার", en: "Wednesday" },
  "thu": { bn: "বৃহস্পতিবার", en: "Thursday" },
  "fri": { bn: "শুক্রবার", en: "Friday" },
  "same_as": { bn: "এর মতো সেম", en: "Same as" },
  "start_time": { bn: "শুরুর সময়", en: "Start Time" },
  "end_time": { bn: "শেষের সময়", en: "End Time" },
  "subject": { bn: "বিষয়", en: "Subject" },
  "task_desc": { bn: "কাজের বিবরণ", en: "Task Description" },
  "add_to_list": { bn: "অ্যাড টু লিস্ট", en: "Add to List" },
  "publish": { bn: "পাবলিস্ট", en: "Publish" },
  "add_goal": { bn: "এড গোল", en: "Add Goal" },
  "unique_id": { bn: "ইউনিক আইডি", en: "Unique ID" },
  "copy": { bn: "কপি", en: "Copy" },
  "change_password": { bn: "পাসওয়ার্ড পরিবর্তন", en: "Change Password" },
  "theme": { bn: "থিম", en: "Theme" },
  "language": { bn: "ভাষা", en: "Language" },
  "success": { bn: "সফল হয়েছে!", en: "Success!" },
  "delete_confirm": { bn: "আপনি কি নিশ্চিত আপনি এটি ডিলিট করতে চান?", en: "Are you sure you want to delete this?" },
  "yes": { bn: "হ্যাঁ", en: "Yes" },
  "no": { bn: "না", en: "No" },
  "no_routine": { bn: "কোন রুটিন সেটআপ করা নেই", en: "No routine setup" },
  "no_todo": { bn: "কোন টুডু লিস্ট সেটআপ করা নেই", en: "No to-do list setup" },
  "no_goal": { bn: "কোন গোল সেটআপ করা হয়নি", en: "No goal setup" },
  "please_setup": { bn: "দয়া করে সেটআপ করুন", en: "Please setup" },
  "enter_otp": { bn: "ওটিপি দিন", en: "Enter OTP" },
  "otp_sent_to": { bn: "ওটিপি পাঠানো হয়েছে এই ইমেইলে:", en: "OTP sent to:" },
  "confirm": { bn: "নিশ্চিত করুন", en: "Confirm" },
  "resend_otp": { bn: "পুনরায় পাঠান", en: "Resend OTP" },
  "otp_expired": { bn: "ওটিপির মেয়াদ শেষ", en: "OTP Expired" },
  "invalid_otp": { bn: "ভুল ওটিপি", en: "Invalid OTP" },
  "passwords_do_not_match": { bn: "পাসওয়ার্ড মিলছে না", en: "Passwords do not match" },
  "password_reset_success": { bn: "পাসওয়ার্ড সফলভাবে রিসেট হয়েছে", en: "Password reset successfully" },
  "otp_placeholder": { bn: "৪ সংখ্যার কোড", en: "4 digit code" },
  "enter_new_password": { bn: "নতুন পাসওয়ার্ড দিন (৬ সংখ্যা)", en: "Enter new password (6 digits)" },
  "re_enter_password": { bn: "পাসওয়ার্ড পুনরায় দিন", en: "Re-enter password" },
  "reset_link_sent": { bn: "আপনার ইমেইলে রিসেট পাসওয়ার্ড করার জন্য একটি লিংক পাঠানো হয়েছে", en: "A password reset link has been sent to your email" },
  "send_reset_link": { bn: "রিসেট লিংক পাঠান", en: "Send Reset Link" },
  "back_to_login": { bn: "লগইনে ফিরে যান", en: "Back to Login" },
  "verification_link_sent": { bn: "আপনার ইমেইলে একটি ভেরিফিকেশন লিংক পাঠানো হয়েছে", en: "A verification link has been sent to your email" },
  "check_email": { bn: "দয়া করে আপনার ইমেইল চেক করুন", en: "Please check your email" },
  "verifying_email": { bn: "ইমেইল ভেরিফাই করা হচ্ছে...", en: "Verifying email..." },
  "email_verified": { bn: "ইমেইল ভেরিফাইড হয়েছে!", en: "Email Verified!" },
  "go_to_app": { bn: "অ্যাপ এ এগিয়ে যান", en: "Go to App" },
  "verification_failed": { bn: "ভেরিফিকেশন ব্যর্থ হয়েছে", en: "Verification Failed" },
  "set_password": { bn: "পাসওয়ার্ড সেট করুন", en: "Set Password" },
  "complete_registration": { bn: "রেজিস্ট্রেশন সম্পন্ন করুন", en: "Complete Registration" },
};

const LanguageContext = createContext<LanguageContextType>({
  language: "bn",
  setLanguage: () => {},
  t: (key) => key,
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<Language>("bn");

  const t = (key: string) => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
