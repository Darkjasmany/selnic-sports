import { z } from "zod";

// Validación
const nameValidation = z
  .string({ required_error: "El nombre es requerido" })
  .min(2, "Mínimo 2 caracteres")
  .max(50, "Máximo 50 caracteres")
  .trim();

// Schema para crear o actualizar categoría
export const createCategorySchema = z.object({
  name: nameValidation,
});
export const updateCategorySchema = createCategorySchema.partial();

// Types inferidos
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
