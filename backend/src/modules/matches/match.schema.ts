import { z } from "zod";

export const createMatchSchema = z
  .object({
    homeTeamId: z.string({ required_error: "El equipo local es requerido" }).cuid("ID inválido"),
    awayTeamId: z
      .string({ required_error: "El equipo visitante es requerido" })
      .cuid("ID inválido"),
    categoryId: z.string({ required_error: "La categoría es requerida" }).cuid("ID inválido"),
    scheduledAt: z
      .string({ required_error: "La fecha es requerida" })
      .datetime({ message: "Fecha inválida" }),
    notes: z.string().optional(),
  })
  .refine(data => data.homeTeamId !== data.awayTeamId, {
    message: "El equipo local y visitante no pueden ser el mismo",
    path: ["awayTeamId"],
  });

export const validatePlayerSchema = z.object({
  playerId: z.string().cuid("ID inválido"),
  teamSide: z.enum(["HOME", "AWAY"]),
  biometricDescriptor: z.array(z.number()),
});

export const saveIncidentsSchema = z.object({
  homeScore: z.number().int().min(0),
  awayScore: z.number().int().min(0),
  notes: z.string().optional(),
  incidents: z.array(
    z.object({
      playerId: z.string().cuid().optional(),
      teamSide: z.enum(["HOME", "AWAY"]).optional(),
      type: z.enum(["GOAL", "YELLOW_CARD", "RED_CARD", "CORNER", "FOUL", "SUBSTITUTION", "NOTE"]),
      minute: z.number().int().min(1).max(120).optional(),
      quantity: z.number().int().min(1).optional(),
      notes: z.string().optional(),
    })
  ),
});

export type CreateMatchInput = z.infer<typeof createMatchSchema>;
export type ValidatePlayerInput = z.infer<typeof validatePlayerSchema>;
export type SaveIncidentsInput = z.infer<typeof saveIncidentsSchema>;
