import { useState } from "react";
import { FiTrash2 } from "react-icons/fi";
import DisciplineForm from "../components/DisciplineForm";
import {
  useCreateDiscipline,
  useDeleteDiscipline,
  useDisciplines,
} from "../hooks/useDisciplines";

const DisciplinesPage = () => {
  const { data: disciplines = [], isLoading } = useDisciplines();
  const createDiscipline = useCreateDiscipline();
  const deleteDiscipline = useDeleteDiscipline();

  const handleCreate = (data: {
    name: string;
    playersPerField: number;
    maxSubstitutions: number | null;
    allowsDraw: boolean;
  }) => {
    createDiscipline.mutate(data);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white">Disciplinas</h1>
        <p className="text-slate-400 text-sm mt-1">
          Deportes soportados por el sistema con sus reglas de alineación
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-5">
        <DisciplineForm
          onSubmit={handleCreate}
          isPending={createDiscipline.isPending}
        />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800">
          <span className="text-white text-sm font-medium">
            Lista de disciplinas ({disciplines.length})
          </span>
        </div>

        <table className="w-full">
          <thead>
            <tr className="text-left text-xs text-slate-400 border-b border-slate-800">
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Jugadores en campo</th>
              <th className="px-4 py-3">Cambios</th>
              <th className="px-4 py-3">Empate</th>
              <th className="px-4 py-3">Categorías</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  Cargando...
                </td>
              </tr>
            ) : disciplines.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  No hay disciplinas registradas
                </td>
              </tr>
            ) : (
              disciplines.map(d => (
                <tr
                  key={d.id}
                  className="border-b border-slate-800 last:border-0 hover:bg-slate-800/40"
                >
                  <td className="px-4 py-3 text-white text-sm">{d.name}</td>
                  <td className="px-4 py-3 text-slate-300 text-sm">
                    {d.playersPerField}
                  </td>
                  <td className="px-4 py-3 text-slate-300 text-sm">
                    {d.maxSubstitutions === null || d.maxSubstitutions === 0
                      ? "Sin cambios"
                      : d.maxSubstitutions}
                  </td>
                  <td className="px-4 py-3 text-slate-300 text-sm">
                    {d.allowsDraw ? "Sí" : "No"}
                  </td>
                  <td className="px-4 py-3 text-slate-300 text-sm">
                    {d._count?.categories ?? 0}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => deleteDiscipline.mutate(d.id)}
                      disabled={(d._count?.teams ?? 0) > 0}
                      title={
                        (d._count?.teams ?? 0) > 0
                          ? "No se puede eliminar: tiene equipos"
                          : `Eliminar ${d.name}`
                      }
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DisciplinesPage;
