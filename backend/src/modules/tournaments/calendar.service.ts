import { prisma } from "@/config/database";
import type { MatchPhase } from "../../generated/prisma/client.js";

/**
 * Generador de calendario de torneo.
 * - Algoritmo Round Robin (Berger) para fase de grupos
 * - Emparejamientos para eliminación directa
 */

/**
 * Genera las jornadas (rounds) de Round Robin para una lista de equipos.
 * Retorna un array de rounds, cada uno con un array de pares [home, away].
 */
export function generateRoundRobin(teamIds: string[]): [string, string][][] {
  const teams = [...teamIds];
  const n = teams.length;

  // Con equipo impar se agrega un "BYE" (descanso)
  const isOdd = n % 2 !== 0;
  if (isOdd) teams.push("BYE");

  const totalTeams = teams.length;
  const rounds: [string, string][][] = [];
  const maxRounds = totalTeams - 1;
  const half = totalTeams / 2;

  const fixed = teams[0];
  let rotating = teams.slice(1);

  for (let round = 0; round < maxRounds; round++) {
    const roundPairs: [string, string][] = [];

    // Emparejar fijo contra el último de la rotación
    const lastIndex = rotating.length - 1;
    let home = fixed;
    let away = rotating[lastIndex];
    if (round % 2 === 1) [home, away] = [away, home];
    if (home !== "BYE" && away !== "BYE") roundPairs.push([home, away]);

    // Emparejar el resto (i contra el opuesto)
    for (let i = 0; i < lastIndex; i++) {
      const j = lastIndex - 1 - i;
      if (i >= j) break;
      let h = rotating[i];
      let a = rotating[j];
      if (h === "BYE" || a === "BYE") continue;
      if ((round + i) % 2 === 1) [h, a] = [a, h];
      roundPairs.push([h, a]);
    }

    rounds.push(roundPairs);

    // Rotar: mover el último elemento al inicio
    const last = rotating.pop()!;
    rotating.unshift(last);
  }

  return rounds;
}

/**
 * Determina la fase siguiente en eliminación directa.
 */
export function nextPhase(phase: MatchPhase): MatchPhase {
  switch (phase) {
    case "ROUND_OF_16":
      return "QUARTER_FINAL";
    case "QUARTER_FINAL":
      return "SEMI_FINAL";
    case "SEMI_FINAL":
      return "FINAL";
    default:
      return "FINAL";
  }
}

/**
 * Calcula cuántas fases de eliminación directa hay según los clasificados.
 */
export function knockoutPhases(qualifiedTeams: number): MatchPhase[] {
  let n = qualifiedTeams;
  const phases: MatchPhase[] = [];

  if (n === 16) phases.push("ROUND_OF_16");
  if (n >= 8 && n % 8 === 0) phases.push("QUARTER_FINAL");
  if (n >= 4 && n % 4 === 0) phases.push("SEMI_FINAL");
  phases.push("THIRD_PLACE"); // Partido por el tercer puesto
  phases.push("FINAL");

  return phases;
}

/**
 * Genera los partidos de fase de grupos (Round Robin) para un torneo.
 * Asigna equipos a grupos de forma balanceada.
 */
export async function generateGroupPhase(tournamentId: string, teamIds: string[]) {
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
  });
  if (!tournament) throw new Error("Torneo no encontrado");

  const numGroups = tournament.maxGroups ?? 4;
  const groups = await prisma.group.findMany({
    where: { tournamentId },
    orderBy: { name: "asc" },
  });

  if (groups.length === 0)
    throw new Error("El torneo no tiene grupos configurados");

  // Distribuir equipos en grupos de forma redonda (equilibrada)
  const distribution: string[][] = Array.from({ length: groups.length }, () => []);
  teamIds.forEach((teamId, index) => {
    distribution[index % groups.length].push(teamId);
  });

  // Crear TeamGroup y partidos round robin
  for (let gi = 0; gi < groups.length; gi++) {
    const group = groups[gi];
    const groupTeams = distribution[gi];

    for (const teamId of groupTeams) {
      await prisma.teamGroup.upsert({
        where: {
          teamId_groupId: { teamId, groupId: group.id },
        },
        create: { teamId, groupId: group.id },
        update: {},
      });
    }

    const rounds = generateRoundRobin(groupTeams);
    // Fecha base: cada jornada suma +7 días desde la fecha de inicio
    const baseStart = tournament.startDate ?? new Date();

    for (let roundIndex = 0; roundIndex < rounds.length; roundIndex++) {
      const round = rounds[roundIndex];
      for (const [homeId, awayId] of round) {
        await prisma.match.create({
          data: {
            homeTeamId: homeId,
            awayTeamId: awayId,
            categoryId: tournament.categoryId,
            tournamentId,
            groupId: group.id,
            phase: "GROUPS",
            matchDay: roundIndex + 1,
            scheduledAt: new Date(
              baseStart.getTime() + roundIndex * 7 * 24 * 60 * 60 * 1000
            ),
            status: "PENDING",
          },
        });
      }
    }
  }
}

/**
 * Genera los partidos de eliminación directa para un torneo.
 * Los equipos clasificados deben venir en orden de posición.
 */
export async function generateKnockoutPhase(
  tournamentId: string,
  qualifiedTeamIds: string[]
) {
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
  });
  if (!tournament) throw new Error("Torneo no encontrado");

  const phases = knockoutPhases(qualifiedTeamIds.length);
  let currentTeams = [...qualifiedTeamIds];
  const baseStart = tournament.startDate ?? new Date();

  for (const phase of phases) {
    if (phase === "THIRD_PLACE") continue; // se genera al final

    const pairs: [string, string][] = [];
    for (let i = 0; i < currentTeams.length; i += 2) {
      pairs.push([currentTeams[i], currentTeams[i + 1]]);
    }

    // Buscar fecha de la última jornada de grupos
    const lastGroupMatch = await prisma.match.findFirst({
      where: { tournamentId, phase: "GROUPS" },
      orderBy: { matchDay: "desc" },
    });
    let baseDate = lastGroupMatch?.scheduledAt ?? baseStart;
    baseDate = new Date(baseDate.getTime() + 3 * 24 * 60 * 60 * 1000);

    for (const [homeId, awayId] of pairs) {
      await prisma.match.create({
        data: {
          homeTeamId: homeId,
          awayTeamId: awayId,
          categoryId: tournament.categoryId,
          tournamentId,
          phase,
          matchDay: 0,
          scheduledAt: baseDate,
          status: "PENDING",
        },
      });
    }

    // La siguiente fase requiere los ganadores (que aún no se conocen).
    // En modo AUTOMATICO generamos las llaves vacías almacenando los equipos
    // como placeholders sería complejo; en su lugar registramos los partidos
    // con equipos provisionales y el organizador los asigna al avanzar.
    // Por simplicidad aquí solo avanzamos un nivel marcando la estructura.
    currentTeams = currentTeams.filter((_, i) => i % 2 === 0);
    if (currentTeams.length <= 1) break;
  }
}
