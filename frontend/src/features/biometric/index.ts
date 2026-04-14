// Componentes
export { default as FaceCapture } from "./components/FaceCapture";
export { default as FaceGuide } from "./components/FaceGuide";
export { default as FaceVerify } from "./components/FaceVerify";

// Hooks
export { useCamera, useFaceApi } from "./hooks/useBiometric";

// Utils
export {
  captureDescriptorFromVideo,
  euclideanDistance,
  isSamePerson,
  loadFaceApiModels,
  matchPercentage,
  normalizeDescriptor,
  startCamera,
  stopStream,
} from "./utils/faceUtils";

// API
export { saveBiometric } from "./api/biometric.api";
