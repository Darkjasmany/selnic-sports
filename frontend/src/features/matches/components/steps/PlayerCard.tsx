import type { MatchPlayer, TeamSide } from "../../api/matches.api";

type Props = {
  player: MatchPlayer;
  side: TeamSide;
  validatedId: Set<string>;
  handleValidate: (player: MatchPlayer, side: TeamSide) => void;
  validatePlayer: any;
};

const PlayerCard = ({ player, side, validatedId, handleValidate, validatePlayer }: Props) => {
  const isValidated = validatedId.has(player.id);
  const hasBiometric = !!player.biometricData; // !! para convertir en booleano

  return (
    <div
      className={`
            flex items-center gap-3 p-3 rounded-lg border transition-colors
            ${isValidated ? "border-green-700 bg-green-900/20" : "border-slate-800 bg-slate-900"}
    `}
    >
      <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-xs text-slate-300 shrink-0 overflow-hidden">
        {player.photoUrl ? (
          <img src={player.photoUrl} className="w-full h-full object-cover" />
        ) : (
          `${player.lastName[0]}${player.firstName[0]}`
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white truncate">
          {player.lastName}, {player.firstName}
        </p>
        <p className="text-xs text-slate-500">{player.documentId}</p>
      </div>
      {isValidated ? (
        <span className="text-green-400 text-lg shrink-0">✓</span>
      ) : (
        <button
          onClick={() => handleValidate(player, side)}
          disabled={!hasBiometric || validatePlayer.isPending}
          title={!hasBiometric ? "Sin biométrico registrado" : "Validar jugador"}
          className="shrink-0 text-xs px-2 py-1.5 rounded-md transition bg-sky-700 hover:bg-sky-600 text-white disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {hasBiometric ? "Validar" : "Sin datos "}
        </button>
      )}
    </div>
  );
};

export default PlayerCard;
