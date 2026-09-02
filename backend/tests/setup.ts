// Carga las variables de entorno del archivo .env antes de importar cualquier
// módulo que dependa de process.env (config/env.ts, config/database.ts, etc.)
import dotenv from "dotenv";
import { resolve } from "node:path";

dotenv.config({ path: resolve(process.cwd(), ".env") });
