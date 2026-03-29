import { prisma } from "@/config/database";
import { AppError } from "@/middlewares/error.middleware";
import type { NextFunction, Request, Response } from "express";
import { CreatePlayerInput, SaveBiometricInput, UpdatePlayerInput } from "./player.schema";
import { PlayerService } from "./player.service";

type PlayerParams = {
  id: string;
};
export class PlayerController {
  static getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { search, teamId } = req.query as { search?: string; teamId?: string };
      const players = await PlayerService.findAll(search, teamId);
      res.json({ success: true, data: players });
    } catch (error) {
      next(error);
    }
  };

  static getById = async (req: Request<PlayerParams>, res: Response, next: NextFunction) => {
    try {
      const player = await PlayerService.findById(req.params.id);
      res.json({ success: true, data: player });
    } catch (error) {
      next(error);
    }
  };

  static create = async (
    req: Request<{}, {}, CreatePlayerInput>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const player = await PlayerService.create(req.body);
      res.status(201).json({ success: true, data: player });
    } catch (error) {
      next(error);
    }
  };

  static update = async (
    req: Request<PlayerParams, {}, UpdatePlayerInput>,
    res: Response,
    next: NextFunction
  ) => {
    const player = await PlayerService.update(req.params.id, req.body);
    res.json({ success: true, data: player });
    try {
    } catch (error) {
      next(error);
    }
  };

  static saveBiometric = async (
    req: Request<PlayerParams, {}, SaveBiometricInput>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const player = PlayerService.saveBiometric(req.params.id, req.body);
      res.json({ success: true, data: player });
    } catch (error) {
      next(error);
    }
  };

  static delete = async (req: Request<PlayerParams>, res: Response, next: NextFunction) => {
    try {
      await PlayerService.delete(req.params.id);
      res.json({ success: true, message: "Jugador eliminado correctamente" });
    } catch (error) {
      next(error);
    }
  };

  static uploadPhoto = async (req: Request<PlayerParams>, res: Response, next: NextFunction) => {
    try {
      if (!req.file) throw new AppError(400, "No se ha cargado ninguna imagen");

      const photoUrl = `/uploads/players/${req.file.filename}`;

      const player = await prisma.player.update({
        where: { id: req.params.id },
        data: { photoUrl },
      });

      res.json({ success: true, data: { photoUrl: player.photoUrl } });
    } catch (error) {
      next(error);
    }
  };
}
