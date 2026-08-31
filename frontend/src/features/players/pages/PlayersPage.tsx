import { FaceCapture } from "@/features/biometric";
import { useDisciplines } from "@/features/disciplines/hooks/useDisciplines";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Player } from "../api/players.api";
import PlayerForm, { type PlayerFormValues } from "../components/PlayerForm";
import PlayerModal from "../components/PlayerModal";
import PlayerTable from "../components/PlayerTable";
import {
  PLAYERS_KEY,
  useCreatePlayer,
  useDeletePlayer,
  usePlayers,
  useUpdatePlayer,
  useUploadPhoto,
} from "../hooks/usePlayers";

const PlayersPage = () => {
  const [search, setSearch] = useState("");
  const [disciplineId, setDisciplineId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const navigate = useNavigate();

  const { data: disciplines = [] } = useDisciplines();
  const { data: players = [], isLoading } = usePlayers(
    search || undefined,
    undefined,
    disciplineId || undefined
  );
  const createPlayer = useCreatePlayer();
  const updatePlayer = useUpdatePlayer();
  const deletePlayer = useDeletePlayer();
  const uploadPhoto = useUploadPhoto();

  // Estado Biometrico
  const [biometricPlayer, setBiometricPlayer] = useState<Player | null>(null);
  const queryClient = useQueryClient();

  const handleOpen = (player?: Player) => {
    setEditingPlayer(player ?? null);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingPlayer(null);
  };

  const handleSubmit = (data: PlayerFormValues, photo?: File) => {
    if (editingPlayer) {
      updatePlayer.mutate(
        { id: editingPlayer.id, input: data },
        {
          onSuccess: async updatedPlayer => {
            // Si hay foto nueva, la subimos
            if (photo) {
              await uploadPhoto.mutateAsync({ id: updatedPlayer.id, file: photo });
            }
            handleClose();
          },
        }
      );
    } else {
      createPlayer.mutate(data, {
        onSuccess: async createdPlayer => {
          if (photo) {
            await uploadPhoto.mutateAsync({ id: createdPlayer.id, file: photo });
          }
          handleClose();
        },
      });
    }
  };

  const handleBiometricSaved = () => {
    setBiometricPlayer(null);
    queryClient.invalidateQueries({ queryKey: [PLAYERS_KEY] });
  };

  const handleDelete = (player: Player) => {
    if (!window.confirm(`¿Eliminar a ${player.firstName} ${player.lastName}?`)) return;
    deletePlayer.mutate(player.id);
  };

  const handleViewReport = (player: Player) => {
    navigate(`/players/${player.id}/report`);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Jugadores</h1>
          <p className="text-slate-400 text-sm mt-1">
            Registra y gestiona los jugadores del torneo
          </p>
        </div>
        <button
          onClick={() => navigate("/players/bulk-carnets")}
          className="bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
        >
          🪪 Imprimir Carnets
        </button>
        <button
          onClick={() => handleOpen()}
          className="bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
        >
          + Nuevo Jugador
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl">
        <div className="p-4 border-b border-slate-800 flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Buscar por nombre o cédula..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full max-w-sm h-10 px-3 rounded-lg bg-slate-800 border  border-slate-700 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
          />
          <select
            className="h-10 px-3 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:ring-2 focus:ring-sky-500 outline-none"
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

        <PlayerTable
          players={players}
          onEdit={handleOpen}
          onDelete={handleDelete}
          onViewReport={handleViewReport}
          onCaptureBiometric={setBiometricPlayer}
          isLoading={isLoading}
        />
      </div>

      <PlayerModal
        isOpen={isModalOpen}
        title={editingPlayer ? "Editar jugador" : "Nuevo jugador"}
        onClose={handleClose}
      >
        <PlayerForm
          defaultValues={
            editingPlayer
              ? {
                  ...editingPlayer,
                  birthDate: editingPlayer.birthDate.split("T")[0],
                  teamId: editingPlayer.teams.find(t => t.isActive)?.team.id ?? "",
                  guardianRelation: editingPlayer.guardianRelation ?? undefined,
                }
              : undefined
          }
          onSubmit={handleSubmit}
          isPending={createPlayer.isPending || updatePlayer.isPending}
          onCancel={handleClose}
        />
      </PlayerModal>

      {biometricPlayer && (
        <FaceCapture
          playerId={biometricPlayer.id}
          playerName={`${biometricPlayer.firstName} ${biometricPlayer.lastName}`}
          hasBiometric={!!biometricPlayer.biometricData}
          onSaved={handleBiometricSaved}
          onCancel={() => setBiometricPlayer(null)}
        />
      )}
    </div>
  );
};

export default PlayersPage;
