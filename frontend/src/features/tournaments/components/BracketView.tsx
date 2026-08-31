type MatchPhase =
  | "GROUPS"
  | "ROUND_OF_16"
  | "QUARTER_FINAL"
  | "SEMI_FINAL"
  | "THIRD_PLACE"
  | "FINAL";

type BracketMatch = {
  id: string;
  home: { id: string; name: string };
  away: { id: string; name: string };
  homeScore: number | null;
  awayScore: number | null;
  status: string;
};

const PHASE_ORDER: MatchPhase[] = [
  "ROUND_OF_16",
  "QUARTER_FINAL",
  "SEMI_FINAL",
  "THIRD_PLACE",
  "FINAL",
];

const PHASE_LABELS: Record<string, string> = {
  ROUND_OF_16: "Octavos de final",
  QUARTER_FINAL: "Cuartos de final",
  SEMI_FINAL: "Semifinal",
  THIRD_PLACE: "Tercer puesto",
  FINAL: "Final",
};

interface Props {
  bracket: Record<string, BracketMatch[]>;
}

const TeamSlot = ({
  name,
  score,
  winner,
}: {
  name: string | null;
  score: number | null;
  winner?: boolean;
}) => (
  <div
    className={`flex items-center justify-between px-3 py-1.5 text-sm rounded-md ${
      winner
        ? "bg-sky-600/30 text-sky-200 font-semibold"
        : "bg-slate-800 text-slate-300"
    }`}
  >
    <span className="truncate">{name ?? "Por definir"}</span>
    {score !== null && <span className="ml-2 font-mono">{score}</span>}
  </div>
);

const BracketView = ({ bracket }: Props) => {
  // Determinar ganadores por partido ya finalizado
  const winnerOf = (m: BracketMatch): string | null => {
    if (m.status !== "FINISHED" || m.homeScore === null || m.awayScore === null)
      return null;
    if (m.homeScore > m.awayScore) return m.home.name;
    if (m.homeScore < m.awayScore) return m.away.name;
    return m.home.name; // empate -> local (tiebreak simplificado)
  };

  // Construir el mapa de ganadores por partido
  const winnersById: Record<string, string | null> = {};
  Object.values(bracket).forEach(round =>
    round.forEach(m => {
      winnersById[m.id] = winnerOf(m);
    })
  );

  // Ordenar fases presentes
  const presentPhases = PHASE_ORDER.filter(p => bracket[p]?.length);

  return (
    <div className="overflow-x-auto">
      <div className="flex items-start gap-8 min-w-max">
        {presentPhases.map((phase, pi) => (
          <div key={phase} className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-sky-400 text-center mb-2">
              {PHASE_LABELS[phase]}
            </h3>
            {bracket[phase].map(m => (
              <div key={m.id} className="space-y-1">
                <TeamSlot
                  name={m.home.name}
                  score={m.homeScore}
                  winner={winnersById[m.id] === m.home.name}
                />
                <TeamSlot
                  name={m.away.name}
                  score={m.awayScore}
                  winner={winnersById[m.id] === m.away.name}
                />
              </div>
            ))}
            {pi < presentPhases.length - 1 && (
              <div className="text-center text-2xl text-slate-600">→</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BracketView;
