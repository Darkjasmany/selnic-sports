import { z } from "zod";

const nameValidation = z
  .string({ required_error: "El nombre es requerido" })
  .min(2, "Mínimo 2 caracteres")
  .max(50, "Máximo 50 caracteres")
  .trim();

const disciplineIdValidation = z
  .string({ required_error: "La disciplina es requerida" })
  .min(1, "La disciplina es requerida");

export const createCategorySchema = z.object({
  name: nameValidation,
  disciplineId: disciplineIdValidation,
});

export const updateCategorySchema = createCategorySchema.partial();

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
