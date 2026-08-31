import { useDisciplines } from "@/features/disciplines/hooks/useDisciplines";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { useState } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { useDeleteTournament, useTournaments } from "../hooks/useTournaments";

const inputClass =
  "h-10 px-3 w-full rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:ring-2 focus:ring-sky-500 outline-none";

const TournamentsPage = () => {
  const navigate = useNavigate();
  const [disciplineId, setDisciplineId] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const { data: disciplines = [] } = useDisciplines();
  const { data: categories = [] } = useCategories(disciplineId || undefined);
  const { data: tournaments = [], isLoading } = useTournaments();
  const deleteTournament = useDeleteTournament();

  const filtered = tournaments.filter(t => {
    if (disciplineId && t.disciplineId !== disciplineId) return false;
    if (categoryId && t.categoryId !== categoryId) return false;
    return true;
  });

  const statusColors: Record<string, string> = {
    CREATED: "bg-slate-600",
    IN_PROGRESS: "bg-emerald-600",
    FINISHED: "bg-sky-600",
    CANCELLED: "bg-red-600",
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Torneos</h1>
          <p className="text-slate-400 text-sm mt-1">
            Gestiona campeonatos con grupos y eliminación directa
          </p>
        </div>
        <button
          onClick={() => navigate("/tournaments/create")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium transition"
        >
          <FiPlus size={16} /> Nuevo torneo
        </button>
      </div>

      {/* Filtros por disciplina/categoría */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <select
          className={inputClass}
          value={disciplineId}
          onChange={e => {
            setDisciplineId(e.target.value);
            setCategoryId("");
          }}
        >
          <option value="">Todas las disciplinas</option>
          {disciplines.map(d => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
        <select
          className={inputClass}
          value={categoryId}
          onChange={e => setCategoryId(e.target.value)}
          disabled={!disciplineId}
        >
          <option value="">
            {disciplineId ? "Todas las categorías" : "Selecciona disciplina"}
          </option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs text-slate-400 border-b border-slate-800">
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Disciplina</th>
              <th className="px-4 py-3">Categoría</th>
              <th className="px-4 py-3">Formato</th>
              <th className="px-4 py-3">Generación</th>
              <th className="px-4 py-3">Grupos</th>
              <th className="px-4 py-3 text-center">Estado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                  Cargando...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                  No hay torneos registrados
                </td>
              </tr>
            ) : (
              filtered.map(t => (
                <tr
                  key={t.id}
                  className="border-b border-slate-800 last:border-0 hover:bg-slate-800/40"
                >
                  <td className="px-4 py-3">
                    <Link
                      to={`/tournaments/${t.id}`}
                      className="text-white text-sm hover:text-sky-400"
                    >
                      {t.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-300 text-sm">
                    {t.discipline?.name}
                  </td>
                  <td className="px-4 py-3 text-slate-300 text-sm">
                    {t.category?.name}
                  </td>
                  <td className="px-4 py-3 text-slate-300 text-sm">
                    {t.formatType.replace(/_/g, " ").toLowerCase()}
                  </td>
                  <td className="px-4 py-3 text-slate-300 text-sm">
                    {t.generationMode.replace(/_/g, " ").toLowerCase()}
                  </td>
                  <td className="px-4 py-3 text-slate-300 text-sm">
                    {t._count?.groups ?? 0}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs text-white ${
                        statusColors[t.status] ?? "bg-slate-600"
                      }`}
                    >
                      {t.status.replace(/_/g, " ").toLowerCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => deleteTournament.mutate(t.id)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TournamentsPage;
