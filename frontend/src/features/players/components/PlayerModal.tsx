type Props = {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
};
const PlayerModal = ({ isOpen, title, onClose, children }: Props) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-5xl shadow-xl flex flex-col max-h-[95vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0">
          <h2 className="text-lg font-medium text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition text-xl leading-none"
          >
            ✕
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default PlayerModal;
