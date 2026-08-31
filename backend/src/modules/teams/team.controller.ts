import type { NextFunction, Request, Response } from "express";
import { CreateTeamInput, UpdateTeamInput } from "./team.schema";
import { TeamService } from "./team.service";

type TeamParams = {
  id: string;
};
export class TeamController {
  static getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Permite filtrar por categoría/disciplina: /api/teams?categoryId=xxx&disciplineId=yyy
      const { categoryId, disciplineId } = req.query as {
        categoryId?: string;
        disciplineId?: string;
      };
      const teams = await TeamService.findAll(categoryId, disciplineId);
      res.json({ success: true, data: teams });
    } catch (error) {
      next(error);
    }
  };

  static getById = async (req: Request<TeamParams>, res: Response, next: NextFunction) => {
    try {
      const team = await TeamService.findById(req.params.id);
      res.json({ success: true, data: team });
    } catch (error) {
      next(error);
    }
  };

  static create = async (
    req: Request<{}, {}, CreateTeamInput>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const team = await TeamService.create(req.body);
      res.status(201).json({ success: true, data: team });
    } catch (error) {
      next(error);
    }
  };

  static update = async (
    req: Request<{ id: string }, {}, UpdateTeamInput>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const team = await TeamService.update(req.params.id, req.body);
      res.json({ success: true, data: team });
    } catch (error) {
      next(error);
    }
  };

  static delete = async (req: Request<TeamParams>, res: Response, next: NextFunction) => {
    try {
      await TeamService.delete(req.params.id);
      res.json({ success: true, message: "Equipo eliminado correctamente" });
    } catch (error) {
      next(error);
    }
  };
}
