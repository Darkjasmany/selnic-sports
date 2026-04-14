import { useCallback, useEffect, useRef, useState } from "react";
import {
  captureDescriptorFromVideo,
  loadFaceApiModels,
  startCamera,
  stopStream,
} from "../utils/faceUtils";

export type FaceApiStatus =
  | "idle"
  | "loading_models"
  | "models_ready"
  | "starting_camera"
  | "camera_ready"
  | "capturing"
  | "error";

export function useFaceApi() {
  const faceapiRef = useRef<any>(null);
  const [status, setStatus] = useState<FaceApiStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setStatus("loading_models");
        const faceapi = await import("@vladmandic/face-api"); // Importa face-api.js dinámicamente
        await loadFaceApiModels(faceapi); // Carga todos los modelos
        faceapiRef.current = faceapi;
        setStatus("models_ready");
      } catch (err) {
        console.error("Error cargando modelos:", err);
        setError("No se pudieron cargar los modelos de reconocimiento");
        setStatus("error");
      }
    };
    load();
  }, []);

  const capture = useCallback(
    async (videoElement: HTMLVideoElement): Promise<number[] | null> => {
      if (!faceapiRef.current || status !== "models_ready") return null;
      return captureDescriptorFromVideo(faceapiRef.current, videoElement);
    },
    [status]
  );

  return {
    faceapi: faceapiRef.current,
    status,
    error,
    isReady: status === "models_ready",
    capture,
  };
}

export function useCamera() {
  const streamRef = useRef<MediaStream | null>(null); // streamRef (MediaStream | null): Aquí vas a guardar la señal de la cámara web. No necesitas mostrar el "chorro" de datos en el estado, solo necesitas guardarlo para poder apagar la cámara cuando el usuario termine
  const videoRef = useRef<HTMLVideoElement>(null); // videoRef: Servirá para conectar tu código con la etiqueta <video> que pongas en el HTML.
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = useCallback(async () => {
    try {
      const stream = await startCamera();
      streamRef.current = stream;
      console.log("Stream obtenido:", stream.active); // Debe ser true

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // El navegador a veces bloquea el play automático, lo forzamos:
        await videoRef.current.play();
        console.log("Video reproduciendo");
      } else {
        console.warn("videoRef.current es NULL al intentar asignar el stream");
      }

      setIsActive(true);
      setError(null);
    } catch (error) {
      setError("No se pudo acceder a la cámara. Verifica los permisos.");
      setIsActive(false);
    }
  }, []);

  const stop = useCallback(() => {
    stopStream(streamRef.current);
    streamRef.current = null;
    setIsActive(false);
  }, []);

  // Limpia al desmontar
  useEffect(() => {
    return () => stopStream(streamRef.current);
  }, []);

  return { videoRef, isActive, error, start, stop };
}
