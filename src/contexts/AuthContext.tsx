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
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        setUserData(data);
        console.log("User Data Fetched Successfully:", data); 
      } else {
        console.warn("No user data found in DB for uid:", user.uid);
        // Don't set null immediately if we want to keep old data or show loading? 
        // No, if DB is empty, we should reflect that.
        setUserData(null);
      }
    } catch (error) {
      console.error("CRITICAL ERROR fetching user data:", error);
      // Could set an error state here to show in UI
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Add a small delay to allow DB writes to propagate if this is a fresh login/register
        // though usually not needed, it can help in some edge cases
        await fetchUserData(user);
      } else {
        setUserData(null);
      }
      setLoading(false);
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
