import { CATEGORIES_KEY } from "@/features/categories/hooks/useCategories";
import { TEAMS_KEY } from "@/features/teams/hooks/useTeams";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  createDiscipline,
  deleteDiscipline,
  getDisciplines,
  updateDiscipline,
} from "../api/disciplines.api";

export const DISCIPLINES_KEY = "disciplines";

export function useDisciplines() {
  return useQuery({
    queryKey: [DISCIPLINES_KEY],
    queryFn: getDisciplines,
  });
}

export function useCreateDiscipline() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDiscipline,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DISCIPLINES_KEY] });
      toast.success("Disciplina creada correctamente");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUpdateDiscipline() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof updateDiscipline>[1] }) =>
      updateDiscipline(id, input),
    onSuccess: () => {
      Promise.all([
        queryClient.invalidateQueries({ queryKey: [DISCIPLINES_KEY] }),
        queryClient.invalidateQueries({ queryKey: [CATEGORIES_KEY] }),
        queryClient.invalidateQueries({ queryKey: [TEAMS_KEY] }),
      ]);
      toast.success("Disciplina actualizada correctamente");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteDiscipline() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteDiscipline,
    onSuccess: () => {
      Promise.all([
        queryClient.invalidateQueries({ queryKey: [DISCIPLINES_KEY] }),
        queryClient.invalidateQueries({ queryKey: [CATEGORIES_KEY] }),
      ]);
      toast.success("Disciplina eliminada correctamente");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
