import api from "@/api/client";
import { handleError } from "@/api/utils";

export type SaveBiometricInput = {
  biometricData: number[];
  biometricType: "FACIAL" | "FINGERPRINT";
};

export async function saveBiometric(playerId: string, input: SaveBiometricInput): Promise<void> {
  try {
    await api.post(`/players/${playerId}/biometric`, input);
  } catch (error) {
    handleError(error);
  }
}
