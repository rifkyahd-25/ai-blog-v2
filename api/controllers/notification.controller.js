import { Expo } from "expo-server-sdk";
import PushToken from "../models/pushToken.model.js";

// No API key/account needed for Expo's push service itself — it's free.
// (Optional: set EXPO_ACCESS_TOKEN as an env var later for enhanced push
// security once you have real users; not required to get this working.)
const expo = new Expo();

// POST /api/notifications/register  { token, platform }
// Called by the app on every launch — upsert so re-installs / re-launches
// don't create duplicate rows.
export const registerPushToken = async (req, res, next) => {
  try {
    const { token, platform } = req.body;

    if (!token || !Expo.isExpoPushToken(token)) {
      return res.status(400).json({ message: "Invalid Expo push token." });
    }

    await PushToken.findOneAndUpdate(
      { token },
      { token, platform: platform ?? "android" },
      { upsert: true, new: true }
    );

    res.status(200).json({ ok: true });
  } catch (error) {
    next(error);
  }
};

/**
 * Call this right after a post is saved — see the one line added in
 * post.controller.js's `create` function. Fans the notification out to
 * every saved device. Safe to call even with zero tokens, or stale ones.
 */
export async function sendNewPostPush(post) {
  const devices = await PushToken.find({}, "token");
  if (devices.length === 0) return;

  const messages = [];
  for (const { token } of devices) {
    if (!Expo.isExpoPushToken(token)) continue;
    messages.push({
      to: token,
      sound: "default",
      title: "New post on AI Blog",
      body: post.title,
      data: { slug: post.slug },
    });
  }

  const chunks = expo.chunkPushNotifications(messages);

  for (const chunk of chunks) {
    try {
      const tickets = await expo.sendPushNotificationsAsync(chunk);

      // Clean up tokens for uninstalled apps / revoked permissions right away.
      for (let i = 0; i < tickets.length; i++) {
        const ticket = tickets[i];
        if (ticket.status === "error" && ticket.details?.error === "DeviceNotRegistered") {
          await PushToken.deleteOne({ token: chunk[i].to });
        }
      }
    } catch (err) {
      console.error("Push chunk failed:", err);
      // Don't let a push failure block the post-creation response.
    }
  }
}
