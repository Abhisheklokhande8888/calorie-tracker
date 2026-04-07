/**
 * Horizontal progress bar with label and optional percentage.
 */
export default function GoalProgress({ label, current, goal, percent, colorClass }) {
  const safePct = Math.min(100, Math.max(0, percent ?? 0));
  const barColor = colorClass || "bg-brand-500";

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-slate-700 dark:text-slate-200">{label}</span>
        <span className="text-slate-500 dark:text-slate-400">
          {Math.round(current)} / {goal} ({safePct}%)
        </span>
      </div>
      <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${safePct}%` }}
        />
      </div>
    </div>
  );
}
