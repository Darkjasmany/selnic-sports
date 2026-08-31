import { prisma } from "@/config/database";
import { AppError } from "@/middlewares/error.middleware";
import { CreatePlayerInput, SaveBiometricInput, UpdatePlayerInput } from "./player.schema";

export class PlayerService {
  static async findAll(search?: string, teamId?: string, disciplineId?: string) {
    return prisma.player.findMany({
      where: {
        // isActive: true;
        AND: [
          teamId ? { teams: { some: { teamId, isActive: true } } } : {},
          disciplineId ? { disciplineId } : {},
          search
            ? {
                OR: [
                  { firstName: { contains: search, mode: "insensitive" } },
                  { lastName: { contains: search, mode: "insensitive" } },
                  { documentId: { contains: search, mode: "insensitive" } },
                ],
              }
            : {},
        ],
      },
      include: {
        // 1. Entra a la tabla intermedia TeamPlayer
        teams: {
          where: { isActive: true },
          include: {
            // 2. De TeamPlayer, salta a la tabla Team
            team: {
              include: {
                // 3. De Team, salta a la tabla Category
                // 4. De la categoría, solo trae estos dos campos
                category: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    });
  }

  static async findById(id: string) {
    const player = await prisma.player.findUnique({
      where: { id },
      include: {
        teams: {
          where: { isActive: true },
          include: {
            team: {
              include: {
                category: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
    });
    if (!player) throw new AppError(404, "Jugador no encontrado");
    return player;
  }

  static async create(input: CreatePlayerInput) {
    const { teamId, ...playerData } = input;

    const exists = await prisma.player.findUnique({
      where: { documentId: playerData.documentId },
    });
    if (exists) throw new AppError(409, "Ya existe un jugador con esa cédula");

    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team) throw new AppError(404, "Equipo no encontrado");

    if (playerData.disciplineId && team.disciplineId !== playerData.disciplineId)
      throw new AppError(400, "La disciplina del jugador no coincide con la del equipo");

    const createData: any = {
      ...playerData,
      disciplineId: playerData.disciplineId ?? team.disciplineId,
      birthDate: new Date(playerData.birthDate),
      teams: {
        create: { teamId },
      },
    };

    return prisma.player.create({
      data: createData,
      include: {
        teams: {
          include: {
            team: {
              include: {
                category: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
    });
  }

  static async update(id: string, input: UpdatePlayerInput) {
    await this.findById(id);

    const { teamId, ...playerData } = input;

    if (playerData.documentId) {
      const exists = await prisma.player.findFirst({
        where: { documentId: playerData.documentId, NOT: { id } },
      });
      if (exists) throw new AppError(409, "Ya existe un jugador con esa cédula");
    }

    const updateData: any = { ...playerData };
    if (playerData.birthDate) {
      updateData.birthDate = new Date(playerData.birthDate);
    }

    if (teamId) {
      const newTeam = await prisma.team.findUnique({ where: { id: teamId } });
      if (!newTeam) throw new AppError(404, "Equipo no encontrado");
      if (playerData.disciplineId && newTeam.disciplineId !== playerData.disciplineId)
        throw new AppError(400, "La disciplina del jugador no coincide con la del equipo");
      if (!updateData.disciplineId) updateData.disciplineId = newTeam.disciplineId;

      await prisma.teamPlayer.updateMany({
        where: { playerId: id, isActive: true },
        data: { isActive: false },
      });
      await prisma.teamPlayer.upsert({
        where: { teamId_playerId: { teamId, playerId: id } },
        create: { teamId, playerId: id, isActive: true },
        update: { isActive: true },
      });
    }

    return prisma.player.update({
      where: { id },
      data: updateData,
      include: {
        teams: {
          where: { isActive: true },
          include: {
            team: {
              include: {
                category: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
    });
  }

  static async saveBiometric(id: string, input: SaveBiometricInput) {
    await this.findById(id);
    return prisma.player.update({
      where: { id },
      data: {
        biometricData: input.biometricData,
        biometricType: input.biometricType,
      },
    });
  }

  static async delete(id: string) {
    await this.findById(id);
    return prisma.player.delete({ where: { id } });
  }
}
