import type { Team } from "../api/teams.api";

type Props = {
  teams: Team[];
  onEdit: (team: Team) => void;
  onDelete: (team: Team) => void;
  isLoading: boolean;
};
const TeamTable = ({ teams, onDelete, onEdit, isLoading }: Props) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-400">
        Cargando equipos...
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-400">
        No hay equipos registrados
      </div>
    );
  }

  return (
    <div className="overflow-auto">
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="text-left py-3 px-4 text-slate-400 font-medium">#</th>
            <th className="text-left py-3 px-4 text-slate-400 font-medium">Nombre</th>
            <th className="text-left py-3 px-4 text-slate-400 font-medium">Categoría</th>
            <th className="text-left py-3 px-4 text-slate-400 font-medium">Lugar</th>
            <th className="text-left py-3 px-4 text-slate-400 font-medium">DT</th>
            <th className="text-left py-3 px-4 text-slate-400 font-medium">Jugadores</th>
            <th className="text-right py-3 px-4 text-slate-400 font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team, index) => (
            <tr key={team.id}>
              <td className="py-3 px-4 text-slate-500">{index + 1}</td>
              <td className="py-3 px-4 text-white font-medium">{team.name}</td>
              <td className="py-3 px-4">
                <span className="bg-sky-900/50 text-sky-400 text-xs px-2 py-1 rounded-md">
                  {team.category.name}
                </span>
              </td>
              <td className="py-3 px-4 text-slate-400">{team.location ?? "—"}</td>
              <td className="py-3 px-4 text-slate-400">{team.coachName ?? "—"}</td>
              <td className="py-3 px-4 text-slate-400">{team._count.players}</td>
              <td className="py-3 px-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onEdit(team)}
                    className="text-xs px-3 py-1.5 rounded-md bg-slate-800
                               hover:bg-slate-700 text-slate-300 transition"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => onDelete(team)}
                    className="text-xs px-3 py-1.5 rounded-md bg-red-900/30
                               hover:bg-red-900/50 text-red-400 transition"
                  >
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TeamTable;
