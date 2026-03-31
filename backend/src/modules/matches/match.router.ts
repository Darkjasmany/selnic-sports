import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { validateBody } from "../../middlewares/validate.middleware.js";
import { MatchController } from "./match.controller.js";
import { createMatchSchema, saveIncidentsSchema, validatePlayerSchema } from "./match.schema.js";

const router: Router = Router();

router.use(authenticate);

router.get("/", MatchController.getAll);
router.get("/:id", MatchController.getById);
router.get("/:id/players", MatchController.getMatchPlayers);

router.post("/", validateBody(createMatchSchema), MatchController.create);
router.post("/:id/validate", validateBody(validatePlayerSchema), MatchController.validatePlayer);
router.post("/:id/incidents", validateBody(saveIncidentsSchema), MatchController.saveIncidents);

export default router;
