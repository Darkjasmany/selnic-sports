import { formatDate, getAge } from "@/utils/date";
import { getPhotoUrl } from "@/utils/url";
import type { Player } from "../api/players.api";
import { QRCodeSVG } from "qrcode.react";

type Props = {
  player: Player;
};

const PlayerCarnet = ({ player }: Props) => {
  const activeTeam = player.teams.find(t => t.isActive);

  const qrData = JSON.stringify({
    name: `${player.firstName} ${player.lastName}`,
    documentId: player.documentId,
    team: activeTeam?.team.name ?? "",
    category: activeTeam?.team.category.name ?? "",
    discipline: player.discipline?.name ?? "",
    birthDate: player.birthDate,
  });

  return (
    <div className="carnet-item">
      <div
        className="bg-white border border-gray-300 rounded-lg p-3 flex gap-3 shadow-sm"
        style={{ fontFamily: "Arial, sans-serif", width: "340px", height: "220px" }}
      >
        {/* Photo */}
        <div className="border border-gray-400 bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden"
          style={{ width: "90px", height: "105px" }}
        >
          {player.photoUrl ? (
            <img
              src={getPhotoUrl(player.photoUrl)}
              alt={player.firstName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-gray-400 text-[10px] text-center px-1">Foto</span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div>
            <p className="text-[13px] font-bold text-gray-900 leading-tight truncate">
              {player.firstName} {player.lastName}
            </p>
            <p className="text-[10px] text-gray-600 mt-0.5">
              CI: {player.documentId}
            </p>
            <div className="mt-1.5 space-y-1">
              <p className="text-[10px] text-gray-600">
                <span className="font-semibold">Equipo:</span> {activeTeam?.team.name ?? "—"}
              </p>
              <p className="text-[10px] text-gray-600">
                <span className="font-semibold">Categoría:</span> {activeTeam?.team.category.name ?? "—"}
              </p>
              <p className="text-[10px] text-gray-600">
                <span className="font-semibold">Disciplina:</span> {player.discipline?.name ?? "—"}
              </p>
              <p className="text-[10px] text-gray-600">
                <span className="font-semibold">Edad:</span> {getAge(player.birthDate)} años
              </p>
            </div>
          </div>

          {/* QR */}
          <div className="flex justify-end">
            <div className="bg-white p-0.5 border border-gray-200">
              <QRCodeSVG value={qrData} size={56} level="M" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerCarnet;
