import { useState } from "react";
import type { Match, MatchPlayer, TeamSide } from "../../api/matches.api";

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

  return <div>StepValidation</div>;
};

export default StepValidation;
