import api from "@/api/client";
import { handleError } from "@/api/utils";

export type Category = {
  id: string;
  name: string;
  _count: { teams: number };
};

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
