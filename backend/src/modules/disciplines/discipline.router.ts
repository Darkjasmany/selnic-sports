import { authenticate, authorize } from "@/middlewares/auth.middleware";
import { validateBody } from "@/middlewares/validate.middleware";
import { Router } from "express";
import { DisciplineController } from "./discipline.controller";
import {
  createDisciplineSchema,
  updateDisciplineSchema,
} from "./discipline.schema";

const router: Router = Router();

router.use(authenticate);

router.get("/", DisciplineController.getAll);
router.get("/:id", DisciplineController.getById);

router.post("/", authorize("ADMIN"), validateBody(createDisciplineSchema), DisciplineController.create);
router.patch("/:id", authorize("ADMIN"), validateBody(updateDisciplineSchema), DisciplineController.update);
router.delete("/:id", authorize("ADMIN"), DisciplineController.delete);

export default router;
