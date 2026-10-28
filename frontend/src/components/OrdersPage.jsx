
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ClipboardList,
  RefreshCw,
  Search,
} from "lucide-react";

import { fetchOrders } from "../services/orderService";

function StatusBadge({ status }) {
  const normalizedStatus = String(status ?? "UNKNOWN")
    .trim()
    .toUpperCase();

  const styles = {
    COMPLETED: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
    DELIVERED: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
    PENDING: "border-amber-500/20 bg-amber-500/10 text-amber-300",
    PROCESSING: "border-blue-500/20 bg-blue-500/10 text-blue-300",
    CANCELLED: "border-red-500/20 bg-red-500/10 text-red-300",
  };

  const style =
    styles[normalizedStatus] ??
    "border-white/10 bg-white/5 text-zinc-300";

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${style}`}
    >
      {normalizedStatus.replaceAll("_", " ")}
    </span>
  );
}

function formatCurrency(value) {
  if (
    value == null ||
    value === "" ||
    !Number.isFinite(Number(value))
  ) {
    return "—";
  }

  return `₹${Number(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await fetchOrders();

      if (!Array.isArray(data)) {
        throw new Error("The Order Service returned an unexpected response.");
      }

      setOrders(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load orders."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const filteredOrders = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return orders.filter((order) => {
      const searchableText = [
        order.id,
        order.userId,
        order.productId,
        order.status,
      ]
        .map((value) => String(value ?? ""))
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [orders, searchTerm]);

  const totalOrderValue = orders.reduce(
    (total, order) => total + (Number(order.totalPrice) || 0),
    0
  );

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Order management
          </p>

          <h2 className="mt-2 text-2xl font-semibold text-white">
            Orders
          </h2>

          <p className="mt-1 text-sm text-zinc-400">
            Live order records from your Order Service.
          </p>
        </div>

        <button
          type="button"
          onClick={loadOrders}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-zinc-200 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/[0.08] bg-[#111113] p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-400">Total orders</p>
            <ClipboardList size={19} className="text-zinc-400" />
          </div>

          <p className="mt-3 text-3xl font-semibold text-white">
            {orders.length.toLocaleString("en-IN")}
          </p>

          <p className="mt-1 text-xs text-zinc-500">
            Orders returned by the API
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-[#111113] p-5">
          <p className="text-sm text-zinc-400">Combined order value</p>

          <p className="mt-3 text-3xl font-semibold text-white">
            {formatCurrency(totalOrderValue)}
          </p>

          <p className="mt-1 text-xs text-zinc-500">
            Sum of returned order totals; not necessarily recognized revenue
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111113]">
        <div className="border-b border-white/[0.07] p-5 sm:p-6">
          <label className="flex max-w-md items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 focus-within:border-white/25">
            <Search size={17} className="shrink-0 text-zinc-500" />

            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search order, user, product, or status..."
              aria-label="Search orders"
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-600"
            />
          </label>
        </div>

        {error && (
          <div
            role="alert"
            className="m-5 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/[0.06] p-4 text-sm text-red-300"
          >
            <AlertCircle size={18} className="mt-0.5 shrink-0" />

            <div>
              <p className="font-medium">Could not load orders</p>
              <p className="mt-1">{error}</p>

              <button
                type="button"
                onClick={loadOrders}
                disabled={loading}
                className="mt-3 underline underline-offset-4 disabled:opacity-50"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center text-sm text-zinc-400">
            Loading orders...
          </div>
        ) : !error ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.02] text-xs uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="px-5 py-4 font-medium">Order ID</th>
                  <th className="px-5 py-4 font-medium">User ID</th>
                  <th className="px-5 py-4 font-medium">Product ID</th>
                  <th className="px-5 py-4 font-medium">Quantity</th>
                  <th className="px-5 py-4 font-medium">Total</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/[0.06]">
                {filteredOrders.map((order, index) => (
                  <tr
                    key={order.id ?? `${order.userId}-${order.productId}-${index}`}
                    className="transition hover:bg-white/[0.025]"
                  >
                    <td className="px-5 py-4 font-medium text-zinc-200">
                      #{order.id ?? "—"}
                    </td>

                    <td className="px-5 py-4 text-zinc-400">
                      {order.userId ?? "—"}
                    </td>

                    <td className="px-5 py-4 text-zinc-400">
                      {order.productId ?? "—"}
                    </td>

                    <td className="px-5 py-4 text-zinc-300">
                      {order.quantity ?? "—"}
                    </td>

                    <td className="px-5 py-4 font-medium text-zinc-200">
                      {formatCurrency(order.totalPrice)}
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={order.status} />
                    </td>
                  </tr>
                ))}

                {filteredOrders.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-12 text-center text-zinc-500"
                    >
                      {orders.length === 0
                        ? "No orders available."
                        : "No orders match your search."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </section>
  );
}
