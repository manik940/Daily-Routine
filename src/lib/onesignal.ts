const ONESIGNAL_APP_ID = "99bf2974-08db-4721-9159-13469eaa3440";
const ONESIGNAL_API_KEY = "os_v2_app_tg7ss5ai3ndsdekzcndj5kruidyc5o7k6epuia5txi5gzy2nzvuddtiz5tezg3bbmukevhcnbhbgwd4q3rm54pbgw2g7ium32ovymty";

export async function scheduleNotification(userId: string, taskTitle: string, sendAfter: string) {
  try {
    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${ONESIGNAL_API_KEY}`
      },
      body: JSON.stringify({
        app_id: ONESIGNAL_APP_ID,
        include_external_user_ids: [userId], // Targeting specific user
        contents: { en: `Time for: ${taskTitle}`, bn: `সময় হয়েছে: ${taskTitle}` },
        headings: { en: "Daily Routine Task", bn: "ডেইলি রুটিন কাজ" },
        send_after: sendAfter, // Format: "2025-09-24 14:00:00 GMT-0700"
      })
    });
    const data = await response.json();
    console.log("Notification Scheduled:", data);
  } catch (error) {
    console.error("Error scheduling notification:", error);
  }
}
