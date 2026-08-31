import api from "@/api/client";
import { handleError } from "@/api/utils";

export type FormatType =
  | "GROUPS_AND_KNOCKOUT"
  | "KNOCKOUT_ONLY"
  | "ROUND_ROBIN";

export type GenerationMode = "AUTOMATIC" | "SEMI_AUTOMATIC" | "MANUAL";

export type Tournament = {
  id: string;
  name: string;
  disciplineId: string;
  categoryId: string;
  formatType: FormatType;
  generationMode: GenerationMode;
  qualifiedPerGroup: number;
  maxGroups: number | null;
  status: string;
  startDate: string | null;
  endDate: string | null;
  discipline?: { id: string; name: string };
  category?: { id: string; name: string };
  groups?: Group[];
  _count?: { groups: number; matches: number };
};

export type Group = {
  id: string;
  name: string;
  teamGroups?: TeamGroupRow[];
  _count?: { matches: number };
};

export type TeamGroupRow = {
  id: string;
  teamId: string;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  wins: number;
  draws: number;
  losses: number;
  team: { id: string; name: string };
};

export async function getTournaments(): Promise<Tournament[]> {
  try {
    const { data } = await api.get("/tournaments");
    return data.data;
  } catch (error) {
    handleError(error);
  }
}

export async function getTournamentById(id: string): Promise<Tournament> {
  try {
    const { data } = await api.get(`/tournaments/${id}`);
    return data.data;
  } catch (error) {
    handleError(error);
  }
}

export async function getTournamentStandings(id: string): Promise<any> {
  try {
    const { data } = await api.get(`/tournaments/${id}/standings`);
    return data.data;
  } catch (error) {
    handleError(error);
  }
}

export async function getTournamentStats(id: string): Promise<any> {
  try {
    const { data } = await api.get(`/tournaments/${id}/stats`);
    return data.data;
  } catch (error) {
    handleError(error);
  }
}

export async function getTournamentBracket(id: string): Promise<Record<string, any[]>> {
  try {
    const { data } = await api.get(`/tournaments/${id}/bracket`);
    return data.data;
  } catch (error) {
    handleError(error);
  }
}

export async function createTournament(input: {
  name: string;
  disciplineId: string;
  categoryId: string;
  formatType: FormatType;
  generationMode: GenerationMode;
  qualifiedPerGroup: number;
  maxGroups: number | null;
  startDate?: string | null;
  endDate?: string | null;
  teamIds?: string[];
}): Promise<Tournament> {
  try {
    const { data } = await api.post("/tournaments", input);
    return data.data;
  } catch (error) {
    handleError(error);
  }
}

export async function deleteTournament(id: string): Promise<void> {
  try {
    await api.delete(`/tournaments/${id}`);
  } catch (error) {
    handleError(error);
  }
}
