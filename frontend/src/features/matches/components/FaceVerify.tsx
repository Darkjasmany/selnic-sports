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
  return <div>FaceVerify</div>;
};

export default FaceVerify;
