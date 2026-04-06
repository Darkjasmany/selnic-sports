import { PLAYERS_KEY } from "@/features/players/hooks/usePlayers";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  createMatch,
  getMatchById,
  getMatches,
  getMatchPlayers,
  saveIncidents,
  validatePlayer,
  type TeamSide,
} from "../api/matches.api";

export const MATCHES_KEY = "matches";

export function useMatches() {
  return useQuery({
    queryKey: [MATCHES_KEY],
    queryFn: getMatches,
  });
}

export function useMatch(id: string) {
  return useQuery({
    queryKey: [MATCHES_KEY, id],
    queryFn: () => getMatchById(id),
    enabled: !!id, // !!id: Es un truco de JavaScript para convertir cualquier valor a un Booleano (true o false).
    refetchInterval: 3000, // refresca cada 3s durante validación
  });
}

export function useMatchPlayer(id: string) {
  return useQuery({
    queryKey: [MATCHES_KEY, id, PLAYERS_KEY],
    queryFn: () => getMatchPlayers(id),
    enabled: !!id,
  });
}

export function useCreateMatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createMatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MATCHES_KEY] });
      toast.success("Partido creado correctamente");
    },
    onError: error => {
      toast.error(error.message);
    },
  });
}

export function useValidatePlayer(matchId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { playerId: string; teamSide: TeamSide; biometricDescriptor: number[] }) =>
      validatePlayer(matchId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MATCHES_KEY, matchId] }); //Al pasar el matchId, solo "molestas" al partido que realmente cambió. El resto de la aplicación sigue usando su caché tranquilo.
      toast.success("Jugador validado");
    },
    onError: error => {
      toast.error(error.message);
    },
  });
}

/** 
 * typeof saveIncidents: "Dime cómo es la firma (la estructura) de la función saveIncidents".

Parameters<...>: "Extrae todos los tipos de los argumentos que recibe esa función y ponlos en una lista (un array)".

[1]: "Dame el tipo del segundo parámetro (el que está en la posición 1)".
*/
export function useSaveIncidents(matchId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof saveIncidents>[1]) => saveIncidents(matchId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MATCHES_KEY] });
      toast.success("Partido finalizado correctamente");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
