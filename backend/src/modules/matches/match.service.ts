import { prisma } from "@/config/database";
import { AppError } from "@/middlewares/error.middleware";
import { CreateMatchInput, SaveIncidentsInput, ValidatePlayerInput } from "./match.schema";

// Incluye todo lo necesario para mostrar un partido completo
const matchInclude = {
  homeTeam: {
    select: {
      id: true,
      name: true,
      disciplineId: true,
      discipline: { select: { id: true, name: true, playersPerField: true } },
    },
  },
  awayTeam: {
    select: {
      id: true,
      name: true,
      disciplineId: true,
      discipline: { select: { id: true, name: true, playersPerField: true } },
    },
  },
  category: { select: { id: true, name: true } },
  tournament: { select: { id: true, name: true } },
  group: { select: { id: true, name: true } },
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
      team: { select: { id: true, name: true } },
      assistPlayer: {
        select: { id: true, firstName: true, lastName: true },
      },
    },
    orderBy: { minute: "asc" as const },
  },
};

export class MatchService {
  static async findAll(tournamentId?: string) {
    return prisma.match.findMany({
      where: tournamentId ? { tournamentId } : undefined,
      include: {
        homeTeam: { select: { id: true, name: true } },
        awayTeam: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
        tournament: { select: { id: true, name: true } },
        group: { select: { id: true, name: true } },
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
    const [homeTeam, awayTeam] = await Promise.all([
      prisma.team.findUnique({ where: { id: input.homeTeamId } }),
      prisma.team.findUnique({ where: { id: input.awayTeamId } }),
    ]);

    if (!homeTeam) throw new AppError(404, "Equipo local no encontrado");
    if (!awayTeam) throw new AppError(404, "Equipo visitante no encontrado");

    if (homeTeam.categoryId !== awayTeam.categoryId) {
      throw new AppError(400, "Los equipos deben ser de la misma categoría");
    }

    if (homeTeam.disciplineId !== awayTeam.disciplineId) {
      throw new AppError(400, "Los equipos deben ser de la misma disciplina");
    }

    // Si es partido de torneo, verificar consistencia
    if (input.tournamentId) {
      const tournament = await prisma.tournament.findUnique({
        where: { id: input.tournamentId },
      });
      if (!tournament) throw new AppError(404, "Torneo no encontrado");
      if (tournament.categoryId !== homeTeam.categoryId)
        throw new AppError(400, "El torneo no pertenece a esta categoría");

      if (input.groupId) {
        const group = await prisma.group.findFirst({
          where: { id: input.groupId, tournamentId: input.tournamentId },
        });
        if (!group) throw new AppError(400, "El grupo no pertenece al torneo");
      }
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

    // Verifica si ya están los jugadores validados para cambiar status.
    // El umbral depende de la disciplina (11 fútbol, 5 básquet, 1 ajedrez).
    const totalValidated = await prisma.matchValidation.count({
      where: { matchId },
    });

    const homeTeam = await prisma.team.findUnique({
      where: { id: match.homeTeamId },
      include: { discipline: true },
    });
    const playersPerField = homeTeam?.discipline.playersPerField ?? 11;
    const requiredTotal = playersPerField * 2;

    if (totalValidated >= requiredTotal) {
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
          data: input.incidents.map(inc => {
            // `teamSide` es solo una instrucción de la API para derivar el teamId;
            // el modelo MatchIncident no tiene esa columna, por eso se separa.
            const { teamSide, ...rest } = inc;
            return {
              matchId,
              ...rest,
              teamId:
                inc.teamId ??
                (teamSide === "HOME" ? match.homeTeamId : match.awayTeamId),
            };
          }),
        });
      }

      const updatedMatch = await tx.match.update({
        where: { id: matchId },
        data: {
          homeScore: input.homeScore,
          awayScore: input.awayScore,
          notes: input.notes,
          status: "FINISHED",
        },
        include: matchInclude,
      });

      // Si es parte de un torneo con grupo, actualizar la tabla de posiciones
      if (match.groupId) {
        await this.updateStandings(tx, matchId, input.homeScore, input.awayScore);
      }

      return updatedMatch;
    });
  }

  private static async updateStandings(
    tx: any,
    matchId: string,
    homeScore: number | null,
    awayScore: number | null
  ) {
    const match = await tx.match.findUnique({
      where: { id: matchId },
      select: { groupId: true, homeTeamId: true, awayTeamId: true },
    });
    if (!match?.groupId) return;

    const homeGoals = homeScore ?? 0;
    const awayGoals = awayScore ?? 0;

    const homeRow = await tx.teamGroup.findUnique({
      where: {
        teamId_groupId: { teamId: match.homeTeamId, groupId: match.groupId },
      },
    });
    const awayRow = await tx.teamGroup.findUnique({
      where: {
        teamId_groupId: { teamId: match.awayTeamId, groupId: match.groupId },
      },
    });

    if (homeRow && awayRow) {
      let homePoints = homeRow.points;
      let awayPoints = awayRow.points;
      let win = 0, draw = 0, loss = 0;
      let aWin = 0, aDraw = 0, aLoss = 0;

      if (homeGoals > awayGoals) {
        homePoints += 3;
        win = 1;
        aLoss = 1;
      } else if (homeGoals < awayGoals) {
        awayPoints += 3;
        aWin = 1;
        loss = 1;
      } else {
        homePoints += 1;
        awayPoints += 1;
        draw = 1;
        aDraw = 1;
      }

      await tx.teamGroup.update({
        where: { id: homeRow.id },
        data: {
          points: homePoints,
          goalsFor: homeRow.goalsFor + homeGoals,
          goalsAgainst: homeRow.goalsAgainst + awayGoals,
          wins: homeRow.wins + win,
          draws: homeRow.draws + draw,
          losses: homeRow.losses + loss,
        },
      });
      await tx.teamGroup.update({
        where: { id: awayRow.id },
        data: {
          points: awayPoints,
          goalsFor: awayRow.goalsFor + awayGoals,
          goalsAgainst: awayRow.goalsAgainst + homeGoals,
          wins: awayRow.wins + aWin,
          draws: awayRow.draws + aDraw,
          losses: awayRow.losses + aLoss,
        },
      });
    }
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
