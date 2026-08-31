import { prisma } from "@/config/database";
import { AppError } from "@/middlewares/error.middleware";
import { CreateDisciplineInput, UpdateDisciplineInput } from "./discipline.schema";

export class DisciplineService {
  static async findAll() {
    return prisma.discipline.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { categories: true, teams: true, tournaments: true },
        },
      },
    });
  }

  static async findById(id: string) {
    const discipline = await prisma.discipline.findUnique({
      where: { id },
      include: {
        categories: { orderBy: { name: "asc" } },
        teams: { select: { id: true, name: true } },
      },
    });
    if (!discipline) throw new AppError(404, "Disciplina no encontrada");
    return discipline;
  }

  static async create(input: CreateDisciplineInput) {
    const exists = await prisma.discipline.findUnique({ where: { name: input.name } });
    if (exists) throw new AppError(409, "Ya existe una disciplina con ese nombre");

    return prisma.discipline.create({ data: input });
  }

  static async update(id: string, input: UpdateDisciplineInput) {
    await this.findById(id);
    if (input.name) {
      const exists = await prisma.discipline.findFirst({
        where: { name: input.name, NOT: { id } },
      });
      if (exists) throw new AppError(409, "Ya existe una disciplina con ese nombre");
    }
    return prisma.discipline.update({
      where: { id },
      data: input,
    });
  }

  static async delete(id: string) {
    const discipline = await this.findById(id);
    if (discipline.categories.length > 0)
      throw new AppError(
        409,
        `No se puede eliminar — tiene ${discipline.categories.length} categoría(s) asociada(s)`
      );
    return prisma.discipline.delete({ where: { id } });
  }
}
