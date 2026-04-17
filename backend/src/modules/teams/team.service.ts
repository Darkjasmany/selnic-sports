import { prisma } from "@/config/database";
import { AppError } from "@/middlewares/error.middleware";
import { CreateTeamInput, UpdateTeamInput } from "./team.schema";

export class TeamService {
  static async findAll1(categoryId?: string) {
    return prisma.team.findMany({
      where: categoryId ? { categoryId } : undefined,
      orderBy: { name: "asc" },
      include: {
        category: { select: { id: true, name: true } },
        _count: { select: { players: true } },
      },
    });
  }

  static async findAll(categoryId?: string) {
    const teams = await prisma.team.findMany({
      where: categoryId ? { categoryId } : undefined,
      orderBy: { name: "asc" },
      include: {
        category: { select: { id: true, name: true } },
        players: {
          select: {
            isActive: true, // Este es el isActive de la tabla TeamPlayer (la relación)
            player: {
              select: {
                isActive: true, // Este es el isActive de la tabla Player (el maestro)
              },
            },
          },
        },
      },
    });

    return teams.map(team => {
      // 1. Total: Jugadores que están vinculados activamente a este equipo
      const playersInTeam = team.players.filter(p => p.isActive);
      const totalPlayers = playersInTeam.length;

      // 2. Activos: De esos vinculados, cuántos tienen su perfil de Jugador activo
      const activePlayers = playersInTeam.filter(p => p.player.isActive).length;

      // Extraemos 'players' para no enviar todo el objeto anidado al frontend
      const { players, ...teamData } = team;

      return {
        ...teamData,
        stats: {
          active: activePlayers,
          total: totalPlayers,
        },
      };
    });
  }

  static async findById(id: string) {
    const team = await prisma.team.findUnique({
      where: {
        id,
      },
      include: {
        category: {
          select: { id: true, name: true },
        },
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
    const category = await prisma.category.findUnique({ where: { id: input.categoryId } });
    if (!category) throw new AppError(404, "Categoría no encontrada");

    const exists = await prisma.team.findFirst({
      where: {
        name: input.name,
        categoryId: input.categoryId,
      },
    });
    if (exists) throw new AppError(409, "Ya existe un equipo con ese nombre en esta categoría");

    return await prisma.team.create({
      data: input,
      include: {
        category: { select: { id: true, name: true } },
      },
    });
  }

  static async update(id: string, input: UpdateTeamInput) {
    const team = await this.findById(id);

    if (input.name || input.categoryId) {
      const categoryId = input.categoryId ?? team.categoryId;
      const name = input.name ?? team.name;

      const exists = await prisma.team.findFirst({
        where: { name, categoryId, NOT: { id } },
      });
      if (exists) throw new AppError(409, "Ya existe un equipo con ese nombre en esta categoría");
    }

    return prisma.team.update({
      where: { id },
      data: input,
      include: {
        category: { select: { id: true, name: true } },
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
