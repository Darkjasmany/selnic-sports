type Props = {
  percentage?: number;
  isSuccess?: boolean;
};
const FaceGuide = ({ percentage, isSuccess }: Props) => {
  const color = isSuccess
    ? "border-green-400"
    : percentage !== undefined && percentage > 70
      ? "border-amber-400"
      : "border-sky-400 opacity-60";

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {/* Marco oval */}
      <div className={`w-48 h-56 border-2 rounded-full transition-colors duration-300 ${color}`} />

      {/* Indicador de porcentaje */}
      {percentage !== undefined && percentage > 0 && !isSuccess && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2">
          <div className="w-32 bg-black/50 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${
                percentage >= 85 ? "bg-green-400" : percentage >= 60 ? "bg-amber-400" : "bg-red-400"
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p className="text-xs text-white text-center mt-1 bg-black/50 px-2 py-0.5 rounded">
            {percentage}% coincidencia
          </p>
        </div>
      )}

      {/* Check de éxito */}
      {isSuccess && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-6xl">✅</div>
        </div>
      )}
    </div>
  );
};

export default FaceGuide;
