import express from "express";
import cors from "cors";
import pushRoutes from "./routes/push.routes.js";

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());

app.use("/push", pushRoutes);

export default app;