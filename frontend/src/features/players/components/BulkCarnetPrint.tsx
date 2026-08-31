import type { Player } from "../api/players.api";
import PlayerCarnet from "./PlayerCarnet";

type Props = {
  players: Player[];
};

const BulkCarnetPrint = ({ players }: Props) => {
  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          .bulk-carnet-print, .bulk-carnet-print * { visibility: visible !important; }
          .bulk-carnet-print { position: absolute; top: 0; left: 0; width: 100%; }
          .bulk-carnet-print .carnet-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10mm;
            padding: 10mm;
          }
          .bulk-carnet-print .carnet-item {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>
      <div className="bulk-carnet-print">
        <div className="carnet-grid p-4">
          {players.map(player => (
            <div key={player.id} className="carnet-item flex justify-center">
              <PlayerCarnet player={player} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default BulkCarnetPrint;
