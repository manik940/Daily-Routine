import { useEffect, useRef } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { sendPushNotification, getRandomQuote } from '../services/notificationService';

export default function NotificationManager() {
  const { currentUser } = useAuth();
  const sentNotifications = useRef<Set<string>>(new Set());
  const todayRoutineRef = useRef<any[]>([]);
  const todayTodosRef = useRef<any[]>([]);

  useEffect(() => {
    if (!currentUser) return;

    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = days[new Date().getDay()];

    // Fetch Routine and Todos
    const routineRef = ref(db, `routines/${currentUser.uid}`);
    const todoRef = ref(db, `todos/${currentUser.uid}`);

    const unsubRoutine = onValue(routineRef, (snapshot) => {
      const data = snapshot.val();
      const list: any[] = [];
      if (data) {
        Object.entries(data).forEach(([routineId, routine]: [string, any]) => {
          if (routine.days && routine.days[today]) {
            const daySubjects = Array.isArray(routine.days[today]) 
              ? routine.days[today] 
              : Object.values(routine.days[today]);
            list.push(...daySubjects.filter(Boolean));
          }
        });
      }
      todayRoutineRef.current = list;
    });

    const unsubTodo = onValue(todoRef, (snapshot) => {
      const data = snapshot.val();
      const list: any[] = [];
      if (data) {
        Object.entries(data).forEach(([todoId, todo]: [string, any]) => {
          if (todo.days && todo.days[today]) {
            const dayTasks = Array.isArray(todo.days[today]) 
              ? todo.days[today] 
              : Object.values(todo.days[today]);
            list.push(...dayTasks.filter(Boolean));
          }
        });
      }
      todayTodosRef.current = list;
    });

    const checkAndSendNotifications = () => {
      // Check for Median.co (GoNative) OneSignal Info
      if ((window as any).gonative && (window as any).gonative.onesignal) {
        (window as any).gonative.onesignal.getInfo((info: any) => {
          console.log("Median OneSignal Info:", info);
          if (!info.oneSignalUserId) {
            console.warn("Device is not registered with OneSignal yet. Registering...");
            (window as any).gonative.onesignal.register();
          }
        });
      }

      const now = new Date();
      const currentH = now.getHours();
      const currentM = now.getMinutes();
      const currentTimeStr = `${currentH.toString().padStart(2, '0')}:${currentM.toString().padStart(2, '0')}`;
      const currentFullDate = now.toISOString().split('T')[0];
      const todayDateStr = currentFullDate;

      console.log(`Checking notifications at ${currentTimeStr}. Routine count: ${todayRoutineRef.current.length}, Todo count: ${todayTodosRef.current.length}`);

      // Clear sent notifications if the date has changed
      if (sentNotifications.current.size > 0) {
        const firstEntry = Array.from(sentNotifications.current)[0];
        if (!firstEntry.includes(currentFullDate)) {
          sentNotifications.current.clear();
        }
      }

      // 1. Check Todos
      todayTodosRef.current.forEach((task) => {
        const notificationId = `todo-${task.task}-${task.startTime}-${todayDateStr}`;
        if (task.startTime === currentTimeStr && !sentNotifications.current.has(notificationId)) {
          console.log(`Triggering TODO notification: ${task.task}`);
          sendPushNotification({
            title: "এই সময়ের কাজ 🎯",
            message: `এখন তোমার কাজ: ${task.task}\nসময়সীমা: ${formatTime(task.startTime)} - ${formatTime(task.endTime)}\n\nদ্রুত কাজটি করে ফেলি! 🚀`,
            collapseId: "current-task-notification"
          });
          sentNotifications.current.add(notificationId);
        }
      });

      // 2. Check Routine
      todayRoutineRef.current.forEach((subject) => {
        const notificationId = `routine-${subject.subject}-${subject.startTime}-${todayDateStr}`;
        if (subject.startTime === currentTimeStr && !sentNotifications.current.has(notificationId)) {
          console.log(`Triggering ROUTINE notification: ${subject.subject}`);
          sendPushNotification({
            title: `${subject.subject} পড়ার সময় হয়ে গেছে! 📚`,
            message: `তোমার ${subject.subject} সময় হয়ে গেছে, দ্রুত পড়তে বসে যাও!!\nসময়সীমা: ${formatTime(subject.startTime)} - ${formatTime(subject.endTime)}\n\n${getRandomQuote()}`,
            collapseId: "current-task-notification"
          });
          sentNotifications.current.add(notificationId);
        }
      });
    };

    // Helper to format time to 12h
    const formatTime = (time24: string) => {
      if (!time24) return "";
      const [hours, minutes] = time24.split(':');
      let h = parseInt(hours, 10);
      const m = parseInt(minutes, 10);
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12;
      h = h ? h : 12; 
      return `${h}:${m.toString().padStart(2, '0')} ${ampm}`;
    };

    // Check every 30 seconds to ensure we don't miss a minute
    const interval = setInterval(checkAndSendNotifications, 30000);
    checkAndSendNotifications(); // Initial check

    return () => {
      unsubRoutine();
      unsubTodo();
      clearInterval(interval);
    };
  }, [currentUser]);

  return null; // This component doesn't render anything
}
