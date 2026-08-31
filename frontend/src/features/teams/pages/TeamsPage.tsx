import { useDisciplines } from "@/features/disciplines/hooks/useDisciplines";
import { useState } from "react";
import type { Team } from "../api/teams.api";
import TeamForm from "../components/TeamForm";
import TeamModal from "../components/TeamModal";
import TeamTable from "../components/TeamTable";
import { useCreateTeam, useDeleteTeam, useTeams, useUpdateTeam } from "../hooks/useTeams";

const inputClass =
  "h-10 px-3 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:ring-2 focus:ring-sky-500 outline-none";

const TeamsPage = () => {
  const [search, setSearch] = useState("");
  const [disciplineId, setDisciplineId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);

  const { data: disciplines = [] } = useDisciplines();
  const { data: teams = [], isLoading } = useTeams(undefined, disciplineId || undefined);
  const createTeam = useCreateTeam();
  const updateTeam = useUpdateTeam();
  const deleteTeam = useDeleteTeam();

  const filtered = teams.filter(
    t =>
      t.name.toLowerCase().includes(search.toLocaleLowerCase()) ||
      t.category.name.toLocaleLowerCase().includes(search.toLocaleLowerCase())
  );

  const handleOpenCreate = () => {
    setEditingTeam(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (team: Team) => {
    setEditingTeam(team);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingTeam(null);
  };

  const handleSubmit = (data: any) => {
    if (editingTeam) {
      updateTeam.mutate({ id: editingTeam.id, input: data }, { onSuccess: handleClose });
    } else {
      createTeam.mutate(data, { onSuccess: handleClose });
    }
  };

  const handleDelete = (team: Team) => {
    if (team._count.players > 0) return;
    if (!window.confirm(`¿Eliminar el equipo "${team.name}"?`)) return;
    deleteTeam.mutate(team.id);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Equipos</h1>
          <p className="text-slate-400 text-sm mt-1">Gestiona los equipos por categoría</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
        >
          + Nuevo equipo
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl">
        <div className="p-4 border-b border-slate-800 flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Buscar por nombre o categoría..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full max-w-sm h-10 px-3 rounded-lg bg-slate-800 border
                       border-slate-700 text-white text-sm placeholder:text-slate-500
                       focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
          />
          <select
            className={inputClass}
            value={disciplineId}
            onChange={e => setDisciplineId(e.target.value)}
          >
            <option value="">Todas las disciplinas</option>
            {disciplines.map(d => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <TeamTable
          teams={filtered}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
          isLoading={isLoading}
        />
      </div>
      <TeamModal
        isOpen={isModalOpen}
        title={editingTeam ? "Editar equipo" : "Nuevo equipo"}
        onClose={handleClose}
      >
        <TeamForm
          defaultValues={editingTeam ?? undefined}
          onSubmit={handleSubmit}
          isPending={createTeam.isPending || updateTeam.isPending}
          onCancel={handleClose}
        />
      </TeamModal>
    </div>
  );
};

export default TeamsPage;
