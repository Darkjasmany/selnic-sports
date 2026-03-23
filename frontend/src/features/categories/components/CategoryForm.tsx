import { z } from "zod";

const categorySchema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres").trim(),
});

const CategoryForm = () => {
  return <div>CategoryForm</div>;
};

export default CategoryForm;
