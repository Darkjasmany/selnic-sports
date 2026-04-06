import { useState } from "react";
import MatchForm, { type MatchFormValues } from "../components/MatchForm";
import MatchModal from "../components/MatchModal";
import MatchesTable from "../components/MatchTable";
import { useCreateMatch, useMatches } from "../hooks/useMatches";

const MatchesPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: matches = [], isLoading } = useMatches();

  const createMatch = useCreateMatch();

  const handleClose = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = (data: MatchFormValues) => {
    createMatch.mutate(data, { onSuccess: handleClose });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Partidos</h1>
          <p className="text-slate-400 text-sm mt-1">Gestiona el flujo completo de cada partido</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
        >
          + Nuevo partido
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-slate-400">
          Cargando partidos...
        </div>
      ) : matches.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-16 text-center">
          <p className="text-slate-400">No hay partidos registrados</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 text-sky-400 hover:text-sky-300 text-sm transition"
          >
            Crear el primer partido
          </button>
        </div>
      ) : (
        <MatchesTable matches={matches} />
      )}

      <MatchModal isOpen={isModalOpen} title="Nuevo partido" onClose={handleClose}>
        <MatchForm onSubmit={handleSubmit} isPending={isLoading} onCancel={handleClose} />
      </MatchModal>
    </div>
  );
};

export default MatchesPage;
