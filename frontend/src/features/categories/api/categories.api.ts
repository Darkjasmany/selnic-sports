import api from "@/api/client";
import { handleError } from "@/api/utils";

export type Category = {
  id: string;
  name: string;
  disciplineId: string;
  _count: { teams: number };
  discipline?: { id: string; name: string };
};

export async function getCategories(disciplineId?: string): Promise<Category[]> {
  try {
    const { data } = await api.get("/categories", {
      params: disciplineId ? { disciplineId } : undefined,
    });
    return data.data;
  } catch (error) {
    handleError(error);
  }
}

export async function createCategory(input: {
  name: string;
  disciplineId: string;
}): Promise<Category> {
  try {
    const { data } = await api.post("/categories", input);
    return data.data;
  } catch (error) {
    handleError(error);
  }
}

export async function updateCategory(
  id: string,
  name: string,
  disciplineId?: string
): Promise<Category> {
  try {
    const { data } = await api.patch(`/categories/${id}`, {
      name,
      ...(disciplineId ? { disciplineId } : {}),
    });
    return data.data;
  } catch (error) {
    handleError(error);
  }
}

export async function deleteCategory(id: string): Promise<void> {
  try {
    await api.delete(`/categories/${id}`);
  } catch (error) {
    handleError(error);
  }
}
