import { useState } from "react";
import CategoryForm from "../components/CategoryForm";
import CategoryTable from "../components/CategoryTable";
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "../hooks/useCategories";

const CategoriesPage = () => {
  const [search, setSearch] = useState("");

  const { data: categories = [], isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const filtered = categories.filter(c =>
    c.name.toLocaleLowerCase().includes(search.toLocaleLowerCase())
  );

  // Ahora recibe el objeto que viene de Zod
  const handleCreate = (data: { name: string }) => {
    createCategory.mutate(data.name);
  };

  // const handleStartEditing = (category: Category) => {
  //   setEditingCategoryId(category.id);
  //   setEditingName(category.name);
  // };

  // const handleCancelEdit = () => {
  //   setEditingCategoryId(null);
  //   setEditingName("");
  // };

  // const handleUpdate = (id: string) => {
  //   if (!editingName.trim()) return;
  //   updateCategory.mutate({ id, name: editingName.trim() }, { onSuccess: () => handleCancelEdit });
  // };

  // const handleDelete = (category: Category) => {
  //   if (category._count.teams > 0) return;
  //   if (!window.confirm(`¿Eliminar la categoría "${category.name}"?`)) return;
  //   deleteCategory.mutate(category.id);
  // };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white">Categorías</h1>
        <p className="text-slate-400 text-sm mt-1">Administra las divisiones del torneo</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-5">
        <CategoryForm onSubmit={handleCreate} isPending={createCategory.isPending} />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800">
          <input
            type="text"
            placeholder="Buscar categoría..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-10 px-3 w-full max-w-sm rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:ring-2 focus:ring-sky-500 outline-none"
          />
        </div>

        <CategoryTable
          categories={filtered}
          isLoading={isLoading}
          onDelete={id => deleteCategory.mutate(id)}
          onUpdate={(id, name) => updateCategory.mutate({ id, name })}
          isUpdating={updateCategory.isPending}
        />
      </div>
    </div>
  );
};

export default CategoriesPage;
