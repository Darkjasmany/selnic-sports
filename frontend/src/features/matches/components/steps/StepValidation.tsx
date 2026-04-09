import { useState } from "react";
import type { Match, MatchPlayer, TeamSide } from "../../api/matches.api";
import { useValidatePlayer } from "../../hooks/useMatches";
import FaceVerify from "../FaceVerify";
import PlayerCard from "./PlayerCard";

type Props = {
  match: Match;
  players: { home: MatchPlayer[]; away: MatchPlayer[] };
  onComplete: () => void;
};

type ValidatingState = {
  player: MatchPlayer;
  side: TeamSide;
} | null;

const StepValidation = ({ match, players, onComplete }: Props) => {
  const [validating, setValidating] = useState<ValidatingState>(null);
  const validatePlayer = useValidatePlayer(match.id);

  const validateIds = new Set(match.validations.map(v => v.playerId));
  const homeValidated = match.validations.filter(v => v.teamSide === "HOME").length;
  const awayValidated = match.validations.filter(v => v.teamSide === "AWAY").length;
  const totalValidated = homeValidated + awayValidated;
  const canProceed = homeValidated >= 1 && awayValidated >= 1; // TODO Requiere al menos 11 jugadores validados por equipo

  const handleValidate = (player: MatchPlayer, side: TeamSide) => {
    if (!player.biometricData) return alert("El jugador no tiene datos biométricos registrados");
    setValidating({ player, side });
  };

  const handleVerifySuccess = () => {
    if (!validating || !validating.player.biometricData) return;

    validatePlayer.mutate(
      {
        playerId: validating.player.id,
        teamSide: validating.side,
        biometricDescriptor: validating.player.biometricData,
      },
      {
        onSuccess: () => setValidating(null),
        onError: () => setValidating(null),
      }
    );
  };

  return (
    <div>
      {/* Progreso */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-400">Progeso de validación</span>
          <span className="text-sm font-medium text-white">{totalValidated} / 2</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-2">
          <div
            className="bg-sky-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(totalValidated / 2) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Equipos */}
      <div className="grid grid-cols-2 gap-6">
        {/* Local */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-white">{match.homeTeam.name}</h3>
            <span className="text-xs text-slate-400">{homeValidated} validados</span>
          </div>
          <div className="flex flex-col gap-2">
            {players.home.map(player => (
              <PlayerCard
                key={player.id}
                player={player}
                side="HOME"
                validatedId={validateIds}
                handleValidate={handleValidate}
                validatePlayer={validatePlayer}
              />
            ))}
          </div>
        </div>

        {/* Visitantes */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-white">{match.awayTeam.name}</h3>
            <span className="text-xs text-slate-400">{awayValidated} validados</span>
          </div>
          <div className="flex flex-col gap-2">
            {players.away.map(player => (
              <PlayerCard
                key={player.id}
                player={player}
                side="AWAY"
                validatedId={validateIds}
                handleValidate={handleValidate}
                validatePlayer={validatePlayer}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Botón siguiente */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={onComplete}
          disabled={!canProceed}
          className="px-6 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium transition text-sm"
        >
          {canProceed
            ? "Continuar a incidencias"
            : `Faltan jugadores (${1 - homeValidated} local, ${1 - awayValidated} visitante)`}
        </button>
      </div>

      {validating && (
        <FaceVerify
          playerDescriptor={validating.player.biometricData!}
          playerName={`${validating.player.firstName} ${validating.player.lastName}`}
          onSuccess={handleVerifySuccess}
          onCancel={() => setValidating(null)}
        />
      )}
    </div>
  );
};

export default StepValidation;
