import api from "@/api/client";
import { handleError } from "@/api/utils";

export type MatchStatus = "PENDING" | "VALIDATING_PLAYERS" | "IN_PROGRESS" | "FINISHED";

export type TeamSide = "HOME" | "AWAY";

export type IncidentType =
  | "GOAL"
  | "YELLOW_CARD"
  | "RED_CARD"
  | "CORNER"
  | "FOUL"
  | "SUBSTITUTION"
  | "NOTE";

export type MatchPlayer = {
  id: string;
  firstName: string;
  lastName: string;
  documentId: string;
  photoUrl?: string;
  biometricData?: number[];
};

export type Match = {
  id: string;
  scheduledAt: string;
  status: MatchStatus;
  homeScore?: number;
  awayScore?: number;
  notes?: string;
  homeTeam: { id: string; name: string };
  awayTeam: { id: string; name: string };
  category: { id: string; name: string };
  validations: {
    playerId: string;
    teamSide: TeamSide;
    validatedAt: string;
    player: { id: string; firstName: string; lastName: string; photoUrl?: string };
  }[];
  incidents: {
    id: string;
    type: IncidentType;
    minute?: number;
    quantity?: number;
    notes?: string;
    teamSide?: TeamSide;
    player?: { id: string; firstName: string; lastName: string };
  }[];
};

export type Incident = {
  playerId?: string;
  teamSide?: TeamSide;
  type: IncidentType;
  minute?: number;
  quantity?: number;
  notes?: string;
};

export async function getMatches(): Promise<Match[]> {
  try {
    const { data } = await api.get("/matches");
    return data.data;
  } catch (error) {
    handleError(error);
  }
}

export async function getMatchById(id: string): Promise<Match> {
  try {
    const { data } = await api.get(`/matches/${id}`);
    return data.data;
  } catch (error) {
    handleError(error);
  }
}

export async function getMatchPlayers(
  id: string
): Promise<{ home: MatchPlayer[]; away: MatchPlayer[] }> {
  try {
    const { data } = await api.get(`/matches/${id}/players`);
    return data.data;
  } catch (error) {
    handleError(error);
  }
}

export async function createMatch(input: {
  homeTeamId: string;
  awayTeamId: string;
  categoryId: string;
  scheduledAt: string;
  notes?: string;
}): Promise<Math> {
  try {
    const { data } = await api.post("/matches", input);
    return data.data;
  } catch (error) {
    handleError(error);
  }
}

export async function validatePlayer(
  matchId: string,
  input: { playerId: string; teamSide: TeamSide; biometricDescriptor: number[] }
): Promise<void> {
  try {
    await api.post(`/matches/${matchId}/validate`, input);
  } catch (error) {
    handleError(error);
  }
}

export async function saveIncidents(
  matchId: string,
  input: { homeScore: number; awayScore: number; notes?: string; incidents: Incident[] }
): Promise<Match> {
  try {
    const { data } = await api.post(`/matches/${matchId}/incidents`, input);
    return data.data;
  } catch (error) {
    handleError(error);
  }
}
