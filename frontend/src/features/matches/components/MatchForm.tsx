import api from "@/api/client";
import { CATEGORIES_KEY } from "@/features/categories/hooks/useCategories";
import { TEAMS_KEY } from "@/features/teams/hooks/useTeams";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
const matchSchema = z.object({
  categoryId: z.string().min(1, "Selecciona una categoría"),
  homeTeamId: z.string().min(1, "Selecciona el equipo local"),
  awayTeamId: z.string().min(1, "Selecciona el equipo visitante"),
  scheduledAt: z.string().min(1, "La fecha es requerida"),
  notes: z.string().optional(),
});

export type MatchFormValues = z.infer<typeof matchSchema>;

type Props = {
  onSubmit: (data: MatchFormValues) => void;
  isPending: boolean;
  onCancel: () => void;
};
const MatchForm = ({ onSubmit, isPending, onCancel }: Props) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<MatchFormValues>({
    resolver: zodResolver(matchSchema),
  });

  const selectedCategory = watch("categoryId");

  // Traer equipos cuando se seleccione una categoría
  const { data: categories = [] } = useQuery({
    queryKey: [CATEGORIES_KEY],
    queryFn: async () => {
      const { data } = await api.get("/categories");
      return data.data as { id: string; name: string }[];
    },
  });

  const { data: teams = [] } = useQuery({
    queryKey: [TEAMS_KEY, selectedCategory],
    // queryKey: ["team-select", selectedCategory],
    queryFn: async () => {
      const { data } = await api.get("/teams", {
        params: selectedCategory ? { categoryId: selectedCategory } : {},
      });
      return data.data as { id: string; name: string }[];
    },
    enabled: !!selectedCategory, // Solo ejecuta esta consulta si ya se seleccionó una categoría
  });

  const handleInternalSubmit = (data: MatchFormValues) => {
    onSubmit(data);
  };

  const input = (hasError: boolean) =>
    `w-full h-10 px-3 rounded-lg bg-slate-800 border text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 transition ${hasError ? "border-red-500 focus:ring-red-500" : "border-slate-700 focus:ring-sky-500"}`;

  return (
    <form action="" onSubmit={handleSubmit(handleInternalSubmit)} className="flex flex-col gap-4">
      <div>
        <label className="text-xs text-slate-400 mb-1 block">Categoría *</label>
        <select className={input(!!errors.categoryId)} {...register("categoryId")}>
          <option value="">Seleccione una categoría</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {errors.categoryId && (
          <p className="text-red-400 text-xs mt-1">{errors.categoryId.message}</p>
        )}
      </div>

      <div>
        <label className="text-xs text-slate-400 mb-1 block">Equipo local *</label>
        <select
          className={input(!!errors.homeTeamId)}
          disabled={!selectedCategory}
          {...register("homeTeamId")}
        >
          <option value="">Selecciona el equipo local</option>
          {teams.map(t => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        {errors.homeTeamId && (
          <p className="text-red-400 text-xs mt-1">{errors.homeTeamId.message}</p>
        )}
      </div>

      <div>
        <label className="text-xs text-slate-400 mb-1 block">Equipo visitante *</label>
        <select
          className={input(!!errors.awayTeamId)}
          disabled={!selectedCategory}
          {...register("awayTeamId")}
        >
          <option value="">Selecciona el equipo visitante</option>
          {teams.map(t => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        {errors.awayTeamId && (
          <p className="text-red-400 text-xs mt-1">{errors.awayTeamId.message}</p>
        )}
      </div>

      <div>
        <label className="text-xs text-slate-400 mb-1 block">Fecha y hora *</label>
        <input
          type="datetime-local"
          className={input(!!errors.scheduledAt)}
          {...register("scheduledAt")}
        />
        {errors.scheduledAt && (
          <p className="text-red-400 text-xs mt-1">{errors.scheduledAt.message}</p>
        )}
      </div>

      <div>
        <label className="text-xs text-slate-400 mb-1 block">Observaciones</label>
        <textarea
          placeholder="Notas del partido..."
          rows={2}
          className={`${input(false)} h-auto py-2 resize-none`}
          {...register("notes")}
        />
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
          {isPending ? "Creando..." : "Crear partido"}
        </button>
      </div>
    </form>
  );
};

export default MatchForm;
