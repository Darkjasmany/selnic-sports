import api from "@/api/client";
import { handleError } from "@/api/utils";

export type Discipline = {
  id: string;
  name: string;
  playersPerField: number;
  maxSubstitutions: number | null;
  allowsDraw: boolean;
  _count?: { categories: number; teams: number; tournaments: number };
  categories?: { id: string; name: string }[];
};

export async function getDisciplines(): Promise<Discipline[]> {
  try {
    const { data } = await api.get("/disciplines");
    return data.data;
  } catch (error) {
    handleError(error);
  }
}

export async function createDiscipline(input: {
  name: string;
  playersPerField: number;
  maxSubstitutions?: number | null;
  allowsDraw?: boolean;
}): Promise<Discipline> {
  try {
    const { data } = await api.post("/disciplines", input);
    return data.data;
  } catch (error) {
    handleError(error);
  }
}

export async function updateDiscipline(
  id: string,
  input: Partial<{
    name: string;
    playersPerField: number;
    maxSubstitutions?: number | null;
    allowsDraw?: boolean;
  }>
): Promise<Discipline> {
  try {
    const { data } = await api.patch(`/disciplines/${id}`, input);
    return data.data;
  } catch (error) {
    handleError(error);
  }
}

export async function deleteDiscipline(id: string): Promise<void> {
  try {
    await api.delete(`/disciplines/${id}`);
  } catch (error) {
    handleError(error);
  }
}
