import { z } from "zod";

export const createMatchSchema = z
  .object({
    homeTeamId: z
      .string({ required_error: "El equipo local es requerido" })
      .cuid("ID inválido"),
    awayTeamId: z
      .string({ required_error: "El equipo visitante es requerido" })
      .cuid("ID inválido"),
    categoryId: z
      .string({ required_error: "La categoría es requerida" })
      .cuid("ID inválido"),
    scheduledAt: z
      .string({ required_error: "La fecha es requerida" })
      .refine(date => !isNaN(Date.parse(date)), { message: "Fecha inválida" }),
    notes: z.string().optional(),
    // Nuevos campos para torneos
    tournamentId: z.string().cuid().optional(),
    groupId: z.string().cuid().optional(),
    phase: z
      .enum([
        "GROUPS",
        "ROUND_OF_16",
        "QUARTER_FINAL",
        "SEMI_FINAL",
        "THIRD_PLACE",
        "FINAL",
      ])
      .optional(),
    matchDay: z.number().int().min(1).optional(),
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
      teamId: z.string().cuid().optional(),
      assistPlayerId: z.string().cuid().optional(),
      teamSide: z.enum(["HOME", "AWAY"]).optional(),
      type: z.enum([
        "GOAL",
        "YELLOW_CARD",
        "RED_CARD",
        "CORNER",
        "FOUL",
        "SUBSTITUTION",
        "BASKET_2",
        "BASKET_3",
        "FREE_THROW",
        "FOUL_BASKET",
        "BLOCK",
        "TURNOVER",
        "TIMEOUT",
        "REBOUND",
        "ASSIST",
        "STEAL",
        "CHECK",
        "CHECKMATE",
        "RESIGNATION",
        "DRAW_CHESS",
        "CAPTURED_PIECE",
        "NOTE",
      ]),
      minute: z.number().int().min(1).max(120).optional(),
      period: z.number().int().min(1).max(10).optional(),
      quantity: z.number().int().min(1).optional(),
      points: z.number().int().min(1).optional(),
      notes: z.string().optional(),
    })
  ),
});

export type CreateMatchInput = z.infer<typeof createMatchSchema>;
export type ValidatePlayerInput = z.infer<typeof validatePlayerSchema>;
export type SaveIncidentsInput = z.infer<typeof saveIncidentsSchema>;
