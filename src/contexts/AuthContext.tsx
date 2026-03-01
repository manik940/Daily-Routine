import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { ref, get } from "firebase/database";

interface UserData {
  name: string;
  email: string;
  role: string;
  class: string;
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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (user: User) => {
    try {
      const userRef = ref(db, `users/${user.uid}`);
      
      // Add a timeout for the database fetch on mobile/PWA
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Database timeout")), 8000)
      );
      
      const snapshot = await Promise.race([get(userRef), timeoutPromise]) as any;
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        setUserData(data);
        console.log("User Data Fetched Successfully:", data); 
      } else {
        console.warn("No user data found in DB for uid:", user.uid);
        setUserData(null);
      }
    } catch (error) {
      console.error("CRITICAL ERROR fetching user data:", error);
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchUserData(user);
      } else {
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
      {!loading && children}
    </AuthContext.Provider>
  );
};
