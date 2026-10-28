
import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

import { fetchRateLimiterMetrics } from "../services/metricsService";

const RateLimiterCard = () => {
  const [metrics, setMetrics] = useState({
    total: 0,
    allowed: 0,
    rejected: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadMetrics = useCallback(async (showLoading = false) => {
    if (showLoading) {
      setLoading(true);
    }

    try {
      const data = await fetchRateLimiterMetrics();

      setMetrics({
        total: Number(data.total ?? 0),
        allowed: Number(data.allowed ?? 0),
        rejected: Number(data.rejected ?? 0),
      });

      setLastUpdated(new Date());
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load metrics.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    let polling = false;

    async function refresh() {
      if (polling) return;

      polling = true;

      try {
        const data = await fetchRateLimiterMetrics();

        if (!active) return;

        setMetrics({
          total: Number(data.total ?? 0),
          allowed: Number(data.allowed ?? 0),
          rejected: Number(data.rejected ?? 0),
        });

        setLastUpdated(new Date());
        setError("");
      } catch (err) {
        if (active) {
          setError(err.message || "Failed to load metrics.");
        }
      } finally {
        polling = false;

        if (active) {
          setLoading(false);
        }
      }
    }

    refresh();

    const intervalId = window.setInterval(refresh, 5000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const rejectionRate =
    metrics.total > 0
      ? ((metrics.rejected / metrics.total) * 100).toFixed(1)
      : "0.0";

  const cards = [
    {
      title: "Total Requests",
      value: metrics.total,
      icon: Activity,
      description: "Requests evaluated",
    },
    {
      title: "Allowed Requests",
      value: metrics.allowed,
      icon: ShieldCheck,
      description: "Requests permitted",
    },
    {
      title: "Rejected Requests",
      value: metrics.rejected,
      icon: ShieldAlert,
      description: "Requests blocked",
    },
  ];

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">
            Rate Limiter
          </h2>

          <p className="mt-1 text-sm text-gray-400">
            Automatically refreshed gateway metrics
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadMetrics(true)}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-700 px-4 py-2 text-sm text-gray-200 transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh now
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-900 bg-red-950/40 p-3 text-sm text-red-300"
        >
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {cards.map(({ title, value, icon: Icon, description }) => (
          <div
            key={title}
            className="rounded-2xl border border-gray-800 bg-gray-950 p-5"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">
                {title}
              </span>

              <Icon size={20} className="text-gray-300" />
            </div>

            <p className="mt-4 text-3xl font-semibold text-white">
              {loading ? "..." : value.toLocaleString()}
            </p>

            <p className="mt-2 text-xs text-gray-500">
              {description}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-gray-800 bg-gray-950 p-5">
          <div className="flex items-center gap-2 text-gray-400">
            <TrendingUp size={18} />
            <span className="text-sm">Rejection Rate</span>
          </div>

          <p className="mt-3 text-3xl font-semibold text-white">
            {rejectionRate}%
          </p>

          <p className="mt-2 text-xs text-gray-500">
            Rejected requests divided by total requests
          </p>
        </div>

        <div className="rounded-2xl border border-gray-800 bg-gray-950 p-5">
          <p className="text-sm text-gray-400">Last Updated</p>

          <p className="mt-3 text-lg font-medium text-white">
            {lastUpdated
              ? lastUpdated.toLocaleTimeString()
              : "Waiting for data..."}
          </p>

          <p className="mt-2 text-xs text-gray-500">
            Refresh interval: 5 seconds
          </p>
        </div>
      </div>

      <p className="text-sm text-gray-400">
        Policy: 5 requests per client IP per 60-second window.
        Excess requests receive HTTP 429.
      </p>
    </section>
  );
};

export default RateLimiterCard;
