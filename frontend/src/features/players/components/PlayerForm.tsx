import api from "@/api/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const playerSchema = z.object({
  firstName: z.string().min(2, "Mínimo 2 caracteres").trim(),
  lastName: z.string().min(2, "Mínimo 2 caracteres").trim(),
  documentId: z.string().min(8, "Mínimo 8 caracteres").trim(),
  birthDate: z.string().min(1, "La fecha es requerida"),
  teamId: z.string().min(1, "Selecciona un equipo"),
  phone: z.string().trim().optional().or(z.literal("")),
  address: z.string().trim().optional(),
  bloodType: z.string().optional(),
  nationality: z.string().min(1).default("Ecuatoriana"),
  guardianName: z.string().trim().optional(),
  guardianPhone: z.string().trim().optional(),
  guardianEmail: z.string().email("Email inválido").optional().or(z.literal("")),
  guardianRelation: z.enum(["PADRE", "MADRE", "OTRO"]).optional(),
});

export type PlayerFormValues = z.infer<typeof playerSchema>;

type Props = {
  defaultValues?: Partial<PlayerFormValues>;
  onSubmit: (data: PlayerFormValues) => void;
  isPending: boolean;
  onCancel: () => void;
};

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const PlayerForm = ({ defaultValues, onSubmit, isPending, onCancel }: Props) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PlayerFormValues>({
    resolver: zodResolver(playerSchema) as any,
    defaultValues: {
      nationality: "Ecuatoriana",
      ...defaultValues,
    },
  });

  useEffect(() => {
    reset({ nationality: "Ecuatoriana", ...defaultValues });
  }, [defaultValues, reset]);

  const { data: teams = [] } = useQuery({
    queryKey: ["team-select"],
    queryFn: async () => {
      const { data } = await api.get("/teams");
      return data.data as { id: string; name: string; category: { name: string } }[];
    },
  });

  const handleInternalSubmit = (data: PlayerFormValues) => {
    onSubmit(data);
  };

  // Estilos de Tailwind extraídos para limpieza
  const label = "block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5";
  const inputBase =
    "w-full bg-slate-800/50 border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500/40 transition-all placeholder:text-slate-600";
  const inputError = "border-red-500/50 bg-red-500/5";
  const inputNormal = "border-slate-700/50 hover:border-slate-600";

  const getFieldClass = (hasError: boolean) =>
    `${inputBase} ${hasError ? inputError : inputNormal}`;

  return (
    <form
      onSubmit={handleSubmit(handleInternalSubmit)}
      className="flex flex-col max-h-[80vh] overflow-y-auto pr-4 custom-scrollbar"
    >
      <div className="space-y-10 pb-8">
        {/* --- SECCIÓN 1: DATOS PERSONALES --- */}
        <section>
          <header className="sticky top-0 bg-slate-900 py-3 z-10 mb-6 border-b border-slate-800">
            <p className="text-xs font-bold text-sky-400 uppercase tracking-widest">
              Información Personal
            </p>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={label}>Apellidos *</label>
              <input
                placeholder="Ej. Franco Peralta"
                className={getFieldClass(!!errors.lastName)}
                {...register("lastName")}
              />
            </div>
            <div>
              <label className={label}>Nombres *</label>
              <input
                placeholder="Ej. Vicente Jasmany"
                className={getFieldClass(!!errors.firstName)}
                {...register("firstName")}
              />
            </div>
            <div>
              <label className={label}>Cédula / DNI *</label>
              <input
                placeholder="1234567890"
                className={getFieldClass(!!errors.documentId)}
                {...register("documentId")}
              />
            </div>
            <div>
              <label className={label}>Fecha de Nacimiento *</label>
              <input
                type="date"
                className={getFieldClass(!!errors.birthDate)}
                {...register("birthDate")}
              />
            </div>
            <div>
              <label className={label}>Teléfono</label>
              <input
                placeholder="0991234567"
                className={getFieldClass(false)}
                {...register("phone")}
              />
            </div>
            <div>
              <label className={label}>Tipo de Sangre</label>
              <select className={getFieldClass(false)} {...register("bloodType")}>
                <option value="">Seleccionar...</option>
                {BLOOD_TYPES.map(bt => (
                  <option key={bt} value={bt}>
                    {bt}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className={label}>Dirección de Domicilio</label>
              <input
                placeholder="Barrio, calle principal y secundaria"
                className={getFieldClass(false)}
                {...register("address")}
              />
            </div>
          </div>
        </section>

        {/* --- SECCIÓN 2: DATOS DEPORTIVOS --- */}
        <section>
          <header className="sticky top-0 bg-slate-900 py-3 z-10 mb-6 border-b border-slate-800">
            <p className="text-xs font-bold text-sky-400 uppercase tracking-widest">
              Filiación Deportiva
            </p>
          </header>
          <div className="grid grid-cols-1 gap-5">
            <div>
              <label className={label}>Equipo y Categoría *</label>
              <select className={getFieldClass(!!errors.teamId)} {...register("teamId")}>
                <option value="">Selecciona el equipo actual...</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>
                    {team.name} — {team.category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* --- SECCIÓN 3: REPRESENTANTE LEGAL --- */}
        <section>
          <header className="sticky top-0 bg-slate-900 py-3 z-10 mb-6 border-b border-slate-800">
            <p className="text-xs font-bold text-sky-400 uppercase tracking-widest">
              Contacto de Emergencia / Representante
            </p>
          </header>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className={label}>Nombres y Apellidos del Representante</label>
              <input
                placeholder="Ej. María Auxiliadora..."
                className={getFieldClass(false)}
                {...register("guardianName")}
              />
            </div>
            <div>
              <label className={label}>Parentesco / Relación</label>
              <select className={getFieldClass(false)} {...register("guardianRelation")}>
                <option value="">Seleccionar...</option>
                <option value="PADRE">Padre</option>
                <option value="MADRE">Madre</option>
                <option value="OTRO">Otro</option>
              </select>
            </div>
            <div>
              <label className={label}>Teléfono del Representante</label>
              <input
                placeholder="0987654321"
                className={getFieldClass(false)}
                {...register("guardianPhone")}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={label}>Correo Electrónico</label>
              <input
                type="email"
                placeholder="correo@ejemplo.com"
                className={getFieldClass(!!errors.guardianEmail)}
                {...register("guardianEmail")}
              />
            </div>
          </div>
        </section>
      </div>

      {/* --- BOTONES ACCIÓN (SIEMPRE VISIBLES AL FINAL) --- */}
      <footer className="flex gap-4 pt-6 mt-2 border-t border-slate-800 bg-slate-900 sticky bottom-0 z-20">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 h-12 rounded-xl border border-slate-700 text-slate-400 hover:bg-slate-800 transition-all font-medium"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 h-12 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold transition-all shadow-lg shadow-sky-900/20"
        >
          {isPending ? "Guardando..." : "Guardar jugador"}
        </button>
      </footer>
    </form>
  );
};

export default PlayerForm;
