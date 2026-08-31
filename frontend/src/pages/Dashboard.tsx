import { useDisciplines } from "@/features/disciplines/hooks/useDisciplines";
import { useMatches } from "@/features/matches/hooks/useMatches";
import { usePlayers } from "@/features/players/hooks/usePlayers";
import { useTeams } from "@/features/teams/hooks/useTeams";
import {
  useTournamentStandings,
  useTournamentStats,
  useTournaments,
} from "@/features/tournaments/hooks/useTournaments";
import { useAuthStore } from "@/store/auth.store";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const { data: disciplines = [] } = useDisciplines();
  const { data: players = [] } = usePlayers();
  const { data: teams = [] } = useTeams();
  const { data: matches = [] } = useMatches();
  const { data: tournaments = [] } = useTournaments();

  const activeTournament =
    tournaments.find(t => t.status === "IN_PROGRESS") ??
    tournaments.find(t => t.status === "CREATED") ??
    tournaments[0];
  const { data: standings } = useTournamentStandings(activeTournament?.id ?? "");
  const { data: stats } = useTournamentStats(activeTournament?.id ?? "");

  const nextMatches = matches
    .filter(m => m.status === "PENDING")
    .slice()
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    .slice(0, 5);

  const lastResults = matches
    .filter(m => m.status === "FINISHED")
    .slice()
    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
    .slice(0, 5);

  const statsCards = [
    {
      label: "Jugadores",
      value: players.length,
      icon: "👥",
      path: "/players",
      color: "border-sky-500/30 hover:border-sky-500",
    },
    {
      label: "Equipos",
      value: teams.length,
      icon: "🏆",
      path: "/teams",
      color: "border-emerald-500/30 hover:border-emerald-500",
    },
    {
      label: "Partidos",
      value: matches.length,
      icon: "⚽",
      path: "/matches",
      color: "border-green-500/30 hover:border-green-500",
    },
    {
      label: "Torneos",
      value: tournaments.length,
      icon: "🏅",
      path: "/tournaments",
      color: "border-amber-500/30 hover:border-amber-500",
    },
  ];

  const topPlayer =
    stats?.topScorer ??
    stats?.topPlayer ??
    stats?.topAssister ??
    stats?.topRebounder ??
    null;

  return (
    <div className="flex flex-col gap-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-semibold text-white">Bienvenido, {user?.name} 👋</h1>
        <p className="text-slate-400 mt-1">
          Panel general del sistema de gestión deportiva
        </p>
      </div>

      {/* Contadores / KPI */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map(card => (
          <button
            key={card.path}
            onClick={() => navigate(card.path)}
            className={`bg-slate-900 border rounded-xl p-4 text-left transition-all
                        duration-200 hover:scale-[1.02] cursor-pointer group ${card.color}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-3xl">{card.icon}</span>
              <span className="text-3xl font-bold text-white">{card.value}</span>
            </div>
            <p className="mt-3 text-sm text-slate-400 group-hover:text-white transition-colors">
              {card.label}
            </p>
          </button>
        ))}
      </section>

      {/* Filas principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximos partidos */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-slate-300">📅 Próximos partidos</h2>
            <button
              onClick={() => navigate("/matches")}
              className="text-xs text-sky-400 hover:text-sky-300 transition"
            >
              Ver todos
            </button>
          </div>
          {nextMatches.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-6">No hay partidos pendientes</p>
          ) : (
            <div className="flex flex-col gap-2">
              {nextMatches.map(match => (
                <div
                  key={match.id}
                  className="flex items-center justify-between py-2 px-3 rounded-lg
                             bg-slate-800/50 border border-slate-800"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {match.homeTeam.name} <span className="text-slate-500">vs</span>{" "}
                      {match.awayTeam.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {match.category.name}
                      {match.homeTeam.discipline?.name
                        ? ` · ${match.homeTeam.discipline.name}`
                        : ""}
                    </p>
                  </div>
                  <span className="text-xs text-slate-400 whitespace-nowrap">
                    {new Date(match.scheduledAt).toLocaleDateString("es-EC", {
                      day: "2-digit",
                      month: "short",
                    })}{" "}
                    {new Date(match.scheduledAt).toLocaleTimeString("es-EC", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Últimos resultados */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-slate-300">🏁 Últimos resultados</h2>
            <button
              onClick={() => navigate("/matches")}
              className="text-xs text-sky-400 hover:text-sky-300 transition"
            >
              Ver todos
            </button>
          </div>
          {lastResults.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-6">
              No hay partidos finalizados
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {lastResults.map(match => (
                <div
                  key={match.id}
                  className="flex items-center justify-between py-2 px-3 rounded-lg
                             bg-slate-800/50 border border-slate-800"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {match.homeTeam.name} <span className="text-slate-500">vs</span>{" "}
                      {match.awayTeam.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {match.category.name}
                      {match.homeTeam.discipline?.name
                        ? ` · ${match.homeTeam.discipline.name}`
                        : ""}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-white whitespace-nowrap">
                    {match.homeScore ?? 0} - {match.awayScore ?? 0}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Segunda fila */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tabla de posiciones del torneo activo */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-slate-300">
              📊 Posiciones · {activeTournament?.name ?? "Sin torneo"}
            </h2>
            {activeTournament && (
              <button
                onClick={() => navigate(`/tournaments/${activeTournament.id}`)}
                className="text-xs text-sky-400 hover:text-sky-300 transition"
              >
                Abrir torneo
              </button>
            )}
          </div>
          {!activeTournament ? (
            <p className="text-slate-500 text-sm text-center py-6">No hay torneos creados</p>
          ) : (
            <div className="flex flex-col gap-4">
              {(standings ?? []).map(group => (
                <div key={group.group.id}>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    {group.group.name}
                  </p>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-slate-500 text-xs">
                        <th className="text-left py-1 font-medium">#</th>
                        <th className="text-left py-1 font-medium">Equipo</th>
                        <th className="text-center py-1 font-medium">PJ</th>
                        <th className="text-center py-1 font-medium">DG</th>
                        <th className="text-center py-1 font-medium">Pts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.standings.slice(0, 4).map(row => (
                        <tr key={row.teamId} className="border-t border-slate-800">
                          <td className="py-2 text-slate-500">{row.position}</td>
                          <td className="py-2 text-white font-medium truncate max-w-[10rem]">
                            {row.teamName}
                          </td>
                          <td className="py-2 text-center text-slate-400">{row.plays}</td>
                          <td className="py-2 text-center text-slate-400">
                            {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                          </td>
                          <td className="py-2 text-center font-bold text-white">{row.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Mejores jugadores / goleadores */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-slate-300">⭐ Destacados del torneo</h2>
            {activeTournament && (
              <button
                onClick={() => navigate(`/tournaments/${activeTournament.id}`)}
                className="text-xs text-sky-400 hover:text-sky-300 transition"
              >
                Ver estadísticas
              </button>
            )}
          </div>
          {!activeTournament || !stats ? (
            <p className="text-slate-500 text-sm text-center py-6">
              Crea un torneo con partidos para ver estadísticas
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {topPlayer && (
                <HighlightRow
                  label={topScorerLabel(stats?.discipline, stats)}
                  value={topPlayer.name ?? "—"}
                  detail={formatTopPlayerDetail(stats)}
                />
              )}
              {stats?.bestTeam && (
                <HighlightRow
                  label="Mejor equipo"
                  value={stats.bestTeam.name ?? "—"}
                  detail={`${stats.bestTeam.wins} victorias`}
                />
              )}
              {stats?.topAssister && stats?.topAssister !== topPlayer && (
                <HighlightRow
                  label="Máx. asistidor"
                  value={stats.topAssister.name ?? "—"}
                  detail={`${stats.topAssister.assists} asistencias`}
                />
              )}
              {stats?.topRebounder && (
                <HighlightRow
                  label="Máx. reboteador"
                  value={stats.topRebounder.name ?? "—"}
                  detail={`${stats.topRebounder.rebounds} rebotes`}
                />
              )}
            </div>
          )}
        </section>
      </div>

      {/* Disciplinas activas */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h2 className="text-sm font-medium text-slate-300 mb-4">🏅 Disciplinas del sistema</h2>
        {disciplines.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-6">No hay disciplinas registradas</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {disciplines.map(d => (
              <button
                key={d.id}
                onClick={() => navigate("/disciplines")}
                className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700
                           text-sm text-slate-300 hover:text-white hover:border-sky-500
                           transition"
              >
                {d.name}
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function HighlightRow({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-800/50 border border-slate-800">
      <div className="min-w-0">
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm font-medium text-white truncate">{value}</p>
      </div>
      {detail && <span className="text-xs text-slate-500 whitespace-nowrap">{detail}</span>}
    </div>
  );
}

function topScorerLabel(disciplineName: string | undefined, stats: any): string {
  const n = (disciplineName ?? "").toUpperCase();
  if (n.includes("BASQUET") || n.includes("BASKET")) return "Máx. anotador";
  if (n.includes("AJEDREZ") || n.includes("CHESS")) return "Mejor jugador";
  return "Máx. goleador";
}

function formatTopPlayerDetail(stats: any): string {
  const scorer = stats?.topScorer;
  if (scorer) {
    if (scorer.goals) return `${scorer.goals} goles`;
    if (scorer.points) return `${scorer.points} puntos`;
  }
  const topPlayer = stats?.topPlayer;
  if (topPlayer?.chessWins) return `${topPlayer.chessWins} victorias`;
  return "";
}
