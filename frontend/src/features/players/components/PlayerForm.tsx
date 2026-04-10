import api from "@/api/client";
import { TEAMS_KEY } from "@/features/teams/hooks/useTeams";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useRef, useState } from "react";
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
  defaultValues?: Partial<PlayerFormValues> & { photoUrl?: string };
  onSubmit: (data: PlayerFormValues, photo?: File) => void;
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
    // queryKey: ["team-select"],
    queryKey: [TEAMS_KEY],
    queryFn: async () => {
      const { data } = await api.get("/teams");
      return data.data as { id: string; name: string; category: { name: string } }[];
    },
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(defaultValues?.photoUrl ?? null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleInternalSubmit = (data: PlayerFormValues) => {
    onSubmit(data, photoFile ?? undefined);
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
                placeholder="Ej. Selene Elizabeth..."
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
              <label className={label}>Teléfono</label>
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

      {/* --- FOTO DEL JUGADOR --- */}
      <section>
        <header className="sticky top-0 bg-slate-900 py-3 z-10 ">
          <p className="text-xs font-bold text-sky-400 uppercase tracking-widest">
            Foto del Jugador
          </p>
          <div className="flex items-center gap-6">
            {/* Preview */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-28 h-32 rounded-xl border-2 border-dashed border-slate-700 hover:border-sky-500 bg-slate-800/50 flex items-center justify-center cursor-pointer transition-all overflow-hidden shrink-0 group"
            >
              {photoPreview ? (
                <img
                  src={photoPreview!}
                  alt="Foto del jugador"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center px-2">
                  <p className="text-2xl mb-1">📷</p>
                  <p className="text-xs text-slate-500 group-hover:text-sky-400 transition">
                    Clic para subir
                  </p>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-col gap-2">
              <p className="text-sm text-slate-300">Foto de identificación del jugador</p>
              <p className="text-xs text-slate-500">JPG, PNG o WebP - máximo 5MB</p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 transition w-fit"
              >
                {photoPreview ? "Cambiar Foto" : "Seleccionar Foto"}
              </button>
              {photoPreview && (
                <button
                  type="button"
                  onClick={() => {
                    setPhotoPreview(null);
                    setPhotoFile(null);
                  }}
                  className="text-xs text-red-400 hover:text-red-300 transition w-fit"
                >
                  Eliminar Foto
                </button>
              )}
            </div>
            {/* Input oculto */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </div>
        </header>
      </section>

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
