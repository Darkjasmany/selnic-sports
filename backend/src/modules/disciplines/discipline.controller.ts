import { NextFunction, Request, Response } from "express";
import { CreateDisciplineInput, UpdateDisciplineInput } from "./discipline.schema";
import { DisciplineService } from "./discipline.service";

type Params = { id: string };

export class DisciplineController {
  static getAll = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const disciplines = await DisciplineService.findAll();
      res.json({ success: true, data: disciplines });
    } catch (error) {
      next(error);
    }
  };

  static getById = async (req: Request<Params>, res: Response, next: NextFunction) => {
    try {
      const discipline = await DisciplineService.findById(req.params.id);
      res.json({ success: true, data: discipline });
    } catch (error) {
      next(error);
    }
  };

  static create = async (
    req: Request<{}, {}, CreateDisciplineInput>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const discipline = await DisciplineService.create(req.body);
      res.status(201).json({ success: true, data: discipline });
    } catch (error) {
      next(error);
    }
  };

  static update = async (
    req: Request<Params, {}, UpdateDisciplineInput>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const discipline = await DisciplineService.update(req.params.id, req.body);
      res.json({ success: true, data: discipline });
    } catch (error) {
      next(error);
    }
  };

  static delete = async (req: Request<Params>, res: Response, next: NextFunction) => {
    try {
      await DisciplineService.delete(req.params.id);
      res.json({ success: true, message: "Disciplina eliminada correctamente" });
    } catch (error) {
      next(error);
    }
  };
}
