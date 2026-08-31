import { useNavigate, useParams } from "react-router-dom";
import PlayerCarnet from "../components/PlayerCarnet";
import { usePlayer } from "../hooks/usePlayers";

const PlayerCarnetPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: player, isLoading } = usePlayer(id!);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-400">
        Cargando carnet...
      </div>
    );
  }

  if (!player) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-400">No se encontró el jugador.</p>
        <button onClick={() => navigate("/players")} className="mt-4 text-sky-400 underline">
          Volver a la lista
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6 print:hidden">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-slate-400 hover:text-white transition"
        >
          ← Volver
        </button>
        <h1 className="text-xl font-semibold text-white">
          Carnet de {player.firstName} {player.lastName}
        </h1>
        <button
          onClick={() => window.print()}
          className="ml-auto bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
        >
          🖨 Imprimir carnet
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 flex justify-center">
        <PlayerCarnet player={player} />
      </div>
    </div>
  );
};

export default PlayerCarnetPage;
