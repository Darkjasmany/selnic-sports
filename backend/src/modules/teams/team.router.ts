import { authenticate, authorize } from "@/middlewares/auth.middleware";
import { Router } from "express";
import { validateBody } from "../../middlewares/validate.middleware.js";
import { TeamController } from "./team.controller";
import { createTeamSchema, updateTeamSchema } from "./team.schema.js";

const router: Router = Router();

router.use(authenticate); // Todas las rutas requieren autenticación

router.get("/", TeamController.getAll);
router.get("/:id", TeamController.getById);

router.post("/", authorize("ADMIN"), validateBody(createTeamSchema), TeamController.create);

router.patch("/:id", authorize("ADMIN"), validateBody(updateTeamSchema), TeamController.update);

router.delete("/:id", authorize("ADMIN"), TeamController.delete);

export default router;
