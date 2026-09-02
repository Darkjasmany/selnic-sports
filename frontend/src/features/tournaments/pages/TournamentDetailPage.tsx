import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  useTournamentBracket,
  useTournamentStandings,
  useTournamentStats,
} from "../hooks/useTournaments";
import { getTournamentById } from "../api/tournaments.api";
import { useQuery } from "@tanstack/react-query";
import { TOURNAMENTS_KEY } from "../hooks/useTournaments";
import BracketView from "../components/BracketView";

type Tab = "groups" | "bracket" | "stats";

const TournamentDetailPage = () => {
  const { id = "" } = useParams();
  const [tab, setTab] = useState<Tab>("groups");

  const { data: tournament, isLoading } = useQuery({
    queryKey: [TOURNAMENTS_KEY, id],
    queryFn: () => getTournamentById(id),
    enabled: !!id,
  });

  const { data: standings } = useTournamentStandings(id);
  const { data: stats } = useTournamentStats(id);
  const { data: bracket } = useTournamentBracket(id);

  if (isLoading) return <p className="text-slate-400">Cargando torneo...</p>;
  if (!tournament)
    return <p className="text-slate-400">Torneo no encontrado</p>;

  const statsCards = [
    { label: "Mejor equipo", value: stats?.bestTeam?.name ?? "—" },
    { label: "Más goles/puntos", value: stats?.mostGoalsTeam?.name ?? stats?.mostPointsTeam?.name ?? "—" },
    { label: "Menos recibidos", value: stats?.leastGoalsAgainstTeam?.name ?? stats?.leastPointsAgainstTeam?.name ?? "—" },
    { label: "Máximo goleador", value: stats?.topScorer?.name ?? "—" },
    { label: "Máximo asistidor", value: stats?.topAssister?.name ?? "—" },
  ];

  // Grupos a mostrar en "Grupos y posiciones".
  // - Si hay standings calculados (partidos jugados), se muestran con posición/estadísticas.
  // - Si no, se muestran igualmente los equipos asignados a cada grupo desde
  //   tournament.groups[].teamGroups. Esto permite ver los equipos aunque el
  //   torneo se haya creado en modo SEMI_AUTOMATIC/MANUAL o aún no haya partidos.
  const standingsByGroupId = new Map(
    (standings ?? []).map(g => [g.group.id, g])
  );
  const displayGroups = (tournament?.groups ?? []).map((group: any) => {
    const st = standingsByGroupId.get(group.id);
    if (st && st.standings.length > 0) return st;
    const teamGroups = group.teamGroups ?? [];
    return {
      group: { id: group.id, name: group.name },
      standings: teamGroups.map((tg: any, i: number) => ({
        position: i + 1,
        teamId: tg.teamId,
        teamName: tg.team?.name ?? "",
        plays: tg.wins + tg.draws + tg.losses,
        wins: tg.wins,
        draws: tg.draws,
        losses: tg.losses,
        goalsFor: tg.goalsFor,
        goalsAgainst: tg.goalsAgainst,
        goalDifference: tg.goalsFor - tg.goalsAgainst,
        points: tg.points,
      })),
    };
  });

  const tabs: { key: Tab; label: string }[] = [
    { key: "groups", label: "Grupos y posiciones" },
    { key: "bracket", label: "Bracket (árbol)" },
    { key: "stats", label: "Estadísticas" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white">{tournament.name}</h1>
        <p className="text-slate-400 text-sm mt-1">
          {tournament.discipline?.name} · {tournament.category?.name} ·{" "}
          {tournament.formatType.replace(/_/g, " ").toLowerCase()}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm transition ${
              tab === t.key
                ? "bg-sky-600 text-white"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "groups" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {displayGroups.map((g: any) => (
            <div
              key={g.group.id}
              className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden"
            >
              <div className="p-3 border-b border-slate-800">
                <h3 className="text-white font-medium">{g.group.name}</h3>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-slate-400 border-b border-slate-800">
                    <th className="px-3 py-2">#</th>
                    <th className="px-3 py-2">Equipo</th>
                    <th className="px-3 py-2 text-center">PJ</th>
                    <th className="px-3 py-2 text-center">G</th>
                    <th className="px-3 py-2 text-center">E</th>
                    <th className="px-3 py-2 text-center">P</th>
                    <th className="px-3 py-2 text-center">GF</th>
                    <th className="px-3 py-2 text-center">GC</th>
                    <th className="px-3 py-2 text-center">DF</th>
                    <th className="px-3 py-2 text-center">PTS</th>
                  </tr>
                </thead>
                <tbody>
                  {g.standings.map((s: any) => (
                    <tr
                      key={s.teamId}
                      className="border-b border-slate-800 last:border-0"
                    >
                      <td className="px-3 py-2 text-slate-400 text-sm">{s.position}</td>
                      <td className="px-3 py-2 text-white text-sm">{s.teamName}</td>
                      <td className="px-3 py-2 text-center text-slate-300 text-sm">{s.plays}</td>
                      <td className="px-3 py-2 text-center text-slate-300 text-sm">{s.wins}</td>
                      <td className="px-3 py-2 text-center text-slate-300 text-sm">{s.draws}</td>
                      <td className="px-3 py-2 text-center text-slate-300 text-sm">{s.losses}</td>
                      <td className="px-3 py-2 text-center text-slate-300 text-sm">{s.goalsFor}</td>
                      <td className="px-3 py-2 text-center text-slate-300 text-sm">{s.goalsAgainst}</td>
                      <td className="px-3 py-2 text-center text-slate-300 text-sm">
                        {s.goalDifference > 0 ? `+${s.goalDifference}` : s.goalDifference}
                      </td>
                      <td className="px-3 py-2 text-center text-sky-400 font-semibold text-sm">
                        {s.points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
          {displayGroups.length === 0 && (
            <p className="text-slate-500 col-span-2">
              No hay grupos configurados todavía
            </p>
          )}
        </div>
      )}

      {tab === "bracket" && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          {bracket && Object.keys(bracket).length > 0 ? (
            <BracketView bracket={bracket} />
          ) : (
            <p className="text-slate-500">
              Aún no hay partidos de eliminación directa. Avanza la fase de
              grupos para generarlos.
            </p>
          )}
        </div>
      )}

      {tab === "stats" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {statsCards.map((c, i) => (
            <div
              key={i}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5"
            >
              <p className="text-sm text-slate-400 mb-1">{c.label}</p>
              <p className="text-lg text-white font-semibold">{c.value}</p>
            </div>
          ))}
          {stats?.topRebounder && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <p className="text-sm text-slate-400 mb-1">Máximo reboteador</p>
              <p className="text-lg text-white font-semibold">
                {stats.topRebounder.name}
              </p>
            </div>
          )}
          {stats?.topPlayer && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <p className="text-sm text-slate-400 mb-1">Mejor jugador (ajedrez)</p>
              <p className="text-lg text-white font-semibold">{stats.topPlayer.name}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TournamentDetailPage;
