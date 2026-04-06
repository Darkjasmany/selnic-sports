type Step = { number: number; label: string };

const steps: Step[] = [
  { number: 1, label: "Validar jugadores" },
  { number: 2, label: "Incidencias" },
  { number: 3, label: "Ficha final" },
];

type Props = {
  currentStep: number;
};

const MatchStepper = ({ currentStep }: Props) => {
  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((step, i) => (
        <div key={step.number} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-1">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium
              transition-colors ${
                currentStep > step.number
                  ? "bg-green-600 text-white"
                  : "bg-slate-800 text-slate-500"
              }
            `}
            >
              {currentStep > step.number ? "✓" : step.number}
            </div>
            <span
              className={`text-xs whitespace-nowrap ${
                currentStep === step.number ? "text-sky-400" : "text-slate-500"
              }`}
            >
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`
              flex-1 h-0.5 mb-5 mx-2 transition-colors
              ${currentStep > step.number ? "bg-green-600" : "bg-slate-800"}
            `}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default MatchStepper;
