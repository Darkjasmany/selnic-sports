import { useState } from "react";

const inputClass =
  "h-10 px-3 w-full rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:ring-2 focus:ring-sky-500 outline-none";
const labelClass = "block text-sm font-medium text-slate-300 mb-1";

type Props = {
  onSubmit: (data: {
    name: string;
    playersPerField: number;
    maxSubstitutions: number | null;
    allowsDraw: boolean;
  }) => void;
  isPending?: boolean;
};

const DisciplineForm = ({ onSubmit, isPending }: Props) => {
  const [name, setName] = useState("");
  const [playersPerField, setPlayersPerField] = useState(11);
  const [maxSubstitutions, setMaxSubstitutions] = useState(5);
  const [hasSubs, setHasSubs] = useState(true);
  const [allowsDraw, setAllowsDraw] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      playersPerField,
      maxSubstitutions: hasSubs ? maxSubstitutions : null,
      allowsDraw,
    });
    setName("");
    setPlayersPerField(11);
    setMaxSubstitutions(5);
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className={labelClass}>Nombre de la disciplina</label>
        <input
          className={inputClass}
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Ej: Fútbol, Básquetbol, Ajedrez"
          required
        />
      </div>
      <div>
        <label className={labelClass}>Jugadores en campo</label>
        <input
          type="number"
          min={1}
          className={inputClass}
          value={playersPerField}
          onChange={e => setPlayersPerField(Number(e.target.value))}
          required
        />
      </div>
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <label className={labelClass}>Máximo de cambios</label>
          <input
            type="number"
            min={0}
            disabled={!hasSubs}
            className={inputClass}
            value={maxSubstitutions}
            onChange={e => setMaxSubstitutions(Number(e.target.value))}
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-300 mb-2">
          <input type="checkbox" checked={hasSubs} onChange={e => setHasSubs(e.target.checked)} />
          Sin cambios
        </label>
      </div>
      <div className="flex md:pt-7">
        <label className="flex items-center justify-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={allowsDraw}
            onChange={e => setAllowsDraw(e.target.checked)}
          />
          Permite empate
        </label>
      </div>
      <div className="md:col-span-2">
        <button
          type="submit"
          disabled={isPending}
          className="h-10 px-4 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium disabled:opacity-50 transition"
        >
          {isPending ? "Creando..." : "Crear disciplina"}
        </button>
      </div>
    </form>
  );
};

export default DisciplineForm;
