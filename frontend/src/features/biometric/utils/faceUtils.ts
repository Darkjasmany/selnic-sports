// Calcula distancia euclidiana entre dos descriptores
/**
 * sum (acumulador): Es el valor que vas arrastrando. Empieza en 0 (el valor que pusiste al final) y va sumando los resultados.
val (elemento actual): Es el número del array a que estás procesando en ese momento.
i (índice): Este es clave en tu código. Te dice la posición actual (0, 1, 2...)
 */
export function euclideanDistance(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(`Descriptores de diferente tamaño: ${a.length} vs ${b.length}`);
  }

  return Math.sqrt(a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0));
}

// Normaliza el descriptor — desde la BD puede llegar como objeto {0: x, 1: y}
// en lugar de array [x, y] dependiendo del driver de Postgres
export function normalizeDescriptor(data: unknown): number[] {
  // 1. Si es array, validamos que el contenido sea numérico (opcional pero recomendado)
  if (Array.isArray(data)) return data as number[];
  if (data !== null && typeof data === "object") {
    const values = Object.values(data); // extraerá todos los valores de las propiedades del objeto y los pondrá en un array.
    // Filtrar o convertir para asegurar que sean números
    return values.map(v => Number(v));
  }
  throw new Error("Formato de descriptor biométrico inválido");
}

// Calcula el porcentaje de coincidencia (0-100)
export function matchPercentage(distance: number): number {
  return Math.round(Math.max(0, Math.min(100, (1 - distance) * 100)));
}

// Determina si la distancia indica la misma persona
export function isSamePerson(distance: number, threshold = 0.55): boolean {
  return distance < threshold;
}

// Carga los modelos de face-api desde /models
/**
 * ssdMobilenetv1: Es el detector. Se encarga de encontrar dónde está la cara en la imagen.
 * faceLandmark68Net: Identifica los puntos clave (ojos, nariz, boca, contorno).
 * faceRecognitionNet: Es el más importante para ti; permite convertir el rostro en un "descriptor" (una lista de números) para poder compararlo con el que ya tienes guardado.
 */
export async function loadFaceApiModels(faceapi: any): Promise<void> {
  const MODEL_URL = `${import.meta.env.BASE_URL}models`;
  try {
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);
  } catch (error) {
    console.error("Detalle del error de carga:", error);
    throw error;
  }
}

// Captura el descriptor de un elemento de video, es la que hace el trabajo pesado en tiempo real. Toma un fotograma del video, busca una cara, y si la encuentra, extrae sus características biométricas.
export async function captureDescriptorFromVideo(
  faceapi: any,
  videoElement: HTMLVideoElement
): Promise<number[] | null> {
  const detection = await faceapi
    .detectSingleFace(videoElement, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 })) // Detecta: Busca una cara en el video
    .withFaceLandmarks()
    .withFaceDescriptor(); //Extrae: Si encuentra una cara, saca su "huella digital facial"

  if (!detection) return null;
  return Array.from(detection.descriptor) as number[];
}

// Inicia la cámara y retorna el stream
export async function startCamera(): Promise<MediaStream> {
  return navigator.mediaDevices.getUserMedia({
    video: { width: 640, height: 480, facingMode: "user" },
  });
}

// Detiene todos los tracks de un stream
export function stopStream(stream: MediaStream | null): void {
  stream?.getTracks().forEach(t => t.stop());
}
