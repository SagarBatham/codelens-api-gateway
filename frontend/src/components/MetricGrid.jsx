
import { useEffect, useState } from "react";
import {
  Activity,
  ShieldCheck,
  ShieldAlert,
  Zap,
} from "lucide-react";

import MetricCard from "./MetricCard";
import {
  fetchRateLimiterMetrics,
  fetchLatencyMetrics,
} from "../services/metricsService";

export default function MetricGrid() {
  const [metrics, setMetrics] = useState({
    total: 0,
    allowed: 0,
    rejected: 0,
    averageLatencyMs: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadMetrics() {
      try {
        const [rateLimiter, latency] = await Promise.all([
          fetchRateLimiterMetrics(),
          fetchLatencyMetrics(),
        ]);

        if (active) {
          setMetrics({
            ...rateLimiter,
            averageLatencyMs: latency.averageLatencyMs,
          });
          setError("");
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Unable to load metrics.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadMetrics();

    const interval = setInterval(loadMetrics, 5000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const cards = [
    {
      title: "Total requests",
      value: metrics.total.toLocaleString(),
      icon: Activity,
    },
    {
      title: "Allowed requests",
      value: metrics.allowed.toLocaleString(),
      icon: ShieldCheck,
    },
    {
      title: "Rejected requests",
      value: metrics.rejected.toLocaleString(),
      icon: ShieldAlert,
    },
    {
      title: "Avg. latency",
      value: `${metrics.averageLatencyMs.toFixed(2)} ms`,
      icon: Zap,
    },
  ];

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.title}
            className="animate-pulse rounded-2xl border border-white/[0.08] bg-[#111113] p-5"
          >
            <div className="h-4 w-32 rounded bg-white/10" />
            <div className="mt-6 h-8 w-24 rounded bg-white/10" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-sm text-rose-300">
        Failed to load dashboard metrics: {error}
      </div>
    );
  }

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <MetricCard
          key={card.title}
          title={card.title}
          value={card.value}
          icon={card.icon}
          change="Live"
        />
      ))}
    </section>
  );
}
