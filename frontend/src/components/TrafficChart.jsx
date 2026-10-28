
import { useEffect, useRef, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import { fetchRateLimiterMetrics } from "../services/metricsService";

const HISTORY_KEY = "codelens-traffic-history";
const LAST_TOTAL_KEY = "codelens-traffic-last-total";
const MAX_POINTS = 30;

function readHistory() {
  try {
    const saved = sessionStorage.getItem(HISTORY_KEY);

    if (!saved) return [];

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed) ? parsed.slice(-MAX_POINTS) : [];
  } catch {
    return [];
  }
}

function readLastTotal() {
  try {
    const saved = sessionStorage.getItem(LAST_TOTAL_KEY);

    if (saved === null) return null;

    const value = Number(saved);

    return Number.isFinite(value) ? value : null;
  } catch {
    return null;
  }
}

export default function TrafficChart() {
  const [history, setHistory] = useState(readHistory);
  const [chartError, setChartError] = useState(false);

  const previousTotal = useRef(readLastTotal());

  const nextEvent = useRef(
    history.length > 0
      ? Math.max(...history.map((point) => point.event || 0)) + 1
      : 1
  );

  useEffect(() => {
    let mounted = true;
    let polling = false;

    async function pollMetrics() {
      if (polling) return;

      polling = true;

      try {
        const metrics = await fetchRateLimiterMetrics();

        if (!mounted) return;

        const currentTotal = Number(metrics.total);

        if (!Number.isFinite(currentTotal)) return;

        const previousValue = previousTotal.current;

        const intervalRequests =
          previousValue === null
            ? 0
            : currentTotal >= previousValue
              ? currentTotal - previousValue
              : currentTotal;

        previousTotal.current = currentTotal;

        try {
          sessionStorage.setItem(
            LAST_TOTAL_KEY,
            String(currentTotal)
          );
        } catch {
          // The chart can still work if session storage is unavailable.
        }

        setHistory((oldHistory) => {
          const newPoint = {
            event: nextEvent.current++,
            requests: intervalRequests,
          };

          const updatedHistory = [
            ...oldHistory,
            newPoint,
          ].slice(-MAX_POINTS);

          try {
            sessionStorage.setItem(
              HISTORY_KEY,
              JSON.stringify(updatedHistory)
            );
          } catch {
            // Keep the chart working without persistent session history.
          }

          return updatedHistory;
        });

        setChartError(false);
      } catch (error) {
        if (mounted) {
          setChartError(true);
        }

        console.error("Failed to fetch traffic metrics:", error);
      } finally {
        polling = false;
      }
    }

    pollMetrics();

    const intervalId = window.setInterval(pollMetrics, 1000);

    return () => {
      mounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const maxRequests = Math.max(
    5,
    ...history.map((point) => point.requests || 0)
  );

  return (
    <section className="rounded-2xl border border-white/[0.08] bg-[#111113] p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-white">
            Live Traffic
          </h3>

          <p className="mt-1 text-xs text-zinc-500">
            Requests detected per polling interval
          </p>
        </div>

        <span className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-300">
          <span
            className={`h-2 w-2 rounded-full ${
              chartError ? "bg-rose-400" : "bg-emerald-400"
            }`}
          />
          {chartError ? "Connection issue" : "Live"}
        </span>
      </div>

      <div className="h-64 w-full">
        {history.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-zinc-500">
            Waiting for traffic data...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={history}
              margin={{ top: 10, right: 12, left: -12, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#27272a"
              />

              <XAxis
                dataKey="event"
                stroke="#71717a"
                tick={{ fill: "#a1a1aa", fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: "#3f3f46" }}
                minTickGap={20}
              />

              <YAxis
                domain={[0, maxRequests]}
                allowDecimals={false}
                stroke="#71717a"
                tick={{ fill: "#a1a1aa", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181b",
                  border: "1px solid #3f3f46",
                  borderRadius: "10px",
                  color: "#f4f4f5",
                }}
                labelStyle={{ color: "#a1a1aa" }}
                formatter={(value) => [value, "Requests"]}
                labelFormatter={(label) => `Interval ${label}`}
              />

              <Line
                type="monotone"
                dataKey="requests"
                name="Requests"
                stroke="#38bdf8"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <p className="mt-3 text-xs text-zinc-500">
        Showing the latest {MAX_POINTS} samples. Polling interval: 1 second.
      </p>
    </section>
  );
}
