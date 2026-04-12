import { getAge } from "@/utils/date";
import { getPhotoUrl } from "@/utils/url";
import type { Player } from "../api/players.api";

type Props = {
  players: Player[];
  onEdit: (player: Player) => void;
  onDelete: (player: Player) => void;
  onViewReport: (player: Player) => void;
  isLoading: boolean;
};

const PlayerTable = ({ players, onDelete, onEdit, onViewReport, isLoading }: Props) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-400">
        Cargando jugadores...
      </div>
    );
  }

  if (players.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-400">
        No hay jugadores registrados
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-800">
            <th className="text-left py-3 px-4 text-slate-400 font-medium">#</th>
            <th className="text-left py-3 px-4 text-slate-400 font-medium">Jugador</th>
            <th className="text-left py-3 px-4 text-slate-400 font-medium">Cédula</th>
            <th className="text-left py-3 px-4 text-slate-400 font-medium">Edad</th>
            <th className="text-left py-3 px-4 text-slate-400 font-medium">Equipo</th>
            <th className="text-left py-3 px-4 text-slate-400 font-medium">Categoría</th>
            <th className="text-left py-3 px-4 text-slate-400 font-medium">Biométrico</th>
            <th className="text-right py-3 px-4 text-slate-400 font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player, index) => {
            const activeTeam = player.teams.find(t => t.isActive);
            return (
              <tr
                key={player.id}
                className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
              >
                <td className="py-3 px-4 text-slate-500">{index + 1}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs text-slate-300 shrink-0">
                      {player.photoUrl ? (
                        <img
                          src={getPhotoUrl(player.photoUrl)}
                          alt={player.firstName}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        `${player.firstName[0]}${player.lastName[0]}`
                      )}
                    </div>
                    <span className="text-white font-medium">
                      {player.lastName}, {player.firstName}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4 text-slate-400">{player.documentId}</td>
                <td className="py-3 px-4 text-slate-400">{getAge(player.birthDate)} años</td>
                <td className="py-3 px-4 text-slate-400">{activeTeam?.team.name ?? "—"}</td>
                <td className="py-3 px-4">
                  {activeTeam ? (
                    <span className="bg-sky-900/50 text-sky-400 text-xs px-2 py-1 rounded-md">
                      {activeTeam.team.category.name}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="py-3 px-4">
                  {player.biometricData ? (
                    <span className="bg-green-900/50 text-green-400 text-xs px-2 py-1 rounded-md">
                      Registrado
                    </span>
                  ) : (
                    <span className="bg-amber-900/50 text-amber-400 text-xs px-2 py-1 rounded-md">
                      Pendiente
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onViewReport(player)}
                      className="text-xs px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-sky-400 transition"
                    >
                      Ficha
                    </button>
                    <button
                      onClick={() => onEdit(player)}
                      className="text-xs px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => onDelete(player)}
                      className="text-xs px-3 py-1.5 rounded-md bg-red-900/30 hover:bg-red-900/50 text-red-400 transition"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PlayerTable;
