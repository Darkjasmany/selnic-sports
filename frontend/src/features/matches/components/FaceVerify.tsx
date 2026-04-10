import { useEffect, useRef, useState } from "react";

type Props = {
  playerDescriptor: number[];
  playerName: string;
  onSuccess: () => void;
  onCancel: () => void;
};

// Calcular la distancia entre dos descriptores biométricos usando la distancia euclidiana
/**
 * sum (acumulador): Es el valor que vas arrastrando. Empieza en 0 (el valor que pusiste al final) y va sumando los resultados.
val (elemento actual): Es el número del array a que estás procesando en ese momento.
i (índice): Este es clave en tu código. Te dice la posición actual (0, 1, 2...)
 */
function euclideanDistance(a: number[], b: number[]): number {
  return Math.sqrt(a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0));
}

const FaceVerify = ({ playerDescriptor, playerName, onSuccess, onCancel }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null); // videoRef: Servirá para conectar tu código con la etiqueta <video> que pongas en el HTML.
  const canvasRef = useRef<HTMLCanvasElement>(null); // canvasRef: Servirá para conectar tu código con el <canvas> (donde se procesa la imagen de la cara).
  const [status, setStatus] = useState<"loading" | "scanning" | "success" | "failed">("loading");
  const [message, setMessage] = useState("Cargando modelos...");
  const streamRef = useRef<MediaStream | null>(null); // streamRef (MediaStream | null): Aquí vas a guardar la señal de la cámara web. No necesitas mostrar el "chorro" de datos en el estado, solo necesitas guardarlo para poder apagar la cámara cuando el usuario termine
  // const intervalRef = useRef<NodeJS.Timeout | null>(null); // intervalRef (NodeJS.Timeout | null): Para el reconocimiento facial, seguramente vas a estar analizando la cara cada 100 o 200 milisegundos. Este useRef guardará el "reloj" (el intervalo) para que puedas detenerlo (limpiarlo) y que la aplicación no se quede procesando infinitamente de fondo.

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null); // el código detecta automáticamente si estás en el navegador o en Node
  // const intervalRef = useRef<number | null>(null); // solo correrá en el navegador (Chrome, Safari, etc.), también puedes usar simplemente number

  useEffect(() => {
    let faceapi: any;
    const loadAndStart = async () => {
      try {
        // Importa face-api.js dinámicamente
        faceapi = await import("@vladmandic/face-api");

        // Carga todos los modelos
        /**
         * ssdMobilenetv1: Es el detector. Se encarga de encontrar dónde está la cara en la imagen.
         * faceLandmark68Net: Identifica los puntos clave (ojos, nariz, boca, contorno).
         * faceRecognitionNet: Es el más importante para ti; permite convertir el rostro en un "descriptor" (una lista de números) para poder compararlo con el que ya tienes guardado.
         */
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
          faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
          faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
        ]);

        setMessage("Modelos cargados. Posiciona tu rostro...");

        /**
         * Aquí es donde el navegador le pide permiso al usuario para usar la cámara.
         * facingMode: "user": Le dice que use la cámara frontal (ideal para laptops o celulares).
         * width/height: Define la resolución del video.
         */
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: "user" },
        });

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        setStatus("scanning");
        setMessage("Mirando a la cámara...");

        // Escanea cada 800ms
        intervalRef.current = setInterval(async () => {
          if (!videoRef.current || !faceapi) return;

          const detection = await faceapi
            .detectSingleFace(videoRef.current, new faceapi.SsdMobilenetv1Options()) // Detecta: Busca una cara en el video
            .withFaceLandmarks() //
            .withFaceDescriptor(); //Extrae: Si encuentra una cara, saca su "huella digital facial"

          if (!detection) {
            setMessage("No se detecta rostro. Posiciona tu cara frente a la cámara.");
            return;
          }

          const liveDescriptor = Array.from(detection.descriptor);
          const distance = euclideanDistance(playerDescriptor, liveDescriptor);

          // Umbral de 0.5 — ajusta según necesidades
          // Si el número es cercano a 0, las caras son idénticas. Si el número es alto (ej: mayor a 0.5), son personas diferentes.
          if (distance < 0.5) {
            clearInterval(intervalRef.current!);
            stopCamera();
            setStatus("success");
            setMessage("¡Identidad verificada!");
            setTimeout(onSuccess, 1200);
          } else {
            setMessage(`Verificando... (distancia: ${distance.toFixed(2)})`);
          }
        }, 800);
      } catch (error) {
        setStatus("failed");
        setMessage("Error al acceder a la cámara o cargar modelos.");
        console.error(error);
      }
    };

    loadAndStart();

    return () => {
      clearInterval(intervalRef.current!);
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 ">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-medium text-white mb-1">Verificando identidad</h3>
        <p className="text-slate-400 text-sm mb-4 ">{playerName}</p>

        <div className="relative bg-black rounded-lg overflow-hidden mb-4">
          <video
            src=""
            ref={videoRef}
            muted
            playsInline
            className="w-full rounded-lg"
            style={{ transform: "scaleX(-1)" }}
          />

          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

          {/* Overlay de estado */}
          <div
            className={` absolute bottom-3 left-3 right-3 py-2 px-3 rounded-lg text-sm text-center
            ${status === "success" ? "bg-green-600" : "bg-black/60"}`}
          >
            {status === "loading" && <span className="text-slate-300">⏳ {message}</span>}
            {status === "scanning" && <span className="text-white">🔍 {message}</span>}
            {status === "success" && <span className="text-white font-medium">✅ {message}</span>}
            {status === "failed" && <span className="text-red-400">❌ {message}</span>}
          </div>
        </div>

        <button
          onClick={() => {
            stopCamera();
            onCancel();
          }}
          className="w-full h-10 rounded-lg border border-slate-700 text-slate-400 hover:bg-slate-800 transition text-sm"
        >
          Cancelar Verificación
        </button>
      </div>
    </div>
  );
};

export default FaceVerify;
