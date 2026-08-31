import { useCategories } from "@/features/categories/hooks/useCategories";
import { useDisciplines } from "@/features/disciplines/hooks/useDisciplines";
import { useTeams } from "@/features/teams/hooks/useTeams";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { FormatType, GenerationMode } from "../api/tournaments.api";
import { useCreateTournament } from "../hooks/useTournaments";

const inputClass =
  "h-10 px-3 w-full rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:ring-2 focus:ring-sky-500 outline-none";
const labelClass = "block text-sm font-medium text-slate-300 mb-1";

const TournamentCreatePage = () => {
  const navigate = useNavigate();
  const createTournament = useCreateTournament();

  const [disciplineId, setDisciplineId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [name, setName] = useState("");
  const [formatType, setFormatType] = useState<FormatType>("GROUPS_AND_KNOCKOUT");
  const [generationMode, setGenerationMode] = useState<GenerationMode>("AUTOMATIC");
  const [qualifiedPerGroup, setQualifiedPerGroup] = useState(2);
  const [maxGroups, setMaxGroups] = useState(4);
  const [teamIds, setTeamIds] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("");

  const { data: disciplines = [] } = useDisciplines();
  const { data: categories = [] } = useCategories(disciplineId || undefined);
  const { data: teams = [] } = useTeams(categoryId || undefined, disciplineId || undefined);

  const toggleTeam = (id: string) => {
    setTeamIds(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disciplineId || !categoryId) return;
    createTournament.mutate(
      {
        name,
        disciplineId,
        categoryId,
        formatType,
        generationMode,
        qualifiedPerGroup,
        maxGroups: formatType === "ROUND_ROBIN" ? null : maxGroups,
        startDate: startDate || null,
        endDate: null,
        teamIds: generationMode === "AUTOMATIC" ? teamIds : undefined,
      },
      {
        onSuccess: t => navigate(`/tournaments/${t.id}`),
      }
    );
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white">Crear Torneo</h1>
        <p className="text-slate-400 text-sm mt-1">
          Configura el torneo y genera su calendario automáticamente
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
        {/* Datos básicos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className={labelClass}>Nombre del torneo</label>
            <input
              className={inputClass}
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ej: Copa Campeones 2026"
              required
            />
          </div>

          <div>
            <label className={labelClass}>Disciplina</label>
            <select
              className={inputClass}
              value={disciplineId}
              onChange={e => {
                setDisciplineId(e.target.value);
                setCategoryId("");
              }}
              required
            >
              <option value="">Seleccionar disciplina</option>
              {disciplines.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Categoría</label>
            <select
              className={inputClass}
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              disabled={!disciplineId}
              required
            >
              <option value="">
                {disciplineId ? "Seleccionar categoría" : "Primero selecciona disciplina"}
              </option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Formato y generación */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Formato</label>
            <select
              className={inputClass}
              value={formatType}
              onChange={e => setFormatType(e.target.value as FormatType)}
            >
              <option value="GROUPS_AND_KNOCKOUT">Grupos + Eliminación</option>
              <option value="KNOCKOUT_ONLY">Eliminación directa</option>
              <option value="ROUND_ROBIN">Todos contra todos (Round Robin)</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Modo de generación</label>
            <select
              className={inputClass}
              value={generationMode}
              onChange={e => setGenerationMode(e.target.value as GenerationMode)}
            >
              <option value="AUTOMATIC">Automático (check)</option>
              <option value="SEMI_AUTOMATIC">Semi-automático</option>
              <option value="MANUAL">Manual con asistencia</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Fecha de inicio</label>
            <input
              type="date"
              className={inputClass}
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
            />
          </div>
        </div>

        {/* Configuración de grupos */}
        {formatType === "GROUPS_AND_KNOCKOUT" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Número de grupos (configurable)</label>
              <input
                type="number"
                min={1}
                className={inputClass}
                value={maxGroups}
                onChange={e => setMaxGroups(Number(e.target.value))}
              />
            </div>
            <div>
              <label className={labelClass}>Clasificados por grupo</label>
              <input
                type="number"
                min={1}
                max={8}
                className={inputClass}
                value={qualifiedPerGroup}
                onChange={e => setQualifiedPerGroup(Number(e.target.value))}
              />
            </div>
          </div>
        )}

        {/* Selección de equipos (solo si es automático) */}
        {generationMode === "AUTOMATIC" && (
          <div>
            <label className={labelClass}>
              Equipos participantes ({teamIds.length} seleccionados)
            </label>
            {!categoryId ? (
              <p className="text-sm text-slate-500">
                Selecciona disciplina y categoría para cargar los equipos
              </p>
            ) : teams.length === 0 ? (
              <p className="text-sm text-slate-500">
                No hay equipos en esta categoría
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                {teams.map(t => {
                  const selected = teamIds.includes(t.id);
                  return (
                    <button
                      type="button"
                      key={t.id}
                      onClick={() => toggleTeam(t.id)}
                      className={`text-left px-3 py-2 rounded-lg border text-sm transition ${
                        selected
                          ? "bg-sky-600 border-sky-500 text-white"
                          : "bg-slate-800 border-slate-700 text-slate-300 hover:border-sky-600"
                      }`}
                    >
                      {t.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={!disciplineId || !categoryId}
            className="h-10 px-5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium disabled:opacity-50 transition"
          >
            {createTournament.isPending ? "Creando..." : "Crear torneo"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/tournaments")}
            className="h-10 px-5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm transition"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default TournamentCreatePage;
