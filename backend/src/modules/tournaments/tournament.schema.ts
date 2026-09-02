import { z } from "zod";

export const createTournamentSchema = z.object({
  name: z
    .string({ error: "El nombre es requerido" })
    .min(2, "Mínimo 2 caracteres")
    .max(100, "Máximo 100 caracteres")
    .trim(),
  disciplineId: z
    .string({ error: "La disciplina es requerida" })
    .cuid("ID de disciplina inválido"),
  categoryId: z
    .string({ error: "La categoría es requerida" })
    .cuid("ID de categoría inválido"),
  formatType: z.enum([
    "GROUPS_AND_KNOCKOUT",
    "KNOCKOUT_ONLY",
    "ROUND_ROBIN",
  ]),
  generationMode: z.enum(["AUTOMATIC", "SEMI_AUTOMATIC", "MANUAL"]),
  qualifiedPerGroup: z.number().int().min(1).max(8).default(2),
  maxGroups: z.number().int().min(1).default(4),
  startDate: z
    .string()
    .refine(date => (date ? !isNaN(Date.parse(date)) : true), {
      message: "Fecha inválida",
    })
    .optional()
    .nullable(),
  endDate: z
    .string()
    .refine(date => (date ? !isNaN(Date.parse(date)) : true), {
      message: "Fecha inválida",
    })
    .optional()
    .nullable(),
  // Equipos a asignar a los grupos (solo para GENERACION AUTOMATICA)
  teamIds: z.array(z.string().cuid()).optional(),
});

export const updateTournamentSchema = createTournamentSchema
  .omit({ teamIds: true })
  .partial();

export type CreateTournamentInput = z.infer<typeof createTournamentSchema>;
export type UpdateTournamentInput = z.infer<typeof updateTournamentSchema>;
