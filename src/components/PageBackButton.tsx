import { ArrowLeft } from 'lucide-react';

type PageBackButtonProps = {
  onClick: () => void;
  label?: string;
  className?: string;
};

export default function PageBackButton({ onClick, label = 'Back', className = '' }: PageBackButtonProps) {
  return (
    <div className={className}>
      <button
        onClick={onClick}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition-colors hover:border-slate-400 hover:bg-slate-50 cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>{label}</span>
      </button>
    </div>
  );
}