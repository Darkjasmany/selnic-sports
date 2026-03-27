import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { validateBody } from "../../middlewares/validate.middleware.js";
import { PlayerController } from "./player.controller.js";
import { createPlayerSchema, saveBiometricSchema, updatePlayerSchema } from "./player.schema.js";

const router: Router = Router();

router.use(authenticate);

router.get("/", PlayerController.getAll);
router.get("/:id", PlayerController.getById);

router.post("/", validateBody(createPlayerSchema), PlayerController.create);
router.patch("/:id", validateBody(updatePlayerSchema), PlayerController.update);
router.post("/:id/biometric", validateBody(saveBiometricSchema), PlayerController.saveBiometric);
router.delete("/:id", PlayerController.delete);

export default router;
