import { ArrowRight } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  description: string;
  onClick: () => void;
  icon?: React.ReactNode;
}

export default function DashboardCard({ title, description, onClick, icon }: DashboardCardProps) {
  return (
    <article
      className="group rounded-xl border border-slate-200 bg-white p-7 min-h-[170px] flex flex-col hover:border-orange-200 hover:shadow-md transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start gap-4 flex-1">
        <div className="mt-0.5 h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0 text-orange-500 group-hover:bg-orange-100 transition-colors">
          {icon ?? <div className="h-2.5 w-2.5 rounded-full bg-orange-300" />}
        </div>
        <div>
          <h2 className="text-base font-bold text-black leading-snug">{title}</h2>
          <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{description}</p>
        </div>
      </div>

      <div className="flex justify-end mt-5">
        <div
          className="h-8 w-8 rounded-lg bg-black text-white flex items-center justify-center group-hover:bg-orange-500 transition-colors"
          aria-label={`Open ${title}`}
        >
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </article>
  );
}
