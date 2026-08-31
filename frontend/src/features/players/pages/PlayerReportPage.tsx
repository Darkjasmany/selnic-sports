import { useNavigate, useParams } from "react-router-dom";
import PlayerReport from "../components/PlayerReport";
import { usePlayer } from "../hooks/usePlayers";

const PlayerReportPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: player, isLoading } = usePlayer(id!);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-400">Cargando ficha...</div>
    );
  }

  if (!player) return null;

  if (!player && !isLoading) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-400">No se encontró el jugador o no tienes permisos.</p>
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
          Ficha de {player.firstName} {player.lastName}
        </h1>
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => navigate(`/players/${player.id}/carnet`)}
            className="bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            🪪 Carnet
          </button>
          <button
            onClick={() => window.print()}
            className="bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            🖨 Imprimir ficha
          </button>
        </div>
      </div>
      <PlayerReport player={player} />
    </div>
  );
};

export default PlayerReportPage;
