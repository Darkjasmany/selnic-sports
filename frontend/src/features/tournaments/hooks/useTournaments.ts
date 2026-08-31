import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  createTournament,
  deleteTournament,
  getTournamentBracket,
  getTournaments,
  getTournamentStandings,
  getTournamentStats,
} from "../api/tournaments.api";

export const TOURNAMENTS_KEY = "tournaments";

export function useTournaments() {
  return useQuery({
    queryKey: [TOURNAMENTS_KEY],
    queryFn: getTournaments,
  });
}

export function useTournament(id?: string) {
  return useQuery({
    queryKey: [TOURNAMENTS_KEY, id],
    queryFn: () => getTournaments().then(list => list.find(t => t.id === id)),
    enabled: !!id,
  });
}

export function useTournamentStandings(id: string) {
  return useQuery({
    queryKey: [TOURNAMENTS_KEY, id, "standings"],
    queryFn: () => getTournamentStandings(id),
    enabled: !!id,
  });
}

export function useTournamentStats(id: string) {
  return useQuery({
    queryKey: [TOURNAMENTS_KEY, id, "stats"],
    queryFn: () => getTournamentStats(id),
    enabled: !!id,
  });
}

export function useTournamentBracket(id: string) {
  return useQuery({
    queryKey: [TOURNAMENTS_KEY, id, "bracket"],
    queryFn: () => getTournamentBracket(id),
    enabled: !!id,
  });
}

export function useCreateTournament() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTournament,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TOURNAMENTS_KEY] });
      toast.success("Torneo creado correctamente");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteTournament() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTournament,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TOURNAMENTS_KEY] });
      toast.success("Torneo eliminado correctamente");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
