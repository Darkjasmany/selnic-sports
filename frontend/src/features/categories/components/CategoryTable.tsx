import { useState } from "react";
import type { Category } from "../api/categories.api";

type Props = {
  categories: Category[];
  isLoading: boolean;
  onDelete: (id: string) => void;
  onUpdate: (id: string, name: string) => void;
  isUpdating: boolean;
};

const CategoryTable = ({ categories, isLoading, onDelete, onUpdate, isUpdating }: Props) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  const handleSave = (id: string) => {
    if (!editName.trim()) return;
    onUpdate(id, editName.trim());
    setEditingId(null);
  };

  if (isLoading) return <div className="p-10 text-center text-slate-400">Cargando...</div>;

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-slate-800 text-slate-400">
          <th className="text-left py-3 px-4 font-medium">Nombre</th>
          <th className="text-left py-3 px-4 font-medium">Equipos</th>
          <th className="text-right py-3 px-4 font-medium">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {categories.map(cat => (
          <tr key={cat.id} className="border-b border-slate-800/50 hover:bg-slate-800/20">
            <td className="py-3 px-4">
              {editingId === cat.id ? (
                <input
                  autoFocus
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSave(cat.id)}
                  className="bg-slate-800 border border-sky-500 text-white px-2 py-1 rounded outline-none"
                />
              ) : (
                <span className="text-white font-medium">{cat.name}</span>
              )}
            </td>
            <td className="py-3 px-4">
              <span className="text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded text-xs">
                {cat._count.teams} equipos
              </span>
            </td>
            <td className="py-3 px-4 text-right">
              <div className="flex justify-end gap-2">
                {editingId === cat.id ? (
                  <>
                    <button
                      onClick={() => handleSave(cat.id)}
                      className="text-sky-400 hover:text-sky-300"
                    >
                      Guardar
                    </button>
                    <button onClick={cancelEdit} className="text-slate-500">
                      Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startEdit(cat)}
                      className="text-slate-400 hover:text-white"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => onDelete(cat.id)}
                      disabled={cat._count.teams > 0}
                      className="text-red-400/60 hover:text-red-400 disabled:opacity-20"
                    >
                      Eliminar
                    </button>
                  </>
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default CategoryTable;
