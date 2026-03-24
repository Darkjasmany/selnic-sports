import { useState } from "react";
import type { Category } from "../api/categories.api";

type Props = {
  categories: Category[];
  isLoading: boolean;
  onDelete: (id: string) => void;
  onUpdate: (id: string, name: string) => void;
};

const CategoryTable = ({ categories, isLoading, onDelete, onUpdate }: Props) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const handleStartEdit = (category: Category) => {
    setEditingId(category.id);
    setEditingName(category.name);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  const handleSave = (id: string) => {
    if (!editingName.trim()) return;
    onUpdate(id, editingName.trim());
    handleCancelEdit();
  };

  if (isLoading) {
    return <div className="py-16 text-center text-slate-400">Cargando categorías...</div>;
  }

  if (categories.length === 0) {
    return <div className="py-16 text-center text-slate-400">No hay categorías registradas</div>;
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-slate-800">
          <th className="text-left py-3 px-4 text-slate-400 font-medium">#</th>
          <th className="text-left py-3 px-4 text-slate-400 font-medium">Nombre</th>
          <th className="text-left py-3 px-4 text-slate-400 font-medium">Equipos</th>
          <th className="text-right py-3 px-4 text-slate-400 font-medium">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {categories.map((category, index) => (
          <tr
            key={category.id}
            className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
          >
            <td className="py-3 px-4 text-slate-500">{index + 1}</td>
            <td className="py-3 px-4">
              {editingId === category.id ? (
                <input
                  autoFocus
                  value={editingName}
                  onChange={e => setEditingName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter") handleSave(category.id);
                    if (e.key === "Escape") handleCancelEdit();
                  }}
                  className="h-8 px-2 rounded bg-slate-800 border border-sky-500 text-white outline-none"
                />
              ) : (
                <span className="text-white font-medium">{category.name}</span>
              )}
            </td>
            <td className="py-3 px-4">
              <span className="bg-slate-800 text-slate-400 text-xs px-2 py-1 rounded-md">
                {category._count?.teams || 0} equipo(s)
              </span>
            </td>
            <td className="py-3 px-4 text-right">
              <div className="flex items-center justify-end gap-2">
                {editingId === category.id ? (
                  <>
                    <button
                      onClick={() => handleSave(category.id)}
                      className="text-xs px-3 py-1.5 rounded-md bg-sky-700 hover:bg-sky-600 text-white transition"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="text-xs px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-400 transition"
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleStartEdit(category)}
                      className="text-xs px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`¿Eliminar "${category.name}"?`)) onDelete(category.id);
                      }}
                      disabled={category._count.teams > 0}
                      className="text-xs px-3 py-1.5 rounded-md bg-red-900/30 hover:bg-red-900/50 text-red-400 transition disabled:opacity-20"
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
