import { Router } from "express";
import { prisma } from "../db/prisma.js";
import webpush from "../push/webpush.js";
import { sendPushToAll } from "../push/send.js";

const router = Router();

/**
 * Сохранение подписки
 */
router.post("/subscribe", async (req, res) => {
  const { userId, subscription } = req.body;

  const { endpoint, keys } = subscription;

  await prisma.pushSubscription.upsert({
    where: { endpoint },
    update: {
      p256dh: keys.p256dh,
      auth: keys.auth,
    },
    create: {
      userId,
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
    },
  });

  res.json({ ok: true });
});

/**
 * Тестовая отправка уведомления
 */
router.post("/send", async (req, res) => {
  const { userId, title, body } = req.body;

  const subs = await prisma.pushSubscription.findMany({
    where: { userId },
  });

  await Promise.all(
    subs.map((sub) =>
      webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        },
        JSON.stringify({
          title,
          body,
          url: "/",
        })
      )
    )
  );

  res.json({ sent: subs.length });
});

router.get("/send-test", async (req, res) => {
  try {
    await sendPushToAll();
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "push failed" });
  }
});

export default router;