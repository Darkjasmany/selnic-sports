import { NextFunction, Request, Response } from "express";
import { CreateCategoryInput, UpdateCategoryInput } from "./category.schema";
import { CategoryService } from "./category.service";

type CategoryParams = {
  id: string;
};

export class CategoryController {
  static gellAll = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const category = await CategoryService.findAll();
      res.json({ success: true, data: category });
    } catch (error) {
      next(error);
    }
  };

  static getbyId = async (req: Request<CategoryParams>, res: Response, next: NextFunction) => {
    try {
      const category = await CategoryService.findById(req.params.id);
      res.json({ success: true, data: category });
    } catch (error) {
      next(error);
    }
  };

  static create = async (
    req: Request<{}, {}, CreateCategoryInput>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const category = await CategoryService.create(req.body);
      res.status(201).json({ success: true, data: category });
    } catch (error) {
      next(error);
    }
  };

  static update = async (
    req: Request<{ id: string }, {}, UpdateCategoryInput>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const category = await CategoryService.update(req.params.id, req.body);
      res.json({ success: true, data: category });
    } catch (error) {
      next(error);
    }
  };

  static delete = async (req: Request<CategoryParams>, res: Response, next: NextFunction) => {
    try {
      await CategoryService.delete(req.params.id);
      res.json({ success: true, message: "Categoría eliminada correctamente" });
    } catch (error) {
      next(error);
    }
  };
}
