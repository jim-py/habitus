import webpush from "web-push";
import { prisma } from "../db/prisma.js"; // поправь путь если другой

webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

export async function sendPushToAll() {
  const subs = await prisma.pushSubscription.findMany();

  for (const sub of subs) {
    const subscription = {
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.p256dh,
        auth: sub.auth,
      },
    };

    try {

      await webpush.sendNotification(
        subscription,
        JSON.stringify({
          title: "Habitus",
          body: "TEST PUSH",
        }),
      );

    } catch (err: any) {
      console.error("Error sending push notification:", err);
    }
  }
}
