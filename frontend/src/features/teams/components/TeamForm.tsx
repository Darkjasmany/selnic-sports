import api from "@/api/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const teamSchema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres").trim(),
  disciplineId: z.string().min(1, "Selecciona una disciplina"),
  categoryId: z.string().min(1, "Selecciona una categoría"),
  location: z.string().trim().optional(),
  managerPhone: z.string().trim().optional(),
  coachName: z.string().trim().optional(),
});

export type TeamFormValues = z.infer<typeof teamSchema>;

type Props = {
  defaultValues?: Partial<TeamFormValues>;
  onSubmit: (data: TeamFormValues) => void;
  isPending: boolean;
  onCancel: () => void;
};

const TeamForm = ({ defaultValues, isPending, onCancel, onSubmit }: Props) => {
  const [disciplineId, setDisciplineId] = useState(defaultValues?.disciplineId ?? "");

  const { data: disciplines } = useQuery({
    queryKey: ["disciplines"],
    queryFn: async () => {
      const { data } = await api.get("/disciplines");
      return data.data as { id: string; name: string }[];
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["categories", disciplineId],
    queryFn: async () => {
      const { data } = await api.get("/categories", {
        params: disciplineId ? { disciplineId } : undefined,
      });
      return data.data as { id: string; name: string }[];
    },
    enabled: !!disciplineId,
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TeamFormValues>({
    resolver: zodResolver(teamSchema),
    defaultValues,
  });

  const watchedDiscipline = watch("disciplineId");

  useEffect(() => {
    setDisciplineId(watchedDiscipline);
    if (disciplineId && watchedDiscipline !== disciplineId) {
      setValue("categoryId", "");
    }
  }, [watchedDiscipline, disciplineId, setValue]);

  const inputClass = (hasError: boolean) =>
    `w-full h-10 px-3 rounded-lg bg-slate-800 border text-white text-sm
     placeholder:text-slate-500 focus:outline-none focus:ring-2 transition
     ${hasError ? "border-red-500 focus:ring-red-500" : "border-slate-700 focus:ring-sky-500"}`;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div>
        <label className="text-sm text-slate-400 mb-1 block">Nombre del equipo</label>
        <input
          type="text"
          placeholder="Ej: Barcelona SC"
          className={inputClass(!!errors.name)}
          {...register("name")}
        />
        {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <label className="text-sm text-slate-400 mb-1 block">Disciplina</label>
        <select
          className={inputClass(!!errors.disciplineId)}
          {...register("disciplineId")}
        >
          <option value="">Selecciona una disciplina</option>
          {disciplines?.map(d => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
        {errors.disciplineId && (
          <p className="text-red-400 text-xs mt-1">{errors.disciplineId.message}</p>
        )}
      </div>

      <div>
        <label className="text-sm text-slate-400 mb-1 block">Categoría</label>
        <select
          className={inputClass(!!errors.categoryId)}
          {...register("categoryId")}
          disabled={!disciplineId}
        >
          <option value="">
            {disciplineId ? "Selecciona una categoría" : "Primero selecciona disciplina"}
          </option>
          {categories?.map(categorie => (
            <option key={categorie.id} value={categorie.id}>
              {categorie.name}
            </option>
          ))}
        </select>
        {errors.categoryId && (
          <p className="text-red-400 text-xs mt-1">{errors.categoryId.message}</p>
        )}
      </div>

      <div>
        <label className="text-sm text-slate-400 mb-1 block">Lugar</label>
        <input placeholder="Ej: Guayaquil" className={inputClass(false)} {...register("location")} />
      </div>

      <div>
        <label className="text-sm text-slate-400 mb-1 block">Teléfono representante</label>
        <input placeholder="Ej: 0991234567" className={inputClass(false)} {...register("managerPhone")} />
      </div>

      <div>
        <label className="text-sm text-slate-400 mb-1 block">DT (Director Técnico)</label>
        <input placeholder="Ej: Juan Pérez" className={inputClass(false)} {...register("coachName")} />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 h-10 rounded-lg border border-slate-700 text-slate-400 hover:bg-slate-800 transition text-sm"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 h-10 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-medium transition text-sm"
        >
          {isPending ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </form>
  );
};

export default TeamForm;
