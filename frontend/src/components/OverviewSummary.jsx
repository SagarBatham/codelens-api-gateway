
import { Activity, AlertCircle, CheckCircle2, Clock } from "lucide-react";

export default function OverviewSummary({ lastChecked, healthError }) {
  const isHealthy = Boolean(lastChecked) && !healthError;

  return (
    <section>
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-zinc-500">
            System overview
          </p>

          <h3 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Your infrastructure,{" "}
            <span className="text-zinc-500">in focus.</span>
          </h3>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
            Monitor your gateway, traffic, and distributed services from one
            place.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium ${
              healthError
                ? "border-rose-500/20 bg-rose-500/[0.06] text-rose-300"
                : isHealthy
                  ? "border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-300"
                  : "border-white/[0.08] bg-white/[0.03] text-zinc-400"
            }`}
          >
            {healthError ? (
              <AlertCircle size={14} />
            ) : isHealthy ? (
              <CheckCircle2 size={14} />
            ) : (
              <Activity size={14} />
            )}

            {healthError
              ? "Health check failed"
              : isHealthy
                ? "Health check successful"
                : "Checking services"}
          </div>

          <div className="inline-flex items-center gap-2 text-xs text-zinc-500">
            <Clock size={14} />

            {lastChecked
              ? `Last checked ${lastChecked.toLocaleTimeString()}`
              : "Waiting for first health check"}
          </div>
        </div>
      </div>

      {healthError && (
        <div
          role="alert"
          className="mt-7 rounded-xl border border-rose-500/20 bg-rose-500/[0.06] px-4 py-3 text-sm text-rose-300"
        >
          {healthError}

          <p className="mt-1 text-xs text-rose-300/70">
            If the browser console mentions CORS, configure CORS on the
            gateway for your Vite origin, usually http://localhost:5173.
          </p>
        </div>
      )}
    </section>
  );
}
