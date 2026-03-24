import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres").max(50, "Máximo 50 caracteres").trim(),
});

type CategoryFormValue = z.infer<typeof categorySchema>;

type Props = {
  onSubmit: (data: CategoryFormValue) => void;
  isPending: boolean; // Corregido el typo de "isPendig"
  initialName?: string;
};

const CategoryForm = ({ onSubmit, isPending, initialName = "" }: Props) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormValue>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: initialName },
  });

  const handleInternalSubmit = (data: CategoryFormValue) => {
    onSubmit(data);
    reset(); // Limpia el form tras enviar
  };

  return (
    <form onSubmit={handleSubmit(handleInternalSubmit)} className="flex flex-col gap-1">
      <div className="flex gap-3">
        <input
          {...register("name")}
          type="text"
          placeholder="Ej: Sub12, Sub15, Mayores..."
          className="h-10 px-3 rounded-lg bg-slate-800 border border-slate-700 text-white flex-1"
        />
        <button
          type="submit"
          disabled={isPending}
          className="px-4 bg-sky-600 rounded-lg text-white disabled:opacity-50"
        >
          {isPending ? "Agregando..." : "Agregar"}
        </button>
      </div>
      {errors.name && <span className="text-red-400 text-xs">{errors.name.message}</span>}
    </form>
  );
};

export default CategoryForm;
