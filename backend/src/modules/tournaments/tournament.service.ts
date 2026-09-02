import { prisma } from "@/config/database";
import { AppError } from "@/middlewares/error.middleware";
import {
  CreateTournamentInput,
  UpdateTournamentInput,
} from "./tournament.schema";
import { generateGroupPhase } from "./calendar.service";
import { StandingsService } from "./standings.service";
import { StatisticsService } from "./statistics.service";

const tournamentInclude = {
  discipline: { select: { id: true, name: true, playersPerField: true } },
  category: { select: { id: true, name: true } },
  groups: {
    include: {
      teamGroups: {
        include: { team: { select: { id: true, name: true } } },
      },
      _count: { select: { matches: true } },
    },
  },
  matches: {
    select: {
      id: true,
      homeTeam: { select: { id: true, name: true } },
      awayTeam: { select: { id: true, name: true } },
      phase: true,
      matchDay: true,
      status: true,
      homeScore: true,
      awayScore: true,
    },
    orderBy: { scheduledAt: "asc" as const },
  },
  _count: { select: { groups: true, matches: true } },
};

export class TournamentService {
  static async findAll() {
    return prisma.tournament.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        discipline: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
        _count: { select: { groups: true, matches: true } },
      },
    });
  }

  static async findById(id: string) {
    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: tournamentInclude,
    });
    if (!tournament) throw new AppError(404, "Torneo no encontrado");
    return tournament;
  }

  static async create(input: CreateTournamentInput) {
    const { teamIds, ...data } = input;

    const discipline = await prisma.discipline.findUnique({
      where: { id: data.disciplineId },
    });
    if (!discipline) throw new AppError(404, "Disciplina no encontrada");

    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });
    if (!category) throw new AppError(404, "Categoría no encontrada");

    if (category.disciplineId !== data.disciplineId)
      throw new AppError(400, "La categoría no pertenece a esa disciplina");

    // Validar equipos si se proveen
    if (teamIds && teamIds.length > 0) {
      const teams = await prisma.team.findMany({ where: { id: { in: teamIds } } });
      if (teams.length !== teamIds.length)
        throw new AppError(400, "Algunos equipos no existen");
      for (const t of teams) {
        if (t.categoryId !== data.categoryId)
          throw new AppError(
            400,
            `El equipo ${t.name} no pertenece a la categoría del torneo`
          );
      }
      if (data.formatType === "GROUPS_AND_KNOCKOUT" && teamIds.length < 4)
        throw new AppError(
          400,
          "Se necesitan al menos 4 equipos para el formato de grupos y eliminación"
        );
    }

    // Crear torneo + grupos
    const tournament = await prisma.tournament.create({
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
      include: tournamentInclude,
    });

    // Crear grupos (A, B, C, D...)
    const numGroups =
      data.formatType === "GROUPS_AND_KNOCKOUT"
        ? data.maxGroups ?? 4
        : data.formatType === "KNOCKOUT_ONLY"
          ? 0
          : 1;

    const createdGroups = [];
    for (let i = 0; i < numGroups; i++) {
      const name = `Group ${String.fromCharCode(65 + i)}`;
      const group = await prisma.group.create({
        data: { tournamentId: tournament.id, name },
      });
      createdGroups.push(group);
    }

    // Si es modo AUTOMATICO, generar el calendario con los equipos
    if (data.generationMode === "AUTOMATIC" && teamIds && teamIds.length > 0) {
      if (data.formatType === "GROUPS_AND_KNOCKOUT" || numGroups >= 1) {
        await generateGroupPhase(tournament.id, teamIds);
      }
    }

    return this.findById(tournament.id);
  }

  static async update(id: string, input: UpdateTournamentInput) {
    await this.findById(id);
    return prisma.tournament.update({
      where: { id },
      data: {
        ...input,
        startDate: input.startDate ? new Date(input.startDate) : undefined,
        endDate: input.endDate ? new Date(input.endDate) : undefined,
      },
      include: tournamentInclude,
    });
  }

  static async delete(id: string) {
    await this.findById(id);
    // Borrar en cascada grupos, teamgroups y partidos del torneo
    return prisma.$transaction(async tx => {
      const groups = await tx.group.findMany({ where: { tournamentId: id } });
      for (const g of groups) {
        await tx.teamGroup.deleteMany({ where: { groupId: g.id } });
      }
      await tx.group.deleteMany({ where: { tournamentId: id } });
      await tx.match.deleteMany({ where: { tournamentId: id } });
      return tx.tournament.delete({ where: { id } });
    });
  }

  static async getStandings(tournamentId: string) {
    const tournament = await this.findById(tournamentId);
    const result: any[] = [];
    for (const group of tournament.groups) {
      const standings = await StandingsService.getGroupStandings(group.id);
      result.push(standings);
    }
    return result;
  }

  static async getStats(tournamentId: string) {
    return StatisticsService.getTournamentStats(tournamentId);
  }

  static async getBracket(tournamentId: string) {
    return StatisticsService.getTournamentBracket(tournamentId);
  }
}
