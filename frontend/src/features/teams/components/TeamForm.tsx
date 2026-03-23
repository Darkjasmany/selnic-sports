import api from "@/api/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const teamSchema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres").trim(),
  categoryId: z.string().min(1, "Selecciona una categoría"),
  location: z.string().trim().optional(),
  managerPhone: z.string().trim().optional(),
  coachName: z.string().trim().optional(),
});

type TeamFormValues = z.infer<typeof teamSchema>;

type Props = {
  defaultValues?: Partial<TeamFormValues>;
  onSubmit: (data: TeamFormValues) => void;
  isPending: boolean;
  onCancel: () => void;
};

const TeamForm = ({ defaultValues, isPending, onCancel, onSubmit }: Props) => {
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await api.get("/categories");
      return data.data as { id: string; name: string }[]; // En TypeScript, poner [] al final de un tipo significa que no estás recibiendo un solo objeto, sino una Lista (un Array) de esos objetos.

      //   { id: string; name: string } Un solo objeto (como un POJO en Java).{ id: string; name: string }[]  Un Array que contiene muchos de esos objetos.
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TeamFormValues>({
    resolver: zodResolver(teamSchema),
    defaultValues,
  });

  //Es un "Efecto Secundario". En React, los componentes se dibujan muchas veces. El useEffect le dice a React: "No ejecutes esto siempre; solo ejecútalo cuando las cosas que están en los corchetes [] (las dependencias) cambien"
  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const inputClass = (hasError: boolean) =>
    `w-full h-10 px-3 rounded-lg bg-slate-800 border text-white text-sm
     placeholder:text-slate-500 focus:outline-none focus:ring-2 transition
     ${hasError ? "border-red-500 focus:ring-red-500" : "border-slate-700 focus:ring-sky-500"}`;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div>
        <label htmlFor="" className="text-sm text-slate-400 mb-1 block">
          Nombre del equipo
        </label>
        <input
          type="text"
          placeholder="Ej: Barcelona SC"
          className={inputClass(!!errors.name)}
          {...register("name")}
        />
        {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <label className="text-sm text-slate-400 mb-1 block">Categoría</label>
        <select className={inputClass(!!errors.categoryId)} {...register("categoryId")}>
          <option value="">Selecciona una categoría</option>
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
        <input
          placeholder="Ej: Guayaquil"
          className={inputClass(false)}
          {...register("location")}
        />
      </div>

      <div>
        <label className="text-sm text-slate-400 mb-1 block">Teléfono representante</label>
        <input
          placeholder="Ej: 0991234567"
          className={inputClass(false)}
          {...register("managerPhone")}
        />
      </div>

      <div>
        <label className="text-sm text-slate-400 mb-1 block">DT (Director Técnico)</label>
        <input
          placeholder="Ej: Juan Pérez"
          className={inputClass(false)}
          {...register("coachName")}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 h-10 rounded-lg border border-slate-700 text-slate-400
                     hover:bg-slate-800 transition text-sm"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 h-10 rounded-lg bg-sky-600 hover:bg-sky-500
                     disabled:opacity-50 text-white font-medium transition text-sm"
        >
          {isPending ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </form>
  );
};

export default TeamForm;
