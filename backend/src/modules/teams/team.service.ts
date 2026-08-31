import { prisma } from "@/config/database";
import { AppError } from "@/middlewares/error.middleware";
import { CreateTeamInput, UpdateTeamInput } from "./team.schema";

export class TeamService {
  static async findAll(categoryId?: string, disciplineId?: string) {
    const teams = await prisma.team.findMany({
      where: {
        AND: [
          categoryId ? { categoryId } : {},
          disciplineId ? { disciplineId } : {},
        ],
      },
      orderBy: { name: "asc" },
      include: {
        category: { select: { id: true, name: true } },
        discipline: { select: { id: true, name: true } },
        players: {
          select: {
            isActive: true,
            player: { select: { isActive: true } },
          },
        },
      },
    });

    return teams.map(team => {
      const playersInTeam = team.players.filter(p => p.isActive);
      const totalPlayers = playersInTeam.length;
      const activePlayers = playersInTeam.filter(p => p.player.isActive).length;
      const { players, ...teamData } = team;
      return {
        ...teamData,
        stats: { active: activePlayers, total: totalPlayers },
      };
    });
  }

  static async findById(id: string) {
    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true } },
        discipline: { select: { id: true, name: true } },
        players: {
          where: { isActive: true },
          include: {
            player: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                documentId: true,
                photoUrl: true,
              },
            },
          },
          orderBy: { joinedAt: "asc" },
        },
      },
    });
    if (!team) throw new AppError(404, "Equipo no encontrado");
    return team;
  }

  static async create(input: CreateTeamInput) {
    const category = await prisma.category.findUnique({
      where: { id: input.categoryId },
    });
    if (!category) throw new AppError(404, "Categoría no encontrada");

    const discipline = await prisma.discipline.findUnique({
      where: { id: input.disciplineId },
    });
    if (!discipline) throw new AppError(404, "Disciplina no encontrada");

    if (category.disciplineId !== input.disciplineId)
      throw new AppError(400, "La categoría no pertenece a esa disciplina");

    const exists = await prisma.team.findFirst({
      where: {
        name: input.name,
        disciplineId: input.disciplineId,
        categoryId: input.categoryId,
      },
    });
    if (exists)
      throw new AppError(409, "Ya existe un equipo con ese nombre en esta categoría");

    return await prisma.team.create({
      data: input,
      include: {
        category: { select: { id: true, name: true } },
        discipline: { select: { id: true, name: true } },
      },
    });
  }

  static async update(id: string, input: UpdateTeamInput) {
    const team = await this.findById(id);
    if (input.name || input.categoryId || input.disciplineId) {
      const categoryId = input.categoryId ?? team.categoryId;
      const disciplineId = input.disciplineId ?? team.disciplineId;
      const name = input.name ?? team.name;
      const exists = await prisma.team.findFirst({
        where: { name, disciplineId, categoryId, NOT: { id } },
      });
      if (exists)
        throw new AppError(
          409,
          "Ya existe un equipo con ese nombre en esta categoría"
        );
    }
    return prisma.team.update({
      where: { id },
      data: input,
      include: {
        category: { select: { id: true, name: true } },
        discipline: { select: { id: true, name: true } },
      },
    });
  }

  static async delete(id: string) {
    const team = await this.findById(id);
    if (team.players.length > 0)
      throw new AppError(
        409,
        `No se puede eliminar — tiene ${team.players.length} jugador(es) activo(s)`
      );
    return prisma.team.delete({ where: { id } });
  }
}
