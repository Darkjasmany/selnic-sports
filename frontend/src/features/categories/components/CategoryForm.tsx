import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres").max(50, "Máximo 50 caracteres").trim(),
  disciplineId: z.string().min(1, "Selecciona una disciplina"),
});

type CategoryFormValue = z.infer<typeof categorySchema>;

type Discipline = { id: string; name: string };

type Props = {
  onSubmit: (data: CategoryFormValue) => void;
  isPending: boolean;
  disciplines: Discipline[];
  defaultValues?: { name?: string; disciplineId?: string };
};

const CategoryForm = ({ isPending, onSubmit, disciplines, defaultValues }: Props) => {
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryFormValue>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: defaultValues?.name ?? "", disciplineId: defaultValues?.disciplineId ?? "" },
  });

  const handleInternalSubmit = (data: CategoryFormValue) => {
    onSubmit(data);
    if (!defaultValues) reset();
  };

  const label = "block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5";
  const inputBase =
    "h-10 w-full bg-slate-800/50 border rounded-xl px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500/40 transition-all placeholder:text-slate-600";
  const inputNormal = "border-slate-700/50 hover:border-slate-600";
  const inputError = "border-red-500/50 bg-red-500/5";

  const getFieldClass = (hasError: boolean) =>
    `${inputBase} ${hasError ? inputError : inputNormal}`;

  return (
    <form onSubmit={handleSubmit(handleInternalSubmit)} className="flex flex-col gap-4 sm:flex-row sm:items-end">
      <div className="flex-1">
        <label className={label}>Disciplina *</label>
        <select
          className={getFieldClass(!!errors.disciplineId)}
          {...register("disciplineId")}
        >
          <option value="">Selecciona disciplina...</option>
          {disciplines.map(d => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
        {errors.disciplineId && (
          <span className="text-red-400 text-xs mt-1">{errors.disciplineId.message}</span>
        )}
      </div>
      <div className="flex-1">
        <label className={label}>Nombre *</label>
        <input
          {...register("name")}
          type="text"
          placeholder="Ej: Sub12, Sub15, Mayores..."
          className={getFieldClass(!!errors.name)}
        />
        {errors.name && (
          <span className="text-red-400 text-xs mt-1">{errors.name.message}</span>
        )}
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="h-10 px-6 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition shrink-0"
      >
        {isPending ? "Agregando..." : "Agregar"}
      </button>
    </form>
  );
};

export default CategoryForm;
