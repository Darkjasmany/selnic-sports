import { AppError } from "@/middlewares/error.middleware";
import { prisma } from "../../config/database.js";
import { CreateCategoryInput, UpdateCategoryInput } from "./category.schema";

/**
 * Reglas de negocio importantes que debes implementar en el service, no en el controller:

-findAll trae las categorías ordenadas por nombre e incluye el conteo de equipos que tiene cada una

-findById lanza AppError(404) si no existe

-create verifica que no exista otra categoría con el mismo nombre antes de crear

-update llama a findById primero para verificar que existe, luego verifica que el nuevo nombre no lo tenga otra categoría diferente

-delete llama a findById y verifica que no tenga equipos asociados antes de eliminar
 */
export class CategoryService {
  static async findAll() {
    return await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            teams: true,
          },
        },
      },
    });
  }

  static async findById(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        teams: {
          select: {
            id: true,
            name: true,
          },
          orderBy: { name: "asc" },
        },
      },
    });

    if (!category) throw new AppError(404, "Categoría no encontrada");
    return category;
  }

  static async create(input: CreateCategoryInput) {
    const exists = await prisma.category.findUnique({
      where: { name: input.name },
    });

    if (exists) throw new AppError(409, "Ya existe una categoría con ese nombre");

    return await prisma.category.create({ data: input });
  }

  static async update(id: string, input: UpdateCategoryInput) {
    await this.findById(id); // Verifica que exista

    if (input.name) {
      const exists = await prisma.category.findFirst({
        where: {
          name: input.name,
          NOT: { id },
        },
      });
      if (exists) throw new AppError(409, "Ya existe una categoría con ese nombre");
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
