import { useState } from "react";
import type { Category } from "../api/categories.api";
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "../hooks/useCategories";

export default function CategoriesPage() {
  const [search, setSearch] = useState("");
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const { data: categories = [], isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const filtered = categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  const handleCreate = () => {
    if (!newName.trim()) return;
    createCategory.mutate(newName.trim(), {
      onSuccess: () => setNewName(""),
    });
  };

  const handleStartEdit = (category: Category) => {
    setEditingId(category.id);
    setEditingName(category.name);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  const handleUpdate = (id: string) => {
    if (!editingName.trim()) return;
    updateCategory.mutate({ id, name: editingName.trim() }, { onSuccess: handleCancelEdit });
  };

  const handleDelete = (category: Category) => {
    if (category._count.teams > 0) return;
    if (!window.confirm(`¿Eliminar la categoría "${category.name}"?`)) return;
    deleteCategory.mutate(category.id);
  };

  const inputClass = `h-10 px-3 rounded-lg bg-slate-800 border border-slate-700
    text-white text-sm placeholder:text-slate-500
    focus:outline-none focus:ring-2 focus:ring-sky-500 transition`;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white">Categorías</h1>
        <p className="text-slate-400 text-sm mt-1">Administra las divisiones del torneo</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-5">
        <h2 className="text-sm font-medium text-slate-300 mb-3">Agregar categoría</h2>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Ej: Sub12, Sub15, Mayores..."
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleCreate()}
            className={`${inputClass} flex-1 max-w-sm`}
          />
          <button
            onClick={handleCreate}
            disabled={createCategory.isPending || !newName.trim()}
            className="h-10 px-4 bg-sky-600 hover:bg-sky-500 disabled:opacity-50
                       text-white text-sm font-medium rounded-lg transition"
          >
            {createCategory.isPending ? "Agregando..." : "Agregar"}
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl">
        <div className="p-4 border-b border-slate-800">
          <input
            type="text"
            placeholder="Buscar categoría..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={`${inputClass} w-full max-w-sm`}
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            Cargando categorías...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            No hay categorías registradas
          </div>
        ) : (
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
              {filtered.map((category, index) => (
                <tr
                  key={category.id}
                  className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                >
                  <td className="py-3 px-4 text-slate-500">{index + 1}</td>
                  <td className="py-3 px-4">
                    {editingId === category.id ? (
                      <input
                        value={editingName}
                        onChange={e => setEditingName(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === "Enter") handleUpdate(category.id);
                          if (e.key === "Escape") handleCancelEdit();
                        }}
                        autoFocus
                        className={`${inputClass} w-48`}
                      />
                    ) : (
                      <span className="text-white font-medium">{category.name}</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className="bg-slate-800 text-slate-400 text-xs px-2 py-1 rounded-md">
                      {category._count.teams} equipo(s)
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {editingId === category.id ? (
                        <>
                          <button
                            onClick={() => handleUpdate(category.id)}
                            disabled={updateCategory.isPending}
                            className="text-xs px-3 py-1.5 rounded-md bg-sky-700
                                       hover:bg-sky-600 text-white transition"
                          >
                            Guardar
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="text-xs px-3 py-1.5 rounded-md bg-slate-800
                                       hover:bg-slate-700 text-slate-400 transition"
                          >
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleStartEdit(category)}
                            className="text-xs px-3 py-1.5 rounded-md bg-slate-800
                                       hover:bg-slate-700 text-slate-300 transition"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(category)}
                            disabled={category._count.teams > 0}
                            title={
                              category._count.teams > 0 ? "Tiene equipos asociados" : "Eliminar"
                            }
                            className="text-xs px-3 py-1.5 rounded-md bg-red-900/30
                                       hover:bg-red-900/50 text-red-400 transition
                                       disabled:opacity-30 disabled:cursor-not-allowed"
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
        )}
      </div>
    </div>
  );
}
