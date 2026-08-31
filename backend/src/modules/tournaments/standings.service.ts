import { prisma } from "@/config/database";
import { AppError } from "@/middlewares/error.middleware";

/**
 * Tabla de posiciones por grupo, ordenada según la disciplina.
 */
export class StandingsService {
  static async getGroupStandings(groupId: string) {
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        tournament: { include: { discipline: true } },
        teamGroups: {
          include: { team: { select: { id: true, name: true } } },
        },
      },
    });
    if (!group) throw new AppError(404, "Grupo no encontrado");

    const standings = group.teamGroups
      .map(tg => ({
        teamId: tg.teamId,
        teamName: tg.team.name,
        points: tg.points,
        plays: tg.wins + tg.draws + tg.losses,
        wins: tg.wins,
        draws: tg.draws,
        losses: tg.losses,
        goalsFor: tg.goalsFor,
        goalsAgainst: tg.goalsAgainst,
        goalDifference: tg.goalsFor - tg.goalsAgainst,
      }))
      .sort((a, b) => {
        // Puntos, luego diferencia de goles, luego goles a favor
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDifference !== a.goalDifference)
          return b.goalDifference - a.goalDifference;
        return b.goalsFor - a.goalsFor;
      });

    // Asignar posición
    standings.forEach((s, i) => (s["position"] = i + 1));

    return {
      group: { id: group.id, name: group.name },
      discipline: group.tournament.discipline,
      standings,
    };
  }

  static async getQualifiedTeams(tournamentId: string) {
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: { groups: true },
    });
    if (!tournament) throw new AppError(404, "Torneo no encontrado");

    const qualifiedPerGroup = tournament.qualifiedPerGroup;
    const qualified: { teamId: string; groupId: string; position: number }[] = [];

    for (const group of tournament.groups) {
      const standings = await this.getGroupStandings(group.id);
      const top = standings.standings
        .slice(0, qualifiedPerGroup)
        .map(s => ({
          teamId: s.teamId,
          groupId: group.id,
          position: s.position ?? 0,
        }));
      qualified.push(...top);
    }

    return qualified;
  }
}
