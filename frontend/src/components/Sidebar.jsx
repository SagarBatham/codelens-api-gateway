
import {
  Activity,
  Code2,
  LayoutDashboard,
  Package,
  Server,
  ShieldCheck,
  ShoppingCart,
  Zap,
} from "lucide-react";

const navigationItems = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Services", icon: Server },
  { label: "Rate Limiter", icon: ShieldCheck },
  { label: "Products", icon: Package },
  { label: "Orders", icon: ShoppingCart },
  { label: "API Explorer", icon: Code2 },
];

export default function Sidebar({
  activePage,
  isOpen,
  onClose,
  onNavigate,
}) {
  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
        />
      )}

      <aside
        aria-label="Main navigation"
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-white/[0.08] bg-[#0d0d0f] transition-transform duration-200 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="flex h-20 items-center gap-3 border-b border-white/[0.08] px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black">
            <Activity size={22} strokeWidth={2.5} />
          </div>

          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">
              CodeLens
            </h1>

            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
              API observability
            </p>
          </div>
        </div>

        <div className="px-4 pt-7">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-600">
            Workspace
          </p>

          <nav className="space-y-1">
            {navigationItems.map(({ label, icon: Icon }) => {
              const isActive = activePage === label;

              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => onNavigate(label)}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                    isActive
                      ? "bg-white font-semibold text-black"
                      : "text-zinc-400 hover:bg-white/[0.05] hover:text-white"
                  }`}
                >
                  <Icon size={18} />

                  <span>{label}</span>

                  {label === "Rate Limiter" && (
                    <span
                      className={`ml-auto rounded-md px-1.5 py-0.5 text-[10px] ${
                        isActive ? "bg-black/10" : "bg-white/[0.07]"
                      }`}
                    >
                      5/min
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-4">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-white">
              <Zap size={16} />
              Development mode
            </div>

            <p className="mt-2 text-xs leading-5 text-zinc-500">
              Service health and dashboard metrics are retrieved from
              configured backend endpoints. Availability depends on the
              running services.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
