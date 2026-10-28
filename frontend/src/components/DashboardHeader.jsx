
import { LogOut, Menu, RefreshCw, Activity } from "lucide-react";

export default function DashboardHeader({
  activePage,
  healthLoading,
  onCheckHealth,
  onOpenSidebar,
  onLogout,
}) {
  return (
    <header className="sticky top-0 z-30 flex min-h-20 items-center justify-between gap-4 border-b border-white/[0.08] bg-[#09090b]/90 px-4 backdrop-blur-xl sm:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          aria-label="Open navigation"
          className="rounded-lg border border-white/10 p-2 text-zinc-300 transition hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 md:hidden"
        >
          <Menu size={20} />
        </button>

        <div className="min-w-0">
          <p className="flex items-center gap-2 text-xs text-zinc-500">
            <Activity size={13} />
            CodeLens / Dashboard
          </p>

          <h1 className="truncate text-lg font-semibold text-white sm:text-xl">
            {activePage}
          </h1>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={onCheckHealth}
          disabled={healthLoading}
          aria-busy={healthLoading}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={healthLoading ? "animate-spin" : ""}
          />

          <span className="hidden sm:inline">
            {healthLoading ? "Checking..." : "Check health"}
          </span>
        </button>

        <button
          type="button"
          onClick={onLogout}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-zinc-300 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
