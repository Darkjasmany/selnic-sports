import cors from "cors";
import express, { Application } from "express";
import helmet from "helmet";
import { join } from "node:path";
import { errorMiddleware } from "./middlewares/error.middleware";
import adminRouter from "./modules/admin/admin.router";
import authRouter from "./modules/auth/auth.router";
import categoryRouter from "./modules/categories/category.router";
import disciplineRouter from "./modules/disciplines/discipline.router";
import matchRouter from "./modules/matches/match.router.js";
import playersRouter from "./modules/players/player.router";
import teamsRouter from "./modules/teams/team.router";
import tournamentRouter from "./modules/tournaments/tournament.router";

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

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Permite cargar recursos de otro origen
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "img-src": ["'self'", "data:", "http://localhost:3000"], // Añade tu URL de backend
      },
    },
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
app.use("/api/disciplines", disciplineRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/teams", teamsRouter);
app.use("/api/players", playersRouter);
app.use("/api/matches", matchRouter);
app.use("/api/tournaments", tournamentRouter);
app.use("/api/admin/users", adminRouter);

// Fotos estáticas
// Sirve los uploads desde la raíz, NO desde /api
app.use("/uploads", express.static(join(process.cwd(), "uploads")));

app.use(errorMiddleware);

export default app;
