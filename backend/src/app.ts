import cors from "cors";
import express, { Application } from "express";
import helmet from "helmet";
import { errorMiddleware } from "./middlewares/error.middleware";
import authRouter from "./modules/auth/auth.router";
import categoryRouter from "./modules/categories/category.router";
import playersRouter from "./modules/players/player.router";
import teamsRouter from "./modules/teams/team.router";

const app: Application = express();

// Seguridad
app.use(helmet());

// CORS — en desarrollo acepta el origen del frontend
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production" ? "https://tu-dominio.com" : "http://localhost:5173",
    credentials: true,
  })
);

// Parseo de JSON
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Health check — para verificar que el servidor responde
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Aquí irán tus rutas cuando las vayas creando
app.use("/api/auth", authRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/teams", teamsRouter);
app.use("/api/players", playersRouter);
// app.use('/api/matches', matchesRouter)

app.use(errorMiddleware);

export default app;
