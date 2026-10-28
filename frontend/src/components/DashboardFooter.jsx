
import { Activity, CircleHelp } from "lucide-react";

export default function DashboardFooter() {
  return (
    <footer className="flex flex-col gap-3 border-t border-white/[0.07] py-5 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-medium text-zinc-300">
          CodeLens · Distributed API Gateway
        </p>

        <p className="mt-1 text-zinc-600">
          Smart rate limiting and microservice monitoring
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:items-end">
        <span className="inline-flex items-center gap-2">
          <Activity size={13} className="text-emerald-400" />
          Metrics are fetched from configured backend endpoints.
        </span>

        <span className="flex items-start gap-2 sm:items-center">
          <CircleHelp size={13} className="mt-0.5 shrink-0 sm:mt-0" />
          Traffic charts show sampled counter changes; displayed values depend
          on backend instrumentation.
        </span>
      </div>
    </footer>
  );
}
