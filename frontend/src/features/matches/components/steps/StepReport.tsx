import type { Match } from "../../api/matches.api";

type Props = { match: Match };

const INCIDENT_LABELS: Record<string, string> = {
  GOAL: "⚽ Gol",
  YELLOW_CARD: "🟨 Tarjeta amarilla",
  RED_CARD: "🟥 Tarjeta roja",
  CORNER: "🚩 Corner",
  FOUL: "⚠️ Falta",
  SUBSTITUTION: "🔄 Cambio",
  NOTE: "📝 Nota",
};

export default function StepReport({ match }: Props) {
  const homeValidations = match.validations.filter(v => v.teamSide === "HOME");
  const awayValidations = match.validations.filter(v => v.teamSide === "AWAY");
  const homeIncidents = match.incidents.filter(i => i.teamSide === "HOME");
  const awayIncidents = match.incidents.filter(i => i.teamSide === "AWAY");

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #match-report, #match-report * { visibility: visible !important; }
          #match-report { position: absolute; top: 0; left: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="no-print flex justify-end mb-4">
        <button
          onClick={() => window.print()}
          className="bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium
                     px-4 py-2 rounded-lg transition"
        >
          🖨 Imprimir ficha
        </button>
      </div>

      <div id="match-report" className="bg-white text-gray-900 p-8 rounded-xl max-w-3xl mx-auto">
        {/* Encabezado */}
        <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
          <h1 className="text-xl font-bold uppercase">Acta del Partido</h1>
          <p className="text-sm text-gray-600 mt-1">Sistema de Registro de Jugadores</p>
        </div>

        {/* Info general */}
        <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
          <div>
            <p className="text-xs text-gray-500 uppercase font-medium">Categoría</p>
            <p className="font-semibold">{match.category.name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-medium">Fecha</p>
            <p className="font-semibold">
              {new Date(match.scheduledAt).toLocaleDateString("es-EC", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-medium">Estado</p>
            <p className="font-semibold">Finalizado</p>
          </div>
        </div>

        {/* Marcador */}
        <div className="border-2 border-gray-800 rounded-lg p-4 mb-6 text-center">
          <div className="flex items-center justify-center gap-8">
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium mb-1">Local</p>
              <p className="text-lg font-bold">{match.homeTeam.name}</p>
            </div>
            <div className="text-4xl font-bold text-gray-900">
              {match.homeScore ?? 0} — {match.awayScore ?? 0}
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium mb-1">Visitante</p>
              <p className="text-lg font-bold">{match.awayTeam.name}</p>
            </div>
          </div>
        </div>

        {/* Jugadores validados */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <h2 className="text-xs font-bold uppercase text-gray-600 mb-2">
              Jugadores validados — {match.homeTeam.name}
            </h2>
            <table className="w-full text-xs">
              <tbody>
                {homeValidations.map((v, i) => (
                  <tr key={v.playerId} className="border-b border-gray-200">
                    <td className="py-1 text-gray-500 w-6">{i + 1}</td>
                    <td className="py-1">
                      {v.player.lastName}, {v.player.firstName}
                    </td>
                    <td className="py-1 text-right text-green-600">✓</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase text-gray-600 mb-2">
              Jugadores validados — {match.awayTeam.name}
            </h2>
            <table className="w-full text-xs">
              <tbody>
                {awayValidations.map((v, i) => (
                  <tr key={v.playerId} className="border-b border-gray-200">
                    <td className="py-1 text-gray-500 w-6">{i + 1}</td>
                    <td className="py-1">
                      {v.player.lastName}, {v.player.firstName}
                    </td>
                    <td className="py-1 text-right text-green-600">✓</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Incidencias */}
        {match.incidents.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xs font-bold uppercase text-gray-600 mb-2">
              Incidencias del partido
            </h2>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-400">
                  <th className="text-left py-1 font-medium">Min</th>
                  <th className="text-left py-1 font-medium">Tipo</th>
                  <th className="text-left py-1 font-medium">Equipo</th>
                  <th className="text-left py-1 font-medium">Jugador</th>
                </tr>
              </thead>
              <tbody>
                {match.incidents.map(inc => (
                  <tr key={inc.id} className="border-b border-gray-200">
                    <td className="py-1">{inc.minute ?? "—"}</td>
                    <td className="py-1">{INCIDENT_LABELS[inc.type]}</td>
                    <td className="py-1">
                      {inc.teamSide === "HOME"
                        ? match.homeTeam.name
                        : inc.teamSide === "AWAY"
                          ? match.awayTeam.name
                          : "—"}
                    </td>
                    <td className="py-1">
                      {inc.player ? `${inc.player.lastName}, ${inc.player.firstName}` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Observaciones */}
        {match.notes && (
          <div className="mb-6">
            <h2 className="text-xs font-bold uppercase text-gray-600 mb-2">Observaciones</h2>
            <p className="text-sm border border-gray-300 rounded p-3 text-gray-700">
              {match.notes}
            </p>
          </div>
        )}

        {/* Firmas */}
        <div className="grid grid-cols-2 gap-8 mt-8">
          <div className="text-center">
            <div className="border-t border-gray-400 pt-2">
              <p className="text-xs text-gray-500">Árbitro / Organizador</p>
            </div>
          </div>
          <div className="text-center">
            <div className="border-t border-gray-400 pt-2">
              <p className="text-xs text-gray-500">Delegado técnico</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center mt-6">
          Generado el {new Date().toLocaleDateString("es-EC")}
        </p>
      </div>
    </>
  );
}
