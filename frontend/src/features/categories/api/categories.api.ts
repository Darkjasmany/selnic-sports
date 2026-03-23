import api from "@/api/client";
import { isAxiosError } from "axios";

export type Category = {
  id: string;
  name: string;
  _count: { teams: number };
};

function handleError(error: unknown): never {
  if (isAxiosError(error) && error.response) {
    throw new Error(error.response.data.message ?? "Error en la operación");
  }
  throw error;
}

export async function getCategories(): Promise<Category[]> {
  try {
    const { data } = await api.get("/categories");
    return data.data;
  } catch (error) {
    handleError(error);
  }
}

export async function createCategory(name: string): Promise<Category> {
  try {
    const { data } = await api.post("/categories", { name });
    return data.data;
  } catch (error) {
    handleError(error);
  }
}

export async function updateCategory(id: string, name: string): Promise<Category> {
  try {
    const { data } = await api.patch(`/categories/${id}`, { name });
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
