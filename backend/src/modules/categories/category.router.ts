import { authenticate, authorize } from "@/middlewares/auth.middleware";
import { validateBody } from "@/middlewares/validate.middleware";
import { Router } from "express";
import { CategoryController } from "./category.controller";
import { updateCategorySchema } from "./category.schema";

const router: Router = Router();

router.use(authenticate); // Aplica autenticación a todas las rutas de categorías

router.get("/", CategoryController.gellAll);
router.get("/:id", CategoryController.getbyId);

router.post("/", authorize("ADMIN"), CategoryController.create);

router.patch(
  "/:id",
  authorize("ADMIN"),
  validateBody(updateCategorySchema),
  CategoryController.update
);

router.delete("/:id", authorize("ADMIN"), CategoryController.delete);

export default router;
