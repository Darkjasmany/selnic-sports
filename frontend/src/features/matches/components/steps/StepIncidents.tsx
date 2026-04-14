import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { Incident, IncidentType, Match, MatchPlayer, TeamSide } from "../../api/matches.api";
import { useSaveIncidents } from "../../hooks/useMatches";

const schema = z.object({
  homeScore: z.number().int().min(0),
  awayScore: z.number().int().min(0),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  match: Match;
  players: { home: MatchPlayer[]; away: MatchPlayer[] };
  onComplete: () => void;
};

type IncidentRow = Incident & { tempId: string };

const INCIDENT_LABELS: Record<IncidentType, string> = {
  GOAL: "⚽ Gol",
  YELLOW_CARD: "🟨 Tarjeta amarilla",
  RED_CARD: "🟥 Tarjeta roja",
  CORNER: "🚩 Corner",
  FOUL: "⚠️ Falta",
  SUBSTITUTION: "🔄 Cambio",
  NOTE: "📝 Nota",
};

export default function StepIncidents({ match, players, onComplete }: Props) {
  const [incidents, setIncidents] = useState<IncidentRow[]>([]);
  const saveIncidents = useSaveIncidents(match.id);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { homeScore: 0, awayScore: 0 },
  });

  const addIncident = () => {
    setIncidents(prev => [
      ...prev,
      {
        tempId: crypto.randomUUID(),
        type: "GOAL",
        teamSide: "HOME",
      },
    ]);
  };

  const removeIncident = (tempId: string) => {
    setIncidents(prev => prev.filter(i => i.tempId !== tempId));
  };

  const updateIncident = (tempId: string, changes: Partial<IncidentRow>) => {
    setIncidents(prev => prev.map(i => (i.tempId === tempId ? { ...i, ...changes } : i)));
  };

  const onSubmit = (formData: FormValues) => {
    saveIncidents.mutate(
      {
        ...formData,
        incidents: incidents.map(({ tempId, ...inc }) => inc),
      },
      { onSuccess: onComplete }
    );
  };

  const allPlayers = (side: TeamSide) => (side === "HOME" ? players.home : players.away);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      {/* Marcador */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-medium text-slate-300 mb-4">Marcador final</h3>
        <div className="flex items-center gap-4 justify-center">
          <div className="text-center">
            <p className="text-xs text-slate-400 mb-2">{match.homeTeam.name}</p>
            <input
              type="number"
              min={0}
              {...register("homeScore", { valueAsNumber: true })}
              className="w-20 h-14 text-center text-2xl font-bold rounded-lg
                         bg-slate-800 border border-slate-700 text-white
                         focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <span className="text-3xl text-slate-600 font-bold">—</span>
          <div className="text-center">
            <p className="text-xs text-slate-400 mb-2">{match.awayTeam.name}</p>
            <input
              type="number"
              min={0}
              {...register("awayScore", { valueAsNumber: true })}
              className="w-20 h-14 text-center text-2xl font-bold rounded-lg
                         bg-slate-800 border border-slate-700 text-white
                         focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>
      </div>

      {/* Incidencias */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-slate-300">Incidencias del partido</h3>
          <button
            type="button"
            onClick={addIncident}
            className="text-xs px-3 py-1.5 rounded-lg bg-slate-800
                       hover:bg-slate-700 text-sky-400 transition"
          >
            + Agregar
          </button>
        </div>

        {incidents.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-6">No hay incidencias registradas</p>
        ) : (
          <div className="flex flex-col gap-3">
            {incidents.map(incident => (
              <div
                key={incident.tempId}
                className="grid grid-cols-12 gap-2 items-center p-3
                           bg-slate-800/50 rounded-lg border border-slate-800"
              >
                {/* Tipo */}
                <select
                  value={incident.type}
                  onChange={e =>
                    updateIncident(incident.tempId, {
                      type: e.target.value as IncidentType,
                    })
                  }
                  className="col-span-3 h-9 px-2 rounded-lg bg-slate-800 border
                             border-slate-700 text-white text-xs focus:outline-none
                             focus:ring-1 focus:ring-sky-500"
                >
                  {Object.entries(INCIDENT_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>

                {/* Equipo */}
                <select
                  value={incident.teamSide ?? "HOME"}
                  onChange={e =>
                    updateIncident(incident.tempId, {
                      teamSide: e.target.value as TeamSide,
                      playerId: undefined,
                    })
                  }
                  className="col-span-2 h-9 px-2 rounded-lg bg-slate-800 border
                             border-slate-700 text-white text-xs focus:outline-none
                             focus:ring-1 focus:ring-sky-500"
                >
                  <option value="HOME">{match.homeTeam.name}</option>
                  <option value="AWAY">{match.awayTeam.name}</option>
                </select>

                {/* Jugador */}
                <select
                  value={incident.playerId ?? ""}
                  onChange={e =>
                    updateIncident(incident.tempId, {
                      playerId: e.target.value || undefined,
                    })
                  }
                  className="col-span-3 h-9 px-2 rounded-lg bg-slate-800 border
                             border-slate-700 text-white text-xs focus:outline-none
                             focus:ring-1 focus:ring-sky-500"
                >
                  <option value="">Sin jugador</option>
                  {allPlayers(incident.teamSide ?? "HOME").map(p => (
                    <option key={p.id} value={p.id}>
                      {p.lastName}, {p.firstName}
                    </option>
                  ))}
                </select>

                {/* Minuto */}
                <input
                  type="number"
                  min={1}
                  max={120}
                  placeholder="Min"
                  value={incident.minute ?? ""}
                  onChange={e =>
                    updateIncident(incident.tempId, {
                      minute: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                  className="col-span-2 h-9 px-2 rounded-lg bg-slate-800 border
                             border-slate-700 text-white text-xs text-center
                             focus:outline-none focus:ring-1 focus:ring-sky-500"
                />

                {/* Eliminar */}
                <button
                  type="button"
                  onClick={() => removeIncident(incident.tempId)}
                  className="col-span-1 h-9 flex items-center justify-center
                             text-red-400 hover:text-red-300 transition"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Observaciones */}
      <div>
        <label className="text-xs text-slate-400 mb-1 block">Observaciones generales</label>
        <textarea
          rows={3}
          placeholder="Novedades del partido..."
          {...register("notes")}
          className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700
                     text-white text-sm placeholder:text-slate-500
                     focus:outline-none focus:ring-2 focus:ring-sky-500 transition resize-none"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saveIncidents.isPending}
          className="px-6 py-2.5 rounded-lg bg-green-600 hover:bg-green-500
                     disabled:opacity-50 text-white font-medium transition text-sm"
        >
          {saveIncidents.isPending ? "Guardando..." : "Finalizar partido →"}
        </button>
      </div>
    </form>
  );
}
