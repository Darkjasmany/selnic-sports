import { authenticate, authorize } from "@/middlewares/auth.middleware";
import { validateBody } from "@/middlewares/validate.middleware";
import { Router } from "express";
import { TournamentController } from "./tournament.controller";
import {
  createTournamentSchema,
  updateTournamentSchema,
} from "./tournament.schema";

const router: Router = Router();

router.use(authenticate);

router.get("/", TournamentController.getAll);
router.get("/:id", TournamentController.getById);
router.get("/:id/standings", TournamentController.getStandings);
router.get("/:id/stats", TournamentController.getStats);
router.get("/:id/bracket", TournamentController.getBracket);

router.post(
  "/",
  authorize("ADMIN"),
  validateBody(createTournamentSchema),
  TournamentController.create
);
router.patch("/:id", authorize("ADMIN"), validateBody(updateTournamentSchema), TournamentController.update);
router.delete("/:id", authorize("ADMIN"), TournamentController.delete);

export default router;
