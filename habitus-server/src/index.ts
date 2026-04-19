import "dotenv/config";
import express from "express";
import cors from "cors";
import crypto from "crypto";
import { prisma } from "./db/prisma";
import { IncomingMessage } from 'http';
import {
  generateSessionToken,
  hashPassword,
  hashToken,
  verifyPassword,
} from "./auth/auth";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000"],
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
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });

    return res.status(201).json({ message: "Регистрация успешна" });
  } catch {
    return res.status(500).json({ message: "Ошибка сервера" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body as {
      username?: string;
      password?: string;
    };

    // 1. Валидация
    if (!username || !password) {
      return res.status(400).json({ message: "Заполните все поля" });
    }

    // 2. Ищем пользователя по username
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return res.status(401).json({ message: "Неверное имя пользователя или пароль" });
    }

    // 3. Проверяем пароль
    const ok = await verifyPassword(user.password, password);

    if (!ok) {
      return res.status(401).json({ message: "Неверное имя пользователя или пароль" });
    }

    // 4. Создаём сессию
    const token = generateSessionToken();
    const tokenHash = hashToken(token);

    await prisma.session.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 дней
      },
    });

    // 5. Ставим cookie
    res.cookie("session", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });

    // 6. Ответ
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

      // Тут позже подключишь отправку письма
    }

    return res.json({ message: "Если email существует, ссылка отправлена" });
  } catch {
    return res.status(500).json({ message: "Ошибка сервера" });
  }
});

app.get("/api/auth/me", async (req, res) => {
  try {
    const cookies = parseCookies(req);
    const token = cookies['session'];
    
    if (!token) {
      return res.status(401).json({ user: null });
    }

    const tokenHash = hashToken(token);

    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
    await delay(500);

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
        email: session.user.email
      },
    });
  } catch {
    return res.status(500).json({ user: null });
  }
});

app.post("/api/auth/logout", async (req, res) => {
  try {
    const cookies = parseCookies(req);
    const token = cookies["session"];

    if (!token) {
      return res.status(401).json({ message: "Сессия не найдена" });
    }

    const tokenHash = hashToken(token);

    // Удаляем сессию из базы
    await prisma.session.deleteMany({
      where: { tokenHash },
    });

    // Сбрасываем куки
    res.cookie("session", "", {
      httpOnly: true,
      secure: false,
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
  const raw = req.headers.cookie || '';
  return raw.split(';').reduce<Record<string, string>>((acc, cookie) => {
    const [key, ...vals] = cookie.split('=');
    acc[key.trim()] = vals.join('=').trim();
    return acc;
  }, {});
}

const port = Number(process.env.PORT ?? 3000);

app.listen(port, "0.0.0.0", () => {
  console.log(`Auth API running on http://localhost:${port}`);
});