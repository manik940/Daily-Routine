import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCWVOmJjfhxHVfu5nwr5RQsyOeoZLTcV9s",
  authDomain: "daily-routine-744eb.firebaseapp.com",
  projectId: "daily-routine-744eb",
  storageBucket: "daily-routine-744eb.firebasestorage.app",
  messagingSenderId: "251931821396",
  appId: "1:251931821396:web:3428802489c0ad7f1534c1",
  measurementId: "G-3LRXERYRYN",
  databaseURL: "https://daily-routine-744eb-default-rtdb.firebaseio.com/"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getDatabase(app);
export const auth = getAuth(app);
export default app;
