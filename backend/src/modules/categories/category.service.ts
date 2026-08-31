import { AppError } from "@/middlewares/error.middleware";
import { prisma } from "../../config/database.js";
import {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "./category.schema";

export class CategoryService {
  static async findAll(disciplineId?: string) {
    return await prisma.category.findMany({
      where: disciplineId ? { disciplineId } : undefined,
      orderBy: { name: "asc" },
      include: {
        _count: { select: { teams: true } },
        discipline: { select: { id: true, name: true } },
      },
    });
  }

  static async findById(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        teams: {
          select: { id: true, name: true },
          orderBy: { name: "asc" },
        },
        discipline: { select: { id: true, name: true } },
      },
    });
    if (!category) throw new AppError(404, "Categoría no encontrada");
    return category;
  }

  static async create(input: CreateCategoryInput) {
    const discipline = await prisma.discipline.findUnique({
      where: { id: input.disciplineId },
    });
    if (!discipline) throw new AppError(404, "Disciplina no encontrada");

    const exists = await prisma.category.findUnique({
      where: {
        disciplineId_name: {
          disciplineId: input.disciplineId,
          name: input.name,
        },
      },
    });
    if (exists)
      throw new AppError(409, "Ya existe una categoría con ese nombre en esta disciplina");

    return await prisma.category.create({ data: input });
  }

  static async update(id: string, input: UpdateCategoryInput) {
    const category = await this.findById(id);
    if (input.name || input.disciplineId) {
      const disciplineId = input.disciplineId ?? category.disciplineId;
      const name = input.name ?? category.name;
      const exists = await prisma.category.findFirst({
        where: {
          disciplineId,
          name,
          NOT: { id },
        },
      });
      if (exists)
        throw new AppError(
          409,
          "Ya existe una categoría con ese nombre en esta disciplina"
        );
    }
    return await prisma.category.update({ where: { id }, data: input });
  }

  static async delete(id: string) {
    const category = await this.findById(id);
    if (category.teams.length > 0)
      throw new AppError(
        409,
        `No se puede eliminar — tiene ${category.teams.length} equipo(s) asociado(s)`
      );
    return await prisma.category.delete({ where: { id } });
  }
}
