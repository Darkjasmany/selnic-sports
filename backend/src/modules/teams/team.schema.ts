import { z } from "zod";

export const createTeamSchema = z.object({
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
  location: z.string().max(100, "Máximo 100 caracteres").trim().optional(),
  managerPhone: z.string().max(20, "Máximo 20 caracteres").trim().optional(),
  coachName: z.string().max(100, "Máximo 100 caracteres").trim().optional(),
});

export const updateTeamSchema = createTeamSchema.partial();

export type CreateTeamInput = z.infer<typeof createTeamSchema>;
export type UpdateTeamInput = z.infer<typeof updateTeamSchema>;
