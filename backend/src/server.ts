import { env } from "./config/env";

// Importar env primero, antes que cualquier otra cosa
// para que valide las variables antes de que Prisma u otros módulos arranquen

import app from "./app";
import { prisma } from "./config/database";

const startServer = async () => {
  try {
    // Verifica conexión a la BD antes de arrancar
    await prisma.$connect();
    console.log("✅ Conectado a PostgreSQL");

    app.listen(env.PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${env.PORT}`);
      console.log(`📋 Ambiente: ${env.NODE_ENV}`);
      console.log(`🏥 Health check: http://localhost:${env.PORT}/health`);
    });
  } catch (error) {
    console.error("❌ Error al arrancar el servidor:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

// Manejo de errores no capturados
process.on("unhandledRejection", reason => {
  console.error("❌ Unhandled Rejection:", reason);
  process.exit(1);
});

process.on("uncaughtException", error => {
  console.error("❌ Uncaught Exception:", error);
  process.exit(1);
});

startServer();
