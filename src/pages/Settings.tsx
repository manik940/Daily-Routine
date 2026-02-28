import React, { useState } from "react";
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential, deleteUser } from "firebase/auth";
import { ref, remove } from "firebase/database";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";
import DashboardLayout from "../components/DashboardLayout";
import { auth, db } from "../firebase";
import { Globe, Palette, Lock, Trash2, AlertTriangle, ArrowRight, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function Settings() {
  const { currentUser } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [deletePassword, setDeletePassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const themes = [
    { id: "default", name: t("default"), color: "bg-emerald-500" },
    { id: "red", name: t("red"), color: "bg-red-500" },
    { id: "green", name: t("green"), color: "bg-green-600" },
    { id: "blue", name: t("blue"), color: "bg-blue-600" },
    { id: "orange", name: t("orange"), color: "bg-orange-500" },
  ];

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
        setError(t("password_mismatch"));
        return;
    }
    if (!currentUser || !currentUser.email) return;

    try {
        const credential = EmailAuthProvider.credential(currentUser.email, passwords.current);
        await reauthenticateWithCredential(currentUser, credential);
        await updatePassword(currentUser, passwords.new);
        setMessage(t("password_updated"));
        setPasswords({ current: "", new: "", confirm: "" });
        setTimeout(() => {
            setShowPasswordModal(false);
            setMessage("");
        }, 1500);
    } catch (err: any) {
        setError("Error: " + err.message);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !currentUser.email) return;

    try {
        const credential = EmailAuthProvider.credential(currentUser.email, deletePassword);
        await reauthenticateWithCredential(currentUser, credential);
        const uid = currentUser.uid;
        await remove(ref(db, `users/${uid}`));
        await remove(ref(db, `routines/${uid}`));
        await remove(ref(db, `todos/${uid}`));
        await remove(ref(db, `goals/${uid}`));
        await deleteUser(currentUser);
        navigate("/");
    } catch (err: any) {
        setError("Error deleting account: " + err.message);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-md mx-auto pb-20">
        <h2 className="text-xl font-bold mb-6 text-gray-800">{t("settings")}</h2>
        
        <div className="space-y-4">
            {/* Language */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4 text-gray-700">
                    <Globe size={20} className="text-blue-500" />
                    <h3 className="font-semibold">{t("language")}</h3>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setLanguage("bn")}
                        className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${language === "bn" ? "bg-blue-50 border-blue-500 text-blue-600" : "border-gray-200 text-gray-600"}`}
                    >
                        বাংলা
                    </button>
                    <button 
                        onClick={() => setLanguage("en")}
                        className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${language === "en" ? "bg-blue-50 border-blue-500 text-blue-600" : "border-gray-200 text-gray-600"}`}
                    >
                        English
                    </button>
                </div>
            </div>

            {/* Theme */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4 text-gray-700">
                    <Palette size={20} className="text-purple-500" />
                    <h3 className="font-semibold">{t("theme")}</h3>
                </div>
                <div className="flex gap-4 justify-start flex-wrap">
                    {themes.map(t => (
                        <button 
                            key={t.id}
                            onClick={() => setTheme(t.id as any)}
                            className="flex flex-col items-center gap-1"
                        >
                            <div className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center transition-transform ${theme === t.id ? "scale-110 ring-2 ring-offset-2 ring-gray-300" : ""}`}>
                                {theme === t.id && <Check size={16} className="text-white" />}
                            </div>
                            <span className="text-[10px] font-medium text-gray-500">{t.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Change Password */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <button 
                    onClick={() => setShowPasswordModal(true)}
                    className="w-full p-4 flex items-center justify-between text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <Lock size={20} className="text-red-500" />
                        <span className="font-semibold">{t("change_password")}</span>
                    </div>
                    <ArrowRight size={18} className="text-gray-400" />
                </button>
            </div>

            {/* Delete Account */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <button 
                    onClick={() => setShowDeleteModal(true)}
                    className="w-full p-4 flex items-center justify-between text-red-600 hover:bg-red-50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <Trash2 size={20} />
                        <span className="font-semibold">{t("delete_account_title")}</span>
                    </div>
                    <ArrowRight size={18} className="text-red-300" />
                </button>
            </div>
        </div>

        {/* Password Modal */}
        <AnimatePresence>
            {showPasswordModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl"
                    >
                        <h3 className="text-lg font-bold mb-4">{t("change_password")}</h3>
                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <input 
                                type="password" 
                                placeholder={t("current_password")}
                                required
                                value={passwords.current}
                                onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <input 
                                type="password" 
                                placeholder={t("new_password")}
                                required
                                value={passwords.new}
                                onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <input 
                                type="password" 
                                placeholder={t("confirm_password")}
                                required
                                value={passwords.confirm}
                                onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            
                            {error && <p className="text-red-500 text-sm">{error}</p>}
                            {message && <p className="text-green-500 text-sm">{message}</p>}

                            <div className="flex gap-3 pt-2">
                                <button 
                                    type="button"
                                    onClick={() => {
                                        setShowPasswordModal(false);
                                        setError("");
                                        setMessage("");
                                    }}
                                    className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium"
                                >
                                    {t("cancel")}
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-medium"
                                >
                                    {t("update")}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>

        {/* Delete Modal */}
        <AnimatePresence>
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl"
                    >
                        <div className="flex items-center gap-2 text-red-600 mb-2">
                            <AlertTriangle size={24} />
                            <h3 className="font-bold text-lg">{t("delete_account_title")}</h3>
                        </div>
                        <p className="text-gray-600 text-sm mb-4">
                            {t("delete_warning")}
                        </p>
                        <form onSubmit={handleDeleteAccount} className="space-y-4">
                            <input 
                                type="password" 
                                placeholder={t("enter_password_confirm")}
                                required
                                value={deletePassword}
                                onChange={(e) => setDeletePassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-red-300 focus:ring-2 focus:ring-red-500 outline-none"
                            />
                            
                            {error && <p className="text-red-500 text-sm">{error}</p>}

                            <div className="flex gap-3 pt-2">
                                <button 
                                    type="button"
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setError("");
                                    }}
                                    className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium"
                                >
                                    {t("cancel")}
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-medium"
                                >
                                    {t("delete")}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>

      </div>
    </DashboardLayout>
  );
}
