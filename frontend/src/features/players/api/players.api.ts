import api from "@/api/client";
import { handleError } from "@/api/utils";

export type Player = {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  documentId: string;
  phone?: string;
  address?: string;
  bloodType?: string;
  nationality: string;
  photoUrl?: string;
  biometricData?: number[];
  biometricType: "FACIAL" | "FINGERPRINT";
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  guardianRelation?: "PADRE" | "MADRE" | "OTRO";
  createdAt: string;
  teams: {
    isActive: boolean;
    team: {
      id: string;
      name: string;
      category: { id: string; name: string };
    };
  }[];
};

export type CreatePlayerInput = {
  firstName: string;
  lastName: string;
  birthDate: string;
  documentId: string;
  teamId: string;
  phone?: string;
  address?: string;
  bloodType?: string;
  nationality?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  guardianRelation?: "PADRE" | "MADRE" | "OTRO";
};

export type UpdatePlayerInput = Partial<CreatePlayerInput>;

export async function getPlayers(search?: string, teamId?: string): Promise<Player[]> {
  try {
    const { data } = await api.get("/players", { params: { search, teamId } });
    return data.data;
  } catch (error) {
    handleError(error);
  }
}

export async function getPlayerById(id: string): Promise<Player> {
  try {
    const { data } = await api.get(`/players/${id}`);
    return data.data;
  } catch (error) {
    handleError(error);
  }
}

export async function createPlayer(input: CreatePlayerInput): Promise<Player> {
  try {
    const { data } = await api.post("/players", input);
    return data.data;
  } catch (error) {
    handleError(error);
  }
}

export async function updatePlayer(id: string, input: UpdatePlayerInput): Promise<Player> {
  try {
    const { data } = await api.patch(`/players/${id}`, input);
    return data.data;
  } catch (error) {
    handleError(error);
  }
}

export async function deletePlayer(id: string): Promise<void> {
  try {
    await api.delete(`/players/${id}`);
  } catch (error) {
    handleError(error);
  }
}

export async function uploadPhotoPlayer(id: string, photo: File) {
  try {
    const formData = new FormData();
    formData.append("photo", photo, photo.name); // "photo" debe coincidir con uploadPlayerPhoto.single("photo")
    const { data } = await api.post(`/players/${id}/photo`, formData);
    return data;
  } catch (error) {
    handleError(error);
  }
}
