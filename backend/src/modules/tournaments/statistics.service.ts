import { prisma } from "@/config/database";
import { AppError } from "@/middlewares/error.middleware";

/**
 * Estadísticas por disciplina dentro de un torneo.
 * - Fútbol: goleador, asistidor, mejor equipo, más/menos goles
 * - Básquetbol: anotador, reboteador, asistidor, mejor equipo, más/menos puntos
 * - Ajedrez: mejor jugador, más victorias, más tablas
 */
export class StatisticsService {
  static async getTournamentStats(tournamentId: string) {
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: { discipline: true },
    });
    if (!tournament) throw new AppError(404, "Torneo no encontrado");

    const disciplineName = tournament.discipline.name.toUpperCase();

    // Tipos de eventos según disciplina
    const isFootball = disciplineName.includes("FUTBOL") || disciplineName.includes("FOOT");
    const isBasket = disciplineName.includes("BASQUET") || disciplineName.includes("BASKET");
    const isChess = disciplineName.includes("AJEDREZ") || disciplineName.includes("CHESS");

    const matches = await prisma.match.findMany({
      where: { tournamentId },
      include: {
        homeTeam: { select: { id: true, name: true } },
        awayTeam: { select: { id: true, name: true } },
        incidents: {
          include: {
            player: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
    });

    const stats: any = {
      discipline: tournament.discipline.name,
      formatType: tournament.formatType,
      teams: {},
      players: {},
    };

    // Inicializar agregados por equipo
    const teamAgg: Record<
      string,
      { teamId: string; name: string; goalsFor: number; goalsAgainst: number; matches: number; wins: number }
    > = {};
    const playerAgg: Record<
      string,
      { playerId: string; name: string; goals: number; assists: number; points: number; rebounds: number; chessWins: number; draws: number }
    > = {};

    const ensureTeam = (id: string, name: string) => {
      if (!teamAgg[id])
        teamAgg[id] = {
          teamId: id,
          name,
          goalsFor: 0,
          goalsAgainst: 0,
          matches: 0,
          wins: 0,
        };
      return teamAgg[id];
    };
    const ensurePlayer = (id: string, firstName: string, lastName: string) => {
      if (!playerAgg[id])
        playerAgg[id] = {
          playerId: id,
          name: `${firstName} ${lastName}`.trim(),
          goals: 0,
          assists: 0,
          points: 0,
          rebounds: 0,
          chessWins: 0,
          draws: 0,
        };
      return playerAgg[id];
    };

    for (const match of matches) {
      const home = ensureTeam(match.homeTeamId, match.homeTeam.name);
      const away = ensureTeam(match.awayTeamId, match.awayTeam.name);
      home.matches++;
      away.matches++;
      if (match.status === "FINISHED") {
        home.goalsFor += match.homeScore ?? 0;
        home.goalsAgainst += match.awayScore ?? 0;
        away.goalsFor += match.awayScore ?? 0;
        away.goalsAgainst += match.homeScore ?? 0;
        if ((match.homeScore ?? 0) > (match.awayScore ?? 0)) home.wins++;
        if ((match.homeScore ?? 0) < (match.awayScore ?? 0)) away.wins++;
      }

      for (const inc of match.incidents) {
        if (!inc.player) continue;
        const p = ensurePlayer(inc.player.id, inc.player.firstName, inc.player.lastName);

        if (isFootball) {
          if (inc.type === "GOAL") p.goals++;
          if (inc.assistPlayerId) {
            const aid = inc.assistPlayerId;
            const ap = playerAgg[aid];
            if (ap) ap.assists++;
            else {
              const assistPlayer = await prisma.player.findUnique({
                where: { id: aid },
                select: { id: true, firstName: true, lastName: true },
              });
              if (assistPlayer) {
                const apf = ensurePlayer(assistPlayer.id, assistPlayer.firstName, assistPlayer.lastName);
                apf.assists++;
              }
            }
          }
        } else if (isBasket) {
          const points = inc.points ?? 0;
          p.points += points;
          if (inc.type === "REBOUND") p.rebounds++;
          if (inc.type === "ASSIST") p.assists++;
        } else if (isChess) {
          if (inc.type === "CHECKMATE") p.chessWins++;
          if (inc.type === "DRAW_CHESS") p.draws++;
        }
      }
    }

    // -------- Construcción de ranking por disciplina --------
    const teamsList = Object.values(teamAgg);
    const playersList = Object.values(playerAgg);

    if (isFootball) {
      stats.topScorer = [...playersList].sort((a, b) => b.goals - a.goals)[0] ?? null;
      stats.topAssister = [...playersList].sort((a, b) => b.assists - a.assists)[0] ?? null;
      stats.bestTeam = [...teamsList].sort(
        (a, b) => b.wins - a.wins || b.goalsFor - a.goalsFor
      )[0] ?? null;
      stats.mostGoalsTeam = [...teamsList].sort((a, b) => b.goalsFor - a.goalsFor)[0] ?? null;
      stats.leastGoalsAgainstTeam = [...teamsList].sort(
        (a, b) => a.goalsAgainst - b.goalsAgainst
      )[0] ?? null;
    } else if (isBasket) {
      stats.topScorer = [...playersList].sort((a, b) => b.points - a.points)[0] ?? null;
      stats.topRebounder = [...playersList].sort((a, b) => b.rebounds - a.rebounds)[0] ?? null;
      stats.topAssister = [...playersList].sort((a, b) => b.assists - a.assists)[0] ?? null;
      stats.bestTeam = [...teamsList].sort(
        (a, b) => b.wins - a.wins || b.goalsFor - a.goalsFor
      )[0] ?? null;
      stats.mostPointsTeam = [...teamsList].sort((a, b) => b.goalsFor - a.goalsFor)[0] ?? null;
      stats.leastPointsAgainstTeam = [...teamsList].sort(
        (a, b) => a.goalsAgainst - b.goalsAgainst
      )[0] ?? null;
    } else if (isChess) {
      stats.topPlayer = [...playersList].sort((a, b) => b.chessWins - a.chessWins)[0] ?? null;
      stats.mostDraws = [...playersList].sort((a, b) => b.draws - a.draws)[0] ?? null;
      stats.resignations = matches.reduce((acc, m) => {
        return (
          acc +
          m.incidents.filter(i => i.type === "RESIGNATION").length
        );
      }, 0);
    }

    stats.matches = matches.length;
    return stats;
  }

  static async getTournamentBracket(tournamentId: string) {
    const matches = await prisma.match.findMany({
      where: { tournamentId },
      include: {
        homeTeam: { select: { id: true, name: true } },
        awayTeam: { select: { id: true, name: true } },
        group: { select: { id: true, name: true } },
      },
      orderBy: { phase: "asc" },
    });

    const bracket: Record<string, any[]> = {};
    for (const m of matches) {
      if (!m.phase) continue;
      if (!bracket[m.phase]) bracket[m.phase] = [];
      bracket[m.phase].push({
        id: m.id,
        home: m.homeTeam,
        away: m.awayTeam,
        homeScore: m.homeScore,
        awayScore: m.awayScore,
        status: m.status,
        groupName: m.group?.name ?? null,
      });
    }
    return bracket;
  }
}
