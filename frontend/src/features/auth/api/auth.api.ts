import api from "@/api/client";
import { useAuthStore } from "@/store/auth.store";
import { isAxiosError } from "axios";
import type { LoginInput } from "../schema/auth.schema";

type LoginResponse = {
  success: boolean;
  data: {
    user: { id: string; name: string; email: string; role: string };
    token: string;
  };
};

export async function authenticateUser(formData: LoginInput) {
  try {
    const url = "/auht/login";
    const { data } = await api.post<LoginResponse>(url, formData);
    // Guardar en Zustand para mantener la sesión
    useAuthStore.getState().setAuth(data.data.user, data.data.token);
    return data.data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message ?? "Error al iniciar sesión");
    }
  }
}
