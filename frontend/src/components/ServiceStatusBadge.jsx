
export default function ServiceStatusBadge({ status }) {
  const normalizedStatus = String(status ?? "Unknown")
    .trim()
    .toUpperCase();

  const online = ["ONLINE", "UP", "HEALTHY"].includes(normalizedStatus);
  const checking = ["CHECKING", "STARTING"].includes(normalizedStatus);
  const notMonitored = normalizedStatus === "NOT MONITORED";

  const label = notMonitored
    ? "Not monitored"
    : checking
      ? status
      : online
        ? "Online"
        : normalizedStatus === "DOWN" ||
            normalizedStatus === "OFFLINE"
          ? "Offline"
          : status || "Unknown";

  const colors = online
    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
    : checking
      ? "border-amber-500/20 bg-amber-500/10 text-amber-300"
      : notMonitored
        ? "border-zinc-500/20 bg-zinc-500/10 text-zinc-400"
        : "border-rose-500/20 bg-rose-500/10 text-rose-400";

  const dotColor = online
    ? "bg-emerald-400"
    : checking
      ? "bg-amber-300"
      : notMonitored
        ? "bg-zinc-500"
        : "bg-rose-400";

  return (
    <span
      role="status"
      className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium ${colors}`}
    >
      <span
        aria-hidden="true"
        className={`h-1.5 w-1.5 rounded-full ${dotColor}`}
      />
      {label}
    </span>
  );
}
