import { prisma } from "@/config/database";
import { AppError } from "@/middlewares/error.middleware";
import { CreateMatchInput, SaveIncidentsInput, ValidatePlayerInput } from "./match.schema";

// Incluye todo lo necesario para mostrar un partido completo
const matchInclude = {
  homeTeam: { select: { id: true, name: true } },
  awayTeam: { select: { id: true, name: true } },
  category: { select: { id: true, name: true } },
  validations: {
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
  },
  incidents: {
    include: {
      player: {
        select: { id: true, firstName: true, lastName: true },
      },
    },
    orderBy: { minute: "asc" as const },
  },
};

export class MatchService {
  static async findAll() {
    return prisma.match.findMany({
      include: {
        homeTeam: { select: { id: true, name: true } },
        awayTeam: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
        _count: { select: { validations: true } },
      },
      orderBy: { scheduledAt: "desc" },
    });
  }

  static async findById(id: string) {
    const match = await prisma.match.findUnique({
      where: { id },
      include: matchInclude,
    });
    if (!match) throw new AppError(404, "Partido no encontrado");
    return match;
  }

  static async create(input: CreateMatchInput) {
    // Verifica que los equipos existen y son de la misma categoría
    const [homeTeam, awayTeam] = await Promise.all([
      prisma.team.findUnique({ where: { id: input.homeTeamId } }),
      prisma.team.findUnique({ where: { id: input.awayTeamId } }),
    ]);

    if (!homeTeam) throw new AppError(404, "Equipo local no encontrado");
    if (!awayTeam) throw new AppError(404, "Equipo visitante no encontrado");

    if (homeTeam.categoryId !== awayTeam.categoryId) {
      throw new AppError(400, "Los equipos deben ser de la misma categoría");
    }

    return prisma.match.create({
      data: {
        ...input,
        scheduledAt: new Date(input.scheduledAt),
        status: "VALIDATING_PLAYERS",
      },
      include: matchInclude,
    });
  }

  static async validatePlayer(matchId: string, input: ValidatePlayerInput) {
    const match = await this.findById(matchId);

    if (match.status === "FINISHED") {
      throw new AppError(400, "El partido ya está finalizado");
    }

    // Verifica que el jugador pertenece al equipo correcto
    const teamId = input.teamSide === "HOME" ? match.homeTeamId : match.awayTeamId;

    const teamPlayer = await prisma.teamPlayer.findFirst({
      where: { playerId: input.playerId, teamId, isActive: true },
    });

    if (!teamPlayer) {
      throw new AppError(400, "El jugador no pertenece a este equipo");
    }

    // Verifica que el jugador tiene biométrico registrado
    const player = await prisma.player.findUnique({
      where: { id: input.playerId },
    });

    if (!player?.biometricData) {
      throw new AppError(400, "El jugador no tiene biométrico registrado");
    }

    // Aquí iría la comparación de descriptores faciales
    // Por ahora guardamos la validación directamente
    // En el frontend se compara antes de llamar este endpoint
    const validation = await prisma.matchValidation.upsert({
      where: {
        matchId_playerId: { matchId, playerId: input.playerId },
      },
      create: {
        matchId,
        playerId: input.playerId,
        teamSide: input.teamSide,
      },
      update: { validatedAt: new Date() },
      include: {
        player: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            photoUrl: true,
          },
        },
      },
    });

    // Verifica si ya están los 22 validados para cambiar status
    const totalValidated = await prisma.matchValidation.count({
      where: { matchId },
    });

    // !! Numero de jugadores para validar eran 22
    if (totalValidated >= 2) {
      await prisma.match.update({
        where: { id: matchId },
        data: { status: "IN_PROGRESS" },
      });
    }

    return validation;
  }

  static async saveIncidents(matchId: string, input: SaveIncidentsInput) {
    const match = await this.findById(matchId);

    if (match.status === "FINISHED") {
      throw new AppError(400, "El partido ya está finalizado");
    }

    if (match.status !== "IN_PROGRESS") {
      throw new AppError(400, "Debes validar los 22 jugadores antes de registrar incidencias");
    }

    // Transacción: borra incidencias anteriores y guarda las nuevas
    return prisma.$transaction(async tx => {
      await tx.matchIncident.deleteMany({ where: { matchId } });

      if (input.incidents.length > 0) {
        await tx.matchIncident.createMany({
          data: input.incidents.map(inc => ({ matchId, ...inc })),
        });
      }

      return tx.match.update({
        where: { id: matchId },
        data: {
          homeScore: input.homeScore,
          awayScore: input.awayScore,
          notes: input.notes,
          status: "FINISHED",
        },
        include: matchInclude,
      });
    });
  }

  static async getMatchPlayers(matchId: string) {
    const match = await this.findById(matchId);

    const [homePlayers, awayPlayers] = await Promise.all([
      prisma.teamPlayer.findMany({
        where: { teamId: match.homeTeamId, isActive: true },
        include: {
          player: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              documentId: true,
              photoUrl: true,
              biometricData: true,
            },
          },
        },
      }),
      prisma.teamPlayer.findMany({
        where: { teamId: match.awayTeamId, isActive: true },
        include: {
          player: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              documentId: true,
              photoUrl: true,
              biometricData: true,
            },
          },
        },
      }),
    ]);

    return {
      home: homePlayers.map(tp => tp.player),
      away: awayPlayers.map(tp => tp.player),
    };
  }
}
