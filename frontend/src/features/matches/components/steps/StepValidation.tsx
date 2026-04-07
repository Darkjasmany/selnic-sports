import { useState } from "react";
import type { Match, MatchPlayer, TeamSide } from "../../api/matches.api";
import { useValidatePlayer } from "../../hooks/useMatches";

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
  const canProceed = homeValidated >= 11 && awayValidated >= 11; // TODO Requiere al menos 11 jugadores validados por equipo

  const handleValidate = (player: MatchPlayer, side: TeamSide) => {
    if (!player.biometricData) return alert("El jugador no tiene datos biométricos registrados");
    setValidating({ player, side });
  };

  return <div>StepValidation</div>;
};

export default StepValidation;
