import type { NextFunction, Request, Response } from "express";
import type { CreateMatchInput, SaveIncidentsInput, ValidatePlayerInput } from "./match.schema.js";
import { MatchService } from "./match.service.js";

type MatchParams = {
  id: string;
};

export class MatchController {
  static getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tournamentId } = req.query as { tournamentId?: string };
      const matches = await MatchService.findAll(tournamentId);
      res.json({ success: true, data: matches });
    } catch (error) {
      next(error);
    }
  };

  static getById = async (req: Request<MatchParams>, res: Response, next: NextFunction) => {
    try {
      const match = await MatchService.findById(req.params.id);
      res.json({ success: true, data: match });
    } catch (error) {
      next(error);
    }
  };

  static getMatchPlayers = async (req: Request<MatchParams>, res: Response, next: NextFunction) => {
    try {
      const players = await MatchService.getMatchPlayers(req.params.id);
      res.json({ success: true, data: players });
    } catch (error) {
      next(error);
    }
  };

  static create = async (
    req: Request<{}, {}, CreateMatchInput>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const match = await MatchService.create(req.body);
      res.status(201).json({ success: true, data: match });
    } catch (error) {
      next(error);
    }
  };

  static validatePlayer = async (
    req: Request<MatchParams, {}, ValidatePlayerInput>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const validation = await MatchService.validatePlayer(req.params.id, req.body);
      res.json({ success: true, data: validation });
    } catch (error) {
      next(error);
    }
  };

  static saveIncidents = async (
    req: Request<MatchParams, {}, SaveIncidentsInput>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const match = await MatchService.saveIncidents(req.params.id, req.body);
      res.json({ success: true, data: match });
    } catch (error) {
      next(error);
    }
  };
}
