/// <reference types="vite/client" />

/**
 * Notification Service for OneSignal
 * This service allows the app to trigger push notifications to Android devices
 * using the OneSignal REST API.
 */

const ONESIGNAL_APP_ID = "99bf2974-08db-4721-9159-13469eaa3440";
const ONESIGNAL_REST_API_KEY = "os_v2_app_tg7ss5ai3ndsdekzcndj5kruidhzmugmuw4e6enpzfewbv2v6ogb3hbny5nrqxvc54spluwxkt4hnuiw6nkl3fwd4jeyxxvpwexalii";

// Use the provided icon URL or a fallback
const NOTIFICATION_ICON = "https://raw.githubusercontent.com/manikdataexpart10/Daily-Routine/main/icon.png";

const STUDY_QUOTES = [
  "শিক্ষাই জাতির মেরুদণ্ড। 🎓",
  "পরিশ্রম সৌভাগ্যের প্রসূতি। 💪",
  "জ্ঞানই শক্তি। 🧠",
  "আজকের কাজ কালকের জন্য ফেলে রেখো না। ⏳",
  "সাফল্যের কোনো গোপন মন্ত্র নেই, এটি প্রস্তুতি ও কঠোর পরিশ্রমের ফল। ✨",
  "পড়ালেখা মানুষের জীবনের শ্রেষ্ঠ সম্পদ। 📖"
];

export const getRandomQuote = () => STUDY_QUOTES[Math.floor(Math.random() * STUDY_QUOTES.length)];

interface NotificationPayload {
  title: string;
  message: string;
  data?: any;
  imageUrl?: string;
  collapseId?: string;
}

/**
 * Sends a push notification to all subscribed users (Android devices)
 * @param payload The notification content (title, message, etc.)
 */
export const sendPushNotification = async (payload: NotificationPayload) => {
  if (!ONESIGNAL_APP_ID || !ONESIGNAL_REST_API_KEY) {
    console.error("OneSignal App ID or REST API Key is missing!");
    return { success: false, error: "Missing configuration" };
  }

  try {
    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Basic ${ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify({
        app_id: ONESIGNAL_APP_ID,
        included_segments: ["All"], // Sends to all users by default
        headings: { en: payload.title },
        contents: { en: payload.message },
        data: payload.data || {},
        big_picture: payload.imageUrl || "",
        large_icon: NOTIFICATION_ICON,
        small_icon: "ic_stat_onesignal_default",
        android_accent_color: "FFFFFFFF", // White theme as requested
        android_led_color: "FFFFFFFF",
        android_visibility: 1,
        priority: 10,
        collapse_id: payload.collapseId,
      }),
    });

    const result = await response.json();

    if (response.ok) {
      console.log("Notification sent successfully:", result);
      return { success: true, data: result };
    } else {
      console.error("Failed to send notification:", result);
      return { success: false, error: result };
    }
  } catch (error) {
    console.error("Error sending notification:", error);
    return { success: false, error: error };
  }
};

/**
 * Sends a push notification to a specific user (by their OneSignal External ID or Player ID)
 * @param userId The unique ID of the user in OneSignal
 * @param payload The notification content
 */
export const sendNotificationToUser = async (userId: string, payload: NotificationPayload) => {
  if (!ONESIGNAL_APP_ID || !ONESIGNAL_REST_API_KEY) {
    console.error("OneSignal App ID or REST API Key is missing!");
    return { success: false, error: "Missing configuration" };
  }

  try {
    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Basic ${ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify({
        app_id: ONESIGNAL_APP_ID,
        include_external_user_ids: [userId], // Targeting specific user
        headings: { en: payload.title },
        contents: { en: payload.message },
        data: payload.data || {},
        big_picture: payload.imageUrl || "",
      }),
    });

    const result = await response.json();
    return response.ok ? { success: true, data: result } : { success: false, error: result };
  } catch (error) {
    console.error("Error sending targeted notification:", error);
    return { success: false, error: error };
  }
};
