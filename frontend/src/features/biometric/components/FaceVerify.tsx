import { useEffect, useRef, useState } from "react";
import { useCamera, useFaceApi } from "../hooks/useBiometric";
import {
  euclideanDistance,
  isSamePerson,
  matchPercentage,
  normalizeDescriptor,
} from "../utils/faceUtils";
import FaceGuide from "./FaceGuide";

type VerifyStatus = "loading" | "scanning" | "success" | "failed";

type Props = {
  playerDescriptor: number[];
  playerName: string;
  onSuccess: () => void;
  onCancel: () => void;
};

export default function FaceVerify({ playerDescriptor, playerName, onSuccess, onCancel }: Props) {
  const [verifyStatus, setVerifyStatus] = useState<VerifyStatus>("loading");
  const [message, setMessage] = useState("Iniciando cámara...");
  const [percentage, setPercentage] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { faceapi, isReady, error: modelError } = useFaceApi();
  const { videoRef, start, stop } = useCamera();

  // Normaliza el descriptor al montar — por si llega como objeto desde la BD
  const safeDescriptor = normalizeDescriptor(playerDescriptor);

  useEffect(() => {
    const init = async () => {
      // Esperamos un micro-momento para asegurar que el DOM cargó el elemento video
      await new Promise(resolve => setTimeout(resolve, 100));

      await start();

      if (!isReady) {
        setMessage("Cargando modelos...");
        // Espera hasta que estén listos
        const wait = setInterval(() => {
          if (isReady) {
            clearInterval(wait);
            startScanning();
          }
        }, 500);
        return;
      }

      startScanning();
    };

    init();

    return () => {
      clearInterval(intervalRef.current!);
      stop();
    };
  }, [isReady]);

  const startScanning = () => {
    setVerifyStatus("scanning");
    setMessage("Posiciona tu rostro frente a la cámara");

    intervalRef.current = setInterval(async () => {
      if (!videoRef.current || !faceapi) return;

      const detection = await faceapi
        .detectSingleFace(
          videoRef.current,
          new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 })
        )
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setMessage("No se detecta rostro. Centra tu cara.");
        setPercentage(0);
        return;
      }

      const liveDescriptor = Array.from(detection.descriptor) as number[];
      const distance = euclideanDistance(safeDescriptor, liveDescriptor);
      const pct = matchPercentage(distance);

      // Log para depurar — quitar en producción
      console.log("[FaceVerify]", {
        distancia: distance.toFixed(3),
        coincidencia: `${pct}%`,
        umbral: 0.55,
        resultado: isSamePerson(distance) ? "✅ MISMO" : "❌ DIFERENTE",
      });

      setPercentage(pct);

      if (isSamePerson(distance)) {
        clearInterval(intervalRef.current!);
        stop();
        setVerifyStatus("success");
        setMessage("¡Identidad verificada!");
        setTimeout(onSuccess, 1200);
      } else {
        setMessage(pct > 60 ? "Casi... mantén el rostro estable" : "Verificando...");
      }
    }, 1000);
  };

  const handleCancel = () => {
    clearInterval(intervalRef.current!);
    stop();
    onCancel();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md mx-4">
        {/* Header */}
        <h3 className="text-lg font-medium text-white mb-1">Verificando identidad</h3>
        <p className="text-slate-400 text-sm mb-4">{playerName}</p>

        {modelError && (
          <div className="bg-red-900/30 border border-red-800 rounded-lg p-3 mb-4">
            <p className="text-red-400 text-sm">{modelError}</p>
          </div>
        )}

        {/* Video */}
        <div className="relative bg-black rounded-xl overflow-hidden mb-4">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            onLoadedMetadata={() => videoRef.current?.play()} // Fuerza el play al cargar metadatos
            className="w-full rounded-xl"
            style={{ transform: "scaleX(-1)", display: "block" }} // Asegura que no sea invisible
          />

          <FaceGuide
            percentage={verifyStatus === "scanning" ? percentage : undefined}
            isSuccess={verifyStatus === "success"}
          />

          {/* Overlay de estado */}
          <div
            className={`
            absolute bottom-3 left-3 right-3 py-2 px-3 rounded-lg
            text-sm text-center transition-colors
            ${verifyStatus === "success" ? "bg-green-600" : "bg-black/70"}
          `}
          >
            {verifyStatus === "loading" && <span className="text-slate-300">⏳ {message}</span>}
            {verifyStatus === "scanning" && <span className="text-white">🔍 {message}</span>}
            {verifyStatus === "success" && (
              <span className="text-white font-medium">✅ {message}</span>
            )}
            {verifyStatus === "failed" && <span className="text-red-400">❌ {message}</span>}
          </div>
        </div>

        <button
          onClick={handleCancel}
          className="w-full h-10 rounded-lg border border-slate-700
                     text-slate-400 hover:bg-slate-800 transition text-sm"
        >
          Cancelar verificación
        </button>
      </div>
    </div>
  );
}
