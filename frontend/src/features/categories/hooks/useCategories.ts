import { TEAMS_KEY } from "@/features/teams/hooks/useTeams";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../api/categories.api";

export const CATEGORIES_KEY = "categories";

export function useCategories(disciplineId?: string) {
  return useQuery({
    queryKey: [CATEGORIES_KEY, disciplineId],
    queryFn: () => getCategories(disciplineId),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name, disciplineId }: { name: string; disciplineId: string }) =>
      createCategory({ name, disciplineId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_KEY] });
      toast.success("Categoría creada correctamente");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      name,
      disciplineId,
    }: {
      id: string;
      name: string;
      disciplineId?: string;
    }) => updateCategory(id, name, disciplineId),
    onSuccess: () => {
      Promise.all([
        queryClient.invalidateQueries({ queryKey: [CATEGORIES_KEY] }),
        queryClient.invalidateQueries({ queryKey: [TEAMS_KEY] }),
      ]);
      toast.success("Categoría actualizada correctamente");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_KEY] });
      toast.success("Categoría eliminada correctamente");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
