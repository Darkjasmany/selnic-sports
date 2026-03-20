import api from "@/api/client";
import { isAxiosError } from "axios";

export type Team = {
  id: string;
  name: string;
  categoryId: string;
  location?: string;
  managerPhone?: string;
  coachName?: string;
  category: { id: string; name: string };
  _count: { players: number };
};

export type CreateTeamInput = {
  name: string;
  categoryId: string;
  location?: string;
  managerPhone?: string;
  coachName?: string;
};

export type UpdateTeamInput = Partial<CreateTeamInput>;

function handleError(error: unknown): never {
  if (isAxiosError(error) && error.response) {
    throw new Error(error.response.data.message ?? "Error en la operación");
  }
  throw error;
}

export async function getTeams(categoryId?: string): Promise<Team[]> {
  try {
    const params = categoryId ? { categoryId } : {};
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
