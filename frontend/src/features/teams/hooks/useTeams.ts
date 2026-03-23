import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  createTeam,
  deleteTeam,
  getTeams,
  updateTeam,
  type UpdateTeamInput,
} from "../api/teams.api";

// El useQuery Se usa para traer datos (peticiones GET). Se encargará de manejar el estado de carga, error y datos de la consulta
//useMutation(El Ejecutor) Se usa para modificar datos (POST, PUT, DELETE).
//useQueryClient (El Director de Orquesta) Es el objeto que tiene el control de toda la memoria (caché) de la aplicación. Lo usamos principalmente para la Invalidación: Cuando creas un equipo nuevo, el queryClient le dice a la lista de equipos: "Oye, lo que tienes guardado ya no es real, bórralo y pide la lista nueva al servidor".

export const TEAMS_KEY = "teams";

export function useTeams(categoryId?: string) {
  return useQuery({
    queryKey: [TEAMS_KEY, categoryId],
    queryFn: () => getTeams(categoryId),
  });
}

export function useCreateTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEAMS_KEY] });
      toast.success("Equipo creado correctamente");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUpdateTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTeamInput }) => updateTeam(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEAMS_KEY] });
      toast.success("Equipo actualizado correctamente");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEAMS_KEY] });
      toast.success("Equipo eliminado correctamente");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
