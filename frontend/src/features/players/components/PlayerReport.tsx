import { formatDate, getAge } from "@/utils/date";
import { getPhotoUrl } from "@/utils/url";
import type { Player } from "../api/players.api";

type Props = {
  player: Player;
};
const PlayerReport = ({ player }: Props) => {
  const activeTeam = player.teams.find(t => t.isActive);

  return (
    <>
      {/* Estilos solo para impresión */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #player-report, #player-report * { visibility: visible !important; }
          #player-report { position: absolute; top: 0; left: 0; width: 100%; }
        }
      `}</style>

      <div id="player-report" className="bg-white text-gray-900 p-8 max-w-2xl mx-auto">
        {/* Encabezado */}
        <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
          <h1 className="text-xl font-bold uppercase tracking-wide">Ficha de Inscripción</h1>
          <p className="text-sm text-gray-600 mt-1">Sistema de Registro de Jugadores</p>
        </div>

        {/* Foto y datos principales */}
        <div className="flex gap-6 mb-6">
          <div
            className="w-28 h-32 border-2 border-gray-400 flex items-center
                          justify-center bg-gray-100 shrink-0"
          >
            {player.photoUrl ? (
              <img
                src={getPhotoUrl(player.photoUrl)}
                alt={player.firstName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-400 text-xs text-center px-2">Foto del jugador</span>
            )}
          </div>

          <div className="flex-1">
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium">Apellidos</p>
                <p className="text-sm font-semibold border-b border-gray-300 pb-1">
                  {player.lastName}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium">Nombres</p>
                <p className="text-sm font-semibold border-b border-gray-300 pb-1">
                  {player.firstName}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium">Cédula</p>
                <p className="text-sm border-b border-gray-300 pb-1">{player.documentId}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium">Fecha de nacimiento</p>
                <p className="text-sm border-b border-gray-300 pb-1">
                  {formatDate(player.birthDate)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium">Edad</p>
                <p className="text-sm border-b border-gray-300 pb-1">
                  {getAge(player.birthDate)} años
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium">Tipo de sangre</p>
                <p className="text-sm border-b border-gray-300 pb-1">{player.bloodType ?? "—"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Datos deportivos */}
        <div className="border border-gray-300 rounded p-4 mb-4">
          <h2 className="text-xs font-bold uppercase text-gray-600 mb-3">Datos deportivos</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium">Equipo</p>
              <p className="text-sm border-b border-gray-300 pb-1">
                {activeTeam?.team.name ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium">Categoría</p>
              <p className="text-sm border-b border-gray-300 pb-1">
                {activeTeam?.team.category.name ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium">Disciplina</p>
              <p className="text-sm border-b border-gray-300 pb-1">Fútbol</p>
            </div>
          </div>
        </div>

        {/* Representante legal */}
        {player.guardianName && (
          <div className="border border-gray-300 rounded p-4 mb-4">
            <h2 className="text-xs font-bold uppercase text-gray-600 mb-3">Representante legal</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium">Nombres y apellidos</p>
                <p className="text-sm border-b border-gray-300 pb-1">{player.guardianName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium">Relación</p>
                <p className="text-sm border-b border-gray-300 pb-1">
                  {player.guardianRelation ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium">Teléfono</p>
                <p className="text-sm border-b border-gray-300 pb-1">
                  {player.guardianPhone ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium">Email</p>
                <p className="text-sm border-b border-gray-300 pb-1">
                  {player.guardianEmail ?? "—"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Firma */}
        <div className="grid grid-cols-2 gap-8 mt-16">
          <div className="text-center">
            <div className="border-t border-gray-400 pt-2">
              <p className="text-xs text-gray-500">Firma del jugador / representante</p>
            </div>
          </div>
          <div className="text-center">
            <div className="border-t border-gray-400 pt-2">
              <p className="text-xs text-gray-500">Firma del organizador</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center mt-6">
          Generado el {new Date().toLocaleDateString("es-EC")}
        </p>
      </div>
    </>
  );
};

export default PlayerReport;
