import express from "express";
import { createServer as createViteServer } from "vite";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ONESIGNAL_APP_ID = "99bf2974-08db-4721-9159-13469eaa3440";
const ONESIGNAL_REST_API_KEY = "os_v2_app_tg7ss5ai3ndsdekzcndj5kruidhzmugmuw4e6enpzfewbv2v6ogb3hbny5nrqxvc54spluwxkt4hnuiw6nkl3fwd4jeyxxvpwexalii";

const app = express();
const PORT = 3000;

app.use(express.json());

// Log all requests to debug
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Test route
app.get("/api/notifications/test", (req, res) => {
  res.json({ message: "Proxy server is working!" });
});

// OneSignal Proxy Route
app.post("/api/notifications", async (req, res) => {
  console.log("Received notification request:", req.body);
  try {
    const payload = req.body;
    
    const response = await axios.post(
      "https://onesignal.com/api/v1/notifications",
      {
        app_id: ONESIGNAL_APP_ID,
        included_segments: ["All"],
        headings: { en: payload.title },
        contents: { en: payload.message },
        data: payload.data || {},
        big_picture: payload.imageUrl || "",
        large_icon: "https://raw.githubusercontent.com/manikdataexpart10/Daily-Routine/main/icon.png",
        small_icon: "ic_stat_onesignal_default",
        android_accent_color: "FFFFFFFF",
        android_led_color: "FFFFFFFF",
        android_visibility: 1,
        priority: 10,
        collapse_id: payload.collapseId,
      },
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Basic ${ONESIGNAL_REST_API_KEY}`,
        },
      }
    );

    res.json({ success: true, ...response.data });
  } catch (error: any) {
    const errorData = error.response?.data || { error: error.message };
    console.error("OneSignal Proxy Error Detail:", JSON.stringify(errorData, null, 2));
    res.status(200).json({ success: false, ...errorData });
  }
});

// Vite middleware for development
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }
}

setupVite();

// Export for Vercel
export default app;

// Only listen if not running as a serverless function
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
