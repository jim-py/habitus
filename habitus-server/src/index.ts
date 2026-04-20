import "dotenv/config";
import express from "express";
import cors from "cors";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import https from "https";
import { fileURLToPath } from "url";
import type { IncomingMessage } from "http";

import app from "./app.js";
import { prisma } from "./db/prisma.js";
import {
  generateSessionToken,
  hashPassword,
  hashToken,
  verifyPassword,
} from "./auth/auth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CERT_DIR = path.resolve(__dirname, "../certs");
const CERT_KEY_PATH = path.join(CERT_DIR, "192.168.3.63-key.pem");
const CERT_PEM_PATH = path.join(CERT_DIR, "192.168.3.63.pem");

app.use(
  cors({
    origin: [
      "https://192.168.3.63:5173",
      "https://localhost:5173",
    ],
    credentials: true,
  })
);

app.use(express.json());

app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, email, password } = req.body as {
      username?: string;
      email?: string;
      password?: string;
    };

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Заполните все поля" });
    }

    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existing) {
      return res
        .status(409)
        .json({ message: "Пользователь с таким email или username уже существует" });
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: passwordHash,
      },
    });

    const token = generateSessionToken();
    const tokenHash = hashToken(token);

    await prisma.session.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      },
    });

    res.cookie("session", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });

    return res.status(201).json({ message: "Регистрация успешна" });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return res.status(500).json({ message: "Ошибка сервера" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body as {
      username?: string;
      password?: string;
    };

    if (!username || !password) {
      return res.status(400).json({ message: "Заполните все поля" });
    }

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return res.status(401).json({ message: "Неверное имя пользователя или пароль" });
    }

    const ok = await verifyPassword(user.password, password);

    if (!ok) {
      return res.status(401).json({ message: "Неверное имя пользователя или пароль" });
    }

    const token = generateSessionToken();
    const tokenHash = hashToken(token);

    await prisma.session.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      },
    });

    res.cookie("session", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });

    return res.json({ message: "Вход выполнен" });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ message: "Ошибка сервера" });
  }
});

app.post("/api/auth/forgot", async (req, res) => {
  try {
    const { email } = req.body as { email?: string };

    if (!email) {
      return res.status(400).json({ message: "Укажите email" });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt: new Date(Date.now() + 1000 * 60 * 60),
        },
      });

      // здесь позже добавишь отправку письма
    }

    return res.json({ message: "Если email существует, ссылка отправлена" });
  } catch (err) {
    console.error("FORGOT ERROR:", err);
    return res.status(500).json({ message: "Ошибка сервера" });
  }
});

app.get("/api/auth/me", async (req, res) => {
  try {
    const cookies = parseCookies(req);
    const token = cookies.session;

    if (!token) {
      return res.status(401).json({ user: null });
    }

    const tokenHash = hashToken(token);

    const session = await prisma.session.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      return res.status(401).json({ user: null });
    }

    return res.json({
      user: {
        id: session.user.id,
        username: session.user.username,
        email: session.user.email,
        displayName: session.user.displayName ?? null,
        avatarUrl: session.user.avatarUrl ?? null,
      },
    });
  } catch (err) {
    console.error("ME ERROR:", err);
    return res.status(500).json({ user: null });
  }
});

app.post("/api/auth/logout", async (req, res) => {
  try {
    const cookies = parseCookies(req);
    const token = cookies.session;

    if (!token) {
      return res.status(401).json({ message: "Сессия не найдена" });
    }

    const tokenHash = hashToken(token);

    await prisma.session.deleteMany({
      where: { tokenHash },
    });

    res.cookie("session", "", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return res.json({ message: "Выход выполнен" });
  } catch (err) {
    console.error("LOGOUT ERROR:", err);
    return res.status(500).json({ message: "Ошибка при выходе" });
  }
});

function parseCookies(req: IncomingMessage) {
  const raw = req.headers.cookie || "";
  return raw.split(";").reduce<Record<string, string>>((acc, cookie) => {
    const [key, ...vals] = cookie.split("=");
    const name = key.trim();
    if (!name) return acc;
    acc[name] = vals.join("=").trim();
    return acc;
  }, {});
}

const port = Number(process.env.PORT ?? 3000);

const httpsOptions = {
  key: fs.readFileSync(CERT_KEY_PATH),
  cert: fs.readFileSync(CERT_PEM_PATH),
};

https.createServer(httpsOptions, app).listen(port, "0.0.0.0", () => {
  console.log(`Auth API running on https://192.168.3.63:${port}`);
});