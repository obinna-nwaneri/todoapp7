interface StatCardProps {
  title: string;
  value: number | string;
  accent?: string;
}

export function StatCard({ title, value, accent = "bg-slate-100" }: StatCardProps) {
  return (
    <div className={`rounded-lg ${accent} p-4 shadow`}> 
      <p className="text-sm font-medium text-slate-600">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}
