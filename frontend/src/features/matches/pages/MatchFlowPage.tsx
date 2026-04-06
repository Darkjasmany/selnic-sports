import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MatchStepper from "../components/MatchStepper";
import StepIncidents from "../components/steps/StepIncidents";
import StepReport from "../components/steps/StepReport";
import StepValidation from "../components/steps/StepValidation";
import { useMatch, useMatchPlayer } from "../hooks/useMatches";

const MatchFlowPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const { data: match, isLoading: loadingMatch } = useMatch(id!);
  const { data: players, isLoading: loadingPlayers } = useMatchPlayer(id!);

  if (loadingMatch || loadingPlayers) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-400">
        Cargando partido...
      </div>
    );
  }

  if (!match || !players) return null;

  // Si el partido ya está finalizado, va directo al reporte
  const currentStep = match.status === "FINISHED" ? 3 : step;

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/matches")}
          className="text-sm text-slate-400 hover:text-white transition"
        >
          ← Volver
        </button>
        <div>
          <h1 className="text-xl font-semibold text-white">
            {match.homeTeam.name} vs {match.awayTeam.name}
          </h1>
          <p className="text-slate-400 text-sm">
            {match.category.name} — {new Date(match.scheduledAt).toLocaleDateString("es-EC")}
          </p>
        </div>
      </div>

      <MatchStepper currentStep={currentStep} />

      {currentStep === 1 && (
        <StepValidation match={match} players={players} onComplete={() => setStep(2)} />
      )}
      {currentStep === 2 && <StepIncidents />}
      {currentStep === 3 && <StepReport />}
    </div>
  );
};

export default MatchFlowPage;
