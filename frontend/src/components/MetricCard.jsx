
import { Activity } from "lucide-react";

function MetricCard({
  title,
  value,
  change = "Live",
  icon: Icon = Activity,
}) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#111113] p-5 transition-colors duration-200 hover:border-white/[0.16]">
      {/* Card heading */}
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-zinc-400">
          {title}
        </span>

        <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-2">
          <Icon
            size={18}
            strokeWidth={1.8}
            className="text-zinc-300"
          />
        </div>
      </div>

      {/* Metric value */}
      <div className="mt-5 flex items-end justify-between gap-3">
        <span className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {value}
        </span>

        <span className="flex shrink-0 items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/[0.08] px-2 py-1 text-xs font-medium text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          {change}
        </span>
      </div>

      {/* Footer */}
      <p className="mt-3 text-xs text-zinc-500">
        Updated from your API Gateway
      </p>
    </div>
  );
}

export default MetricCard;
