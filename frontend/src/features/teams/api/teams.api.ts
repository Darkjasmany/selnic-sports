import api from "@/api/client";
import { handleError } from "@/api/utils";

export type Team = {
  id: string;
  name: string;
  disciplineId: string;
  categoryId: string;
  location?: string;
  managerPhone?: string;
  coachName?: string;
  category: { id: string; name: string };
  discipline?: { id: string; name: string };
  stats?: { active: number; total: number };
  _count: { players: number };
};

export type CreateTeamInput = {
  name: string;
  disciplineId: string;
  categoryId: string;
  location?: string;
  managerPhone?: string;
  coachName?: string;
};

export type UpdateTeamInput = Partial<CreateTeamInput>;

export async function getTeams(
  categoryId?: string,
  disciplineId?: string
): Promise<Team[]> {
  try {
    const params: Record<string, string> = {};
    if (categoryId) params.categoryId = categoryId;
    if (disciplineId) params.disciplineId = disciplineId;
    const { data } = await api.get("/teams", { params });
    return data.data;
  } catch (error) {
    handleError(error);
  }
}

export async function getTeamById(id: string): Promise<Team> {
  try {
    const { data } = await api.get(`/teams/${id}`);
    return data.data;
  } catch (error) {
    handleError(error);
  }
}

export async function createTeam(input: CreateTeamInput): Promise<Team> {
  try {
    const { data } = await api.post("/teams", input);
    return data.data;
  } catch (error) {
    handleError(error);
  }
}

export async function updateTeam(id: string, input: UpdateTeamInput): Promise<Team> {
  try {
    const { data } = await api.patch(`/teams/${id}`, input);
    return data.data;
  } catch (error) {
    handleError(error);
  }
}

export async function deleteTeam(id: string): Promise<void> {
  try {
    await api.delete(`/teams/${id}`);
  } catch (error) {
    handleError(error);
  }
}
