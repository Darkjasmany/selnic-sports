import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDisciplines } from "@/features/disciplines/hooks/useDisciplines";
import { usePlayers } from "../hooks/usePlayers";
import BulkCarnetPrint from "../components/BulkCarnetPrint";

const BulkCarnetPage = () => {
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [filterDiscipline, setFilterDiscipline] = useState("");

  const { data: disciplines = [] } = useDisciplines();
  const { data: players = [], isLoading } = usePlayers(
    undefined,
    undefined,
    filterDiscipline || undefined
  );

  const filteredPlayers = useMemo(() => {
    if (!search.trim()) return players;
    const q = search.toLowerCase();
    return players.filter(p =>
      p.firstName.toLowerCase().includes(q) ||
      p.lastName.toLowerCase().includes(q) ||
      p.documentId.includes(q)
    );
  }, [players, search]);

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredPlayers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredPlayers.map(p => p.id)));
    }
  };

  const selectedPlayers = players.filter(p => selectedIds.has(p.id));

  return (
    <div>
      <div className="flex items-center gap-4 mb-6 print:hidden">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-slate-400 hover:text-white transition"
        >
          ← Volver
        </button>
        <h1 className="text-xl font-semibold text-white">Imprimir Carnets Masivos</h1>
      </div>

      {/* Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-5 print:hidden">
        <div className="flex flex-wrap gap-3 items-center">
          <span className="text-sm text-slate-400">Filtrar:</span>
          <input
            type="text"
            placeholder="Buscar por nombre o cédula..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-10 px-3 w-full max-w-sm rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:ring-2 focus:ring-sky-500 outline-none"
          />
          <select
            className="h-10 px-3 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:ring-2 focus:ring-sky-500 outline-none"
            value={filterDiscipline}
            onChange={e => setFilterDiscipline(e.target.value)}
          >
            <option value="">Todas las disciplinas</option>
            {disciplines.map(d => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleSelectAll}
            className="h-10 px-4 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm transition"
          >
            {selectedIds.size === filteredPlayers.length && filteredPlayers.length > 0
              ? "Deseleccionar todos"
              : "Seleccionar todos"}
          </button>
          <span className="text-sm text-slate-500">
            {selectedIds.size} de {filteredPlayers.length} seleccionados
          </span>
          {selectedPlayers.length > 0 && (
            <button
              onClick={() => window.print()}
              className="h-10 px-6 bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium rounded-lg transition"
            >
              🖨 Imprimir {selectedPlayers.length} carnets
            </button>
          )}
        </div>
      </div>

      {/* Player list with checkboxes */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden mb-5 print:hidden">
        {isLoading ? (
          <div className="py-16 text-center text-slate-400">Cargando jugadores...</div>
        ) : filteredPlayers.length === 0 ? (
          <div className="py-16 text-center text-slate-400">No hay jugadores registrados</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === filteredPlayers.length && filteredPlayers.length > 0}
                      onChange={handleSelectAll}
                      className="rounded bg-slate-800 border-slate-600"
                    />
                  </th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Jugador</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium hidden sm:table-cell">Cédula</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium hidden md:table-cell">Equipo</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium hidden md:table-cell">Categoría</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlayers.map(player => {
                  const activeTeam = player.teams.find(t => t.isActive);
                  return (
                    <tr
                      key={player.id}
                      className={`border-b border-slate-800/50 transition-colors cursor-pointer ${
                        selectedIds.has(player.id) ? "bg-sky-900/20" : "hover:bg-slate-800/30"
                      }`}
                      onClick={() => handleToggleSelect(player.id)}
                    >
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(player.id)}
                          onChange={() => handleToggleSelect(player.id)}
                          onClick={e => e.stopPropagation()}
                          className="rounded bg-slate-800 border-slate-600"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-white font-medium">
                          {player.lastName}, {player.firstName}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 hidden sm:table-cell">{player.documentId}</td>
                      <td className="py-3 px-4 text-slate-400 hidden md:table-cell">
                        {activeTeam?.team.name ?? "—"}
                      </td>
                      <td className="py-3 px-4 hidden md:table-cell">
                        {activeTeam ? (
                          <span className="bg-sky-900/50 text-sky-400 text-xs px-2 py-1 rounded-md">
                            {activeTeam.team.category.name}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Print preview */}
      {selectedPlayers.length > 0 && (
        <BulkCarnetPrint players={selectedPlayers} />
      )}
    </div>
  );
};

export default BulkCarnetPage;
