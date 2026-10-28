
import { RefreshCw, Server } from "lucide-react";

export default function ServicesTable({
  services = [],
  healthLoading = false,
  onRefresh,
  searchTerm = "",
  onSearchChange,
  statusFilter = "All",
  onStatusChange,
}) {
  const isUp = (service) =>
    String(service.status ?? "").toUpperCase() === "ONLINE" ||
    String(service.status ?? "").toUpperCase() === "UP";

  return (
    <section className="rounded-2xl border border-white/[0.08] bg-[#111113] p-5">
      <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Microservice Health
          </h2>

          <p className="mt-1 text-sm text-zinc-400">
            Health status of your gateway and distributed services
          </p>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={healthLoading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.1] px-4 py-2 text-sm text-zinc-200 transition-colors hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={healthLoading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          type="text"
          value={searchTerm}
          onChange={(event) => onSearchChange?.(event.target.value)}
          placeholder="Search services..."
          aria-label="Search services"
          className="w-full rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 py-2.5 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-sky-500/50"
        />

        <select
          value={statusFilter}
          onChange={(event) => onStatusChange?.(event.target.value)}
          aria-label="Filter services by status"
          className="w-full rounded-xl border border-white/[0.1] bg-[#18181b] px-4 py-2.5 text-sm text-white outline-none focus:border-sky-500/50"
        >
          <option value="All">All statuses</option>
          <option value="Online">Online</option>
          <option value="Offline">Offline</option>
          <option value="Unknown">Unknown</option>
          <option value="Not monitored">Not monitored</option>
        </select>
      </div>

      <div className="space-y-3">
        {services.map((service) => {
          const online = isUp(service);

          return (
            <div
              key={service.name}
              className="flex flex-col justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.015] p-4 sm:flex-row sm:items-center"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-2.5">
                  <Server size={18} className="text-zinc-300" />
                </div>

                <div>
                  <p className="font-medium text-white">
                    {service.name}
                  </p>

                  <p className="mt-1 text-xs text-zinc-500">
                    Port {service.port?.replace(/^:/, "") || "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <span className="text-sm text-zinc-400">
                  {service.latency || "—"}
                </span>

                <span
                  className={`inline-flex min-w-24 items-center justify-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${
                    online
                      ? "border-emerald-500/20 bg-emerald-500/[0.07] text-emerald-400"
                      : service.status === "Not monitored"
                        ? "border-white/[0.1] bg-white/[0.04] text-zinc-400"
                        : "border-rose-500/20 bg-rose-500/[0.07] text-rose-400"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      online
                        ? "bg-emerald-400"
                        : service.status === "Not monitored"
                          ? "bg-zinc-500"
                          : "bg-rose-400"
                    }`}
                  />

                  {service.status || "Unknown"}
                </span>
              </div>
            </div>
          );
        })}

        {!healthLoading && services.length === 0 && (
          <p className="rounded-xl border border-white/[0.06] p-6 text-center text-sm text-zinc-400">
            No services match your search or selected status.
          </p>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
        <span>{services.length} service(s) displayed</span>

        <span>
          {healthLoading ? "Checking services..." : "Health check complete"}
        </span>
      </div>
    </section>
  );
}
