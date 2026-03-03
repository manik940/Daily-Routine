import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { ref, get } from "firebase/database";

interface UserData {
  name: string;
  email: string;
  role: string;
  class: string;
  roll?: string;
  group?: string;
  sscYear?: string;
  section: string;
  shift: string;
  school: string;
  uniqueId: string;
  photoURL?: string;
}

interface AuthContextType {
  currentUser: User | null;
  userData: UserData | null;
  loading: boolean;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userData: null,
  loading: true,
  refreshUserData: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // Synchronous cache read for INSTANT loading (Zero delay)
  const getCachedAuth = () => {
    try { return localStorage.getItem("authUser") ? JSON.parse(localStorage.getItem("authUser")!) : null; } 
    catch { return null; }
  };
  const getCachedData = () => {
    try { return localStorage.getItem("userData") ? JSON.parse(localStorage.getItem("userData")!) : null; } 
    catch { return null; }
  };

  const [currentUser, setCurrentUser] = useState<User | null>(getCachedAuth());
  const [userData, setUserData] = useState<UserData | null>(getCachedData());
  
  // If we have cached data, loading is FALSE immediately. No loading screen will be shown.
  const [loading, setLoading] = useState(!(getCachedAuth() && getCachedData()));

  const fetchUserData = async (user: User) => {
    try {
      const userRef = ref(db, `users/${user.uid}`);
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Database timeout")), 8000)
      );
      
      const snapshot = await Promise.race([get(userRef), timeoutPromise]) as any;
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        setUserData(data);
        localStorage.setItem("userData", JSON.stringify(data));
      } else {
        setUserData(null);
        localStorage.removeItem("userData");
      }
    } catch (error) {
      console.error("CRITICAL ERROR fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        localStorage.setItem("authUser", JSON.stringify({ uid: user.uid, email: user.email }));
        setCurrentUser(user);
        await fetchUserData(user);
      } else {
        localStorage.removeItem("authUser");
        localStorage.removeItem("userData");
        setCurrentUser(null);
        setUserData(null);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const refreshUserData = async () => {
    if (currentUser) {
      console.log("Refreshing user data...");
      await fetchUserData(currentUser);
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, userData, loading, refreshUserData }}>
      {children}
    </AuthContext.Provider>
  );
};
