import type { NextFunction, Request, Response } from "express";
import { CreateTournamentInput, UpdateTournamentInput } from "./tournament.schema";
import { TournamentService } from "./tournament.service";

type Params = { id: string };

export class TournamentController {
  static getAll = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const tournaments = await TournamentService.findAll();
      res.json({ success: true, data: tournaments });
    } catch (error) {
      next(error);
    }
  };

  static getById = async (req: Request<Params>, res: Response, next: NextFunction) => {
    try {
      const tournament = await TournamentService.findById(req.params.id);
      res.json({ success: true, data: tournament });
    } catch (error) {
      next(error);
    }
  };

  static create = async (
    req: Request<{}, {}, CreateTournamentInput>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const tournament = await TournamentService.create(req.body);
      res.status(201).json({ success: true, data: tournament });
    } catch (error) {
      next(error);
    }
  };

  static update = async (
    req: Request<Params, {}, UpdateTournamentInput>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const tournament = await TournamentService.update(req.params.id, req.body);
      res.json({ success: true, data: tournament });
    } catch (error) {
      next(error);
    }
  };

  static delete = async (req: Request<Params>, res: Response, next: NextFunction) => {
    try {
      await TournamentService.delete(req.params.id);
      res.json({ success: true, message: "Torneo eliminado correctamente" });
    } catch (error) {
      next(error);
    }
  };

  static getStandings = async (req: Request<Params>, res: Response, next: NextFunction) => {
    try {
      const standings = await TournamentService.getStandings(req.params.id);
      res.json({ success: true, data: standings });
    } catch (error) {
      next(error);
    }
  };

  static getStats = async (req: Request<Params>, res: Response, next: NextFunction) => {
    try {
      const stats = await TournamentService.getStats(req.params.id);
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  };

  static getBracket = async (req: Request<Params>, res: Response, next: NextFunction) => {
    try {
      const bracket = await TournamentService.getBracket(req.params.id);
      res.json({ success: true, data: bracket });
    } catch (error) {
      next(error);
    }
  };
}
