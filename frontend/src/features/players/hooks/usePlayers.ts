import { TEAMS_KEY } from "@/features/teams/hooks/useTeams";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  createPlayer,
  deletePlayer,
  getPlayerById,
  getPlayers,
  updatePlayer,
  type UpdatePlayerInput,
} from "../api/players.api";

export const PLAYERS_KEY = "players";

// Mientras que useQuery sirve para leer datos, useMutation sirve para cambiar datos (Crear, Actualizar o Borrar).

// QueryClient (El "Cerebro de la Caché") Es el objeto central que maneja toda la memoria de tu aplicación. Imagina que es una bodega donde se guardan todas las respuestas de la API. Cuando usas const queryClient = useQueryClient(), estás pidiendo la llave de esa bodega para poder manipular lo que hay dentro.

export function usePlayers(search?: string, teamId?: string) {
  return useQuery({
    queryKey: [PLAYERS_KEY, search, teamId],
    queryFn: () => getPlayers(search, teamId),
  });
}

export function usePlayer(id: string) {
  return useQuery({
    queryKey: [PLAYERS_KEY, id],
    queryFn: () => getPlayerById(id),
  });
}

export function useCreatePlayer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPlayer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PLAYERS_KEY] });
      queryClient.invalidateQueries({ queryKey: [TEAMS_KEY] });
      toast.success("Jugador registrado correctamente");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdatePlayer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdatePlayerInput }) =>
      updatePlayer(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PLAYERS_KEY] });
      queryClient.invalidateQueries({ queryKey: [TEAMS_KEY] });
      toast.success("Jugador actualizado correctamente");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeletePlayer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePlayer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PLAYERS_KEY] });
      queryClient.invalidateQueries({ queryKey: [TEAMS_KEY] });
      toast.success("Jugador eliminado correctamente");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
