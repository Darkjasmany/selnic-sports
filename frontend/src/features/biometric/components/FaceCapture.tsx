import { useState } from "react";
import { toast } from "react-toastify";
import { saveBiometric } from "../api/biometric.api";
import { useCamera, useFaceApi } from "../hooks/useBiometric";
import FaceGuide from "./FaceGuide";

type Step = "info" | "camera" | "capturing" | "done";

type Props = {
  playerId: string;
  playerName: string;
  hasBiometric: boolean;
  onSaved: () => void;
  onCancel: () => void;
};

export default function FaceCapture({
  playerId,
  playerName,
  hasBiometric,
  onSaved,
  onCancel,
}: Props) {
  const [step, setStep] = useState<Step>("info");
  const [isSaving, setIsSaving] = useState(false);
  const [captureMessage, setCaptureMessage] = useState("");

  const { isReady, error: modelError, capture } = useFaceApi();
  const { videoRef, isActive, error: cameraError, start, stop } = useCamera();

  const handleStartCamera = async () => {
    // 1. Primero cambiamos el estado para que React renderice el tag <video>
    setStep("camera");
    // 2. Usamos un pequeño delay o esperamos al siguiente ciclo del event loop
    // para que videoRef.current ya no sea null
    setTimeout(async () => {
      try {
        await start();
      } catch (error) {
        console.error("Error al iniciar cámara:", error);
      }
    }, 100);
  };

  const handleCapture = async () => {
    if (!videoRef.current || !isReady) return;

    setStep("capturing");
    setCaptureMessage("Detectando rostro...");

    const descriptor = await capture(videoRef.current);

    // Log para verificar — quitar en producción
    console.log("[FaceCapture] Descriptor capturado:", {
      esArray: Array.isArray(descriptor),
      longitud: descriptor?.length,
      primeros3: descriptor?.slice(0, 3),
    });

    if (!descriptor) {
      setCaptureMessage("No se detectó rostro. Centra tu cara y mejora la iluminación.");
      setStep("camera");
      return;
    }

    setIsSaving(true);
    try {
      await saveBiometric(playerId, {
        biometricData: descriptor,
        biometricType: "FACIAL",
      });
      stop();
      setStep("done");
      toast.success("Biométrico registrado correctamente");
      setTimeout(onSaved, 1500);
    } catch (err: any) {
      toast.error(err.message ?? "Error al guardar el biométrico");
      setStep("camera");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    stop();
    onCancel();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium text-white">Registro biométrico</h3>
            <p className="text-slate-400 text-sm">{playerName}</p>
          </div>
          {hasBiometric && (
            <span className="text-xs bg-amber-900/50 text-amber-400 px-2 py-1 rounded-md">
              Actualizando
            </span>
          )}
        </div>

        {/* Error de modelos */}
        {modelError && (
          <div className="bg-red-900/30 border border-red-800 rounded-lg p-3 mb-4">
            <p className="text-red-400 text-sm">{modelError}</p>
          </div>
        )}

        {/* PASO: Info */}
        {step === "info" && (
          <div className="flex flex-col gap-4">
            <div className="bg-slate-800/50 rounded-xl p-4 text-sm space-y-2">
              <p className="text-slate-300 font-medium">Instrucciones:</p>
              <ul className="space-y-1.5 text-slate-400">
                <li className="flex items-center gap-2">
                  <span className="text-sky-400">→</span>
                  Buena iluminación frontal
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-sky-400">→</span>
                  Mira directamente a la cámara
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-sky-400">→</span>
                  Rostro centrado y sin obstrucciones
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-sky-400">→</span>
                  Sin gorras ni lentes oscuros
                </li>
              </ul>
            </div>

            {!isReady ? (
              <div className="text-center py-3">
                <p className="text-slate-400 text-sm mb-2">Cargando modelos de reconocimiento...</p>
                <div className="w-full bg-slate-800 rounded-full h-1.5">
                  <div className="bg-sky-500 h-1.5 rounded-full animate-pulse w-2/3" />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-green-400 text-sm">
                <span>✓</span>
                <span>Modelos listos</span>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 h-11 rounded-xl border border-slate-700
                           text-slate-400 hover:bg-slate-800 transition text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleStartCamera}
                disabled={!isReady}
                className="flex-1 h-11 rounded-xl bg-sky-600 hover:bg-sky-500
                           disabled:opacity-40 text-white font-medium transition text-sm"
              >
                Activar cámara
              </button>
            </div>
          </div>
        )}

        {/* PASO: Cámara activa */}
        {(step === "camera" || step === "capturing") && (
          <div className="flex flex-col gap-4">
            {cameraError && <p className="text-red-400 text-sm text-center">{cameraError}</p>}

            <div className="relative bg-black rounded-xl overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full rounded-xl"
                style={{ transform: "scaleX(-1)" }}
                onCanPlay={e => e.currentTarget.play()} // Agregamos este evento para asegurar la reproducción
              />
              <FaceGuide />

              {captureMessage && step === "camera" && (
                <div
                  className="absolute bottom-3 left-3 right-3 bg-black/70 rounded-lg
                                py-2 px-3 text-sm text-center text-white"
                >
                  {captureMessage}
                </div>
              )}

              {step === "capturing" && (
                <div
                  className="absolute inset-0 bg-black/50 flex items-center
                                justify-center rounded-xl"
                >
                  <div className="text-center">
                    <div
                      className="w-8 h-8 border-2 border-sky-400 border-t-transparent
                                    rounded-full animate-spin mx-auto mb-2"
                    />
                    <p className="text-white text-sm">Procesando...</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 h-11 rounded-xl border border-slate-700
                           text-slate-400 hover:bg-slate-800 transition text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleCapture}
                disabled={isSaving || step === "capturing" || !isActive}
                className="flex-1 h-11 rounded-xl bg-green-600 hover:bg-green-500
                           disabled:opacity-50 text-white font-medium transition text-sm"
              >
                {isSaving ? "Guardando..." : "📸 Capturar rostro"}
              </button>
            </div>
          </div>
        )}

        {/* PASO: Éxito */}
        {step === "done" && (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">✅</div>
            <p className="text-white font-medium text-lg">Biométrico registrado</p>
            <p className="text-slate-400 text-sm mt-2">El jugador puede ser validado en partidos</p>
          </div>
        )}
      </div>
    </div>
  );
}
