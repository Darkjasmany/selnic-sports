import api from "@/api/client";
import { TEAMS_KEY } from "@/features/teams/hooks/useTeams";
import { getPhotoUrl } from "@/utils/url";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { string, z } from "zod";

const playerSchema = z.object({
  id: string().optional(),
  firstName: z.string().min(2, "Mínimo 2 caracteres").trim(),
  lastName: z.string().min(2, "Mínimo 2 caracteres").trim(),
  documentId: z.string().min(8, "Mínimo 8 caracteres").trim(),
  birthDate: z.string().min(1, "La fecha es requerida"),
  disciplineId: z.string().optional(),
  teamId: z.string().min(1, "Selecciona un equipo"),
  phone: z.string().trim().optional().or(z.literal("")),
  address: z.string().trim().optional(),
  bloodType: z.string().optional(),
  nationality: z.string().min(1).default("Ecuatoriana"),
  isActive: z.boolean().default(true),
  guardianName: z.string().trim().optional(),
  guardianPhone: z.string().trim().optional(),
  guardianEmail: z.string().email("Email inválido").optional().or(z.literal("")),
  guardianRelation: z.enum(["PADRE", "MADRE", "OTRO"]).optional(),
  educationalUnit: z.string().trim().optional(),
  educationalLevel: z.string().trim().optional(),
  educationalAddress: z.string().trim().optional(),
});

export type PlayerFormValues = z.infer<typeof playerSchema>;

type Props = {
  defaultValues?: Partial<PlayerFormValues> & {
    photoUrl?: string;
    isActive?: boolean;
  };
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
      isActive: true,
      ...defaultValues,
    },
  });

  useEffect(() => {
    reset({ nationality: "Ecuatoriana", isActive: true, ...defaultValues });
    setPhotoPreview(defaultValues?.photoUrl ? (getPhotoUrl(defaultValues.photoUrl) ?? null) : null);
  }, [defaultValues, reset]);

  const [disciplineId, setDisciplineId] = useState<string>(defaultValues?.disciplineId ?? "");

  const { data: disciplines } = useQuery({
    queryKey: ["disciplines"],
    queryFn: async () => {
      const { data } = await api.get("/disciplines");
      return data.data as { id: string; name: string }[];
    },
  });

  const { data: teams = [] } = useQuery({
    queryKey: [TEAMS_KEY, disciplineId],
    queryFn: async () => {
      const { data } = await api.get("/teams", {
        params: disciplineId ? { disciplineId } : undefined,
      });
      return data.data as {
        id: string;
        name: string;
        disciplineId: string;
        category: { name: string };
      }[];
    },
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    defaultValues?.photoUrl ? (getPhotoUrl(defaultValues.photoUrl) ?? null) : null
  );
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
    onSubmit(
      { ...data, disciplineId: data.disciplineId || disciplineId || undefined },
      photoFile ?? undefined
    );
  };

  const label = "block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5";
  const inputBase =
    "w-full bg-slate-800/50 border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500/40 transition-all placeholder:text-slate-600";
  const inputError = "border-red-500/50 bg-red-500/5";
  const inputNormal = "border-slate-700/50 hover:border-slate-600";
  const sectionBox = "bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5";
  const sectionTitle = "text-xs font-bold text-sky-400 uppercase tracking-widest mb-4";

  const getFieldClass = (hasError: boolean) =>
    `${inputBase} ${hasError ? inputError : inputNormal}`;

  return (
    <form onSubmit={handleSubmit(handleInternalSubmit)} className="flex flex-col gap-5">
      {/* --- 1. INFORMACIÓN PERSONAL --- */}
      <div className={sectionBox}>
        <p className={sectionTitle}>Información Personal</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <label className={label}>Apellidos *</label>
            <input
              placeholder="Ej. Franco Peralta"
              className={getFieldClass(!!errors.lastName)}
              {...register("lastName")}
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-1">
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
          <div>
            <label className={label}>Nacionalidad</label>
            <input
              placeholder="Ecuatoriana"
              className={getFieldClass(false)}
              {...register("nationality")}
            />
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
        {defaultValues?.id && (
          <div className="flex items-center gap-3 p-3 mt-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <div className="relative inline-flex h-6 w-11 items-center">
              <input
                type="checkbox"
                id="isActive"
                className="peer appearance-none w-11 h-6 rounded-full bg-slate-700 checked:bg-sky-600 transition-colors cursor-pointer"
                {...register("isActive")}
              />
              <span className="absolute left-1 h-4 w-4 rounded-full bg-white transition-all peer-checked:left-6 cursor-pointer" />
            </div>
            <label htmlFor="isActive" className="cursor-pointer">
              <span className="block text-sm font-semibold text-white">Jugador Activo</span>
              <span className="block text-[11px] text-slate-500">
                Si se desactiva, el jugador no aparecerá en las listas de partidos ni reportes.
              </span>
            </label>
          </div>
        )}
      </div>

      {/* --- 3. FILIACIÓN DEPORTIVA --- */}
      <div className={sectionBox}>
        <p className={sectionTitle}>Filiación Deportiva</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={label}>Disciplina *</label>
            <select
              className={getFieldClass(false)}
              value={disciplineId}
              onChange={e => setDisciplineId(e.target.value)}
            >
              <option value="">Selecciona la disciplina...</option>
              {disciplines?.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={label}>Equipo y Categoría *</label>
            <select className={getFieldClass(!!errors.teamId)} {...register("teamId")}>
              <option value="">
                {disciplineId ? "Selecciona el equipo actual..." : "Primero selecciona disciplina"}
              </option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>
                  {team.name} — {team.category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* --- 4. REPRESENTANTE / EMERGENCIA --- */}
      <div className={sectionBox}>
        <p className={sectionTitle}>Contacto de Emergencia / Representante</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
      </div>

      {/* --- 5. INFORMACIÓN ACADÉMICA --- */}
      <div className={sectionBox}>
        <p className={sectionTitle}>Información Académica</p>
        <p className="text-[11px] text-slate-500 mb-4">
          Opcional — Completa si el jugador es estudiante
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={label}>Unidad Educativa</label>
            <input
              placeholder="Ej: Colegio San José, UCE..."
              className={getFieldClass(false)}
              {...register("educationalUnit")}
            />
          </div>
          <div>
            <label className={label}>Nivel</label>
            <input
              placeholder="Ej: Primero de Séptimo, Tercero de Bachillerato..."
              className={getFieldClass(false)}
              {...register("educationalLevel")}
            />
          </div>
          <div>
            <label className={label}>Dirección de la Unidad Educativa</label>
            <input
              placeholder="Dirección de la unidad educativa"
              className={getFieldClass(false)}
              {...register("educationalAddress")}
            />
          </div>
        </div>
      </div>

      {/* --- 2. FOTO DEL JUGADOR --- */}

      <div className="grid grid-cols-2 gap-3">
        <div className={sectionBox}>
          <p className={sectionTitle}>Foto del Jugador</p>
          <div className="flex items-center gap-6">
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
                  <p className="text-3xl mb-1">📷</p>
                  <p className="text-xs text-slate-500 group-hover:text-sky-400 transition">
                    Clic para subir
                  </p>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-sm text-slate-300">Foto de identificación del jugador</p>
              <p className="text-xs text-slate-500">JPG, PNG o WebP - máximo 5MB</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 transition"
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
                    className="text-xs px-3 py-1.5 rounded-lg bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-900/50 transition"
                  >
                    Eliminar Foto
                  </button>
                )}
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </div>
        </div>

        {/* --- 6. BOTONES --- */}
        <div className="pt-12">
          <div className="grid grid-cols-1 gap-3 items-center">
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 h-12 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold transition-all shadow-lg shadow-sky-900/20"
            >
              {isPending ? "Guardando..." : "Guardar jugador"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 h-12 rounded-xl border border-slate-700 text-slate-400 hover:bg-slate-800 transition-all font-medium"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default PlayerForm;
