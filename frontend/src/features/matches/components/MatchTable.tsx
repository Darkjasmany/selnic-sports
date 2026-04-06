import { useNavigate } from "react-router-dom";
import type { Match, MatchStatus } from "../api/matches.api";

type Props = {
  matches: Match[];
};

const STATUS_LABELS: Record<MatchStatus, string> = {
  PENDING: "Pendiente",
  VALIDATING_PLAYERS: "Validando jugadores",
  IN_PROGRESS: "En curso",
  FINISHED: "Finalizado",
};

const STATUS_COLORS: Record<MatchStatus, string> = {
  PENDING: "bg-slate-800 text-slate-400",
  VALIDATING_PLAYERS: "bg-amber-900/50 text-amber-400",
  IN_PROGRESS: "bg-sky-900/50 text-sky-400",
  FINISHED: "bg-green-900/50 text-green-400",
};

const MatchesTable = ({ matches }: Props) => {
  const navigate = useNavigate();
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-800">
            <th className="text-left py-3 px-4 text-slate-400 font-medium">Partido</th>
            <th className="text-left py-3 px-4 text-slate-400 font-medium">Categoría</th>
            <th className="text-left py-3 px-4 text-slate-400 font-medium">Fecha</th>
            <th className="text-left py-3 px-4 text-slate-400 font-medium">Estado</th>
            <th className="text-right py-3 px-4 text-slate-400 font-medium">Acción</th>
          </tr>
        </thead>
        <tbody>
          {matches.map(match => (
            <tr
              key={match.id}
              className="border-b border-slate-800/50 hover:bg-slate-800/30 transition"
            >
              <td className="py-3 px-4">
                <span className="text-white font-medium">{match.homeTeam.name}</span>
                <span className="text-slate-500 mx-2">vs</span>
                <span className="text-white font-medium">{match.awayTeam.name}</span>
                {match.status === "FINISHED" && (
                  <span className="ml-2 text-slate-400">
                    ({match.homeScore} — {match.awayScore})
                  </span>
                )}
              </td>
              <td className="py-3 px-4 text-slate-400">{match.category.name}</td>
              <td className="py-3 px-4 text-slate-400">
                {new Date(match.scheduledAt).toLocaleDateString("es-EC", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </td>
              <td className="py-3 px-4">
                <span
                  className={`
                      text-xs px-2 py-1 rounded-md
                      ${STATUS_COLORS[match.status]}
                    `}
                >
                  {STATUS_LABELS[match.status]}
                </span>
              </td>
              <td className="py-3 px-4 text-right">
                <button
                  onClick={() => navigate(`/matches/${match.id}/flow`)}
                  className="text-xs px-3 py-1.5 rounded-md bg-slate-800
                                 hover:bg-slate-700 text-sky-400 transition"
                >
                  {match.status === "FINISHED" ? "Ver acta" : "Abrir partido"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MatchesTable;
