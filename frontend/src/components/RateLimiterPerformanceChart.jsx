
import { useEffect, useRef, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

import { fetchRateLimiterMetrics } from "../services/metricsService";

const HISTORY_KEY = "codelens-rate-limiter-history";
const LAST_COUNTERS_KEY = "codelens-rate-limiter-last-counters";
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

function readLastCounters() {
  try {
    const saved = sessionStorage.getItem(LAST_COUNTERS_KEY);

    if (!saved) return null;

    const parsed = JSON.parse(saved);

    if (
      !parsed ||
      !Number.isFinite(Number(parsed.allowed)) ||
      !Number.isFinite(Number(parsed.rejected))
    ) {
      return null;
    }

    return {
      allowed: Number(parsed.allowed),
      rejected: Number(parsed.rejected),
    };
  } catch {
    return null;
  }
}

export default function RateLimiterPerformanceChart() {
  const [history, setHistory] = useState(readHistory);
  const [hasError, setHasError] = useState(false);

  const previousCounters = useRef(readLastCounters());

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

        const current = {
          allowed: Number(metrics.allowed),
          rejected: Number(metrics.rejected),
        };

        if (
          !Number.isFinite(current.allowed) ||
          !Number.isFinite(current.rejected)
        ) {
          return;
        }

        const previous = previousCounters.current;

        function getDelta(now, before) {
          if (before === null || before === undefined) {
            return 0;
          }

          return now >= before ? now - before : now;
        }

        const allowedRequests = getDelta(
          current.allowed,
          previous?.allowed
        );

        const rejectedRequests = getDelta(
          current.rejected,
          previous?.rejected
        );

        previousCounters.current = current;

        try {
          sessionStorage.setItem(
            LAST_COUNTERS_KEY,
            JSON.stringify(current)
          );
        } catch {
          // Continue without session storage.
        }

        setHistory((oldHistory) => {
          const updatedHistory = [
            ...oldHistory,
            {
              event: nextEvent.current++,
              allowed: allowedRequests,
              rejected: rejectedRequests,
            },
          ].slice(-MAX_POINTS);

          try {
            sessionStorage.setItem(
              HISTORY_KEY,
              JSON.stringify(updatedHistory)
            );
          } catch {
            // Keep displaying the chart if storage is unavailable.
          }

          return updatedHistory;
        });

        setHasError(false);
      } catch (error) {
        if (mounted) {
          setHasError(true);
        }

        console.error(
          "Failed to fetch rate limiter metrics:",
          error
        );
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
    ...history.map((point) =>
      Math.max(point.allowed || 0, point.rejected || 0)
    )
  );

  return (
    <section className="rounded-2xl border border-white/[0.08] bg-[#111113] p-5">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-white">
            Rate Limiter Performance
          </h3>

          <p className="mt-1 text-xs text-zinc-500">
            Allowed vs. rejected requests per interval
          </p>
        </div>

        <span className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-300">
          <span
            className={`h-2 w-2 rounded-full ${
              hasError ? "bg-rose-400" : "bg-emerald-400"
            }`}
          />
          {hasError ? "Connection issue" : "Live"}
        </span>
      </div>

      <div className="h-56 w-full">
        {history.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-zinc-500">
            Waiting for rate limiter data...
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
                labelFormatter={(label) => `Interval ${label}`}
              />

              <Legend
                wrapperStyle={{
                  fontSize: "12px",
                  paddingTop: "8px",
                }}
              />

              <Line
                type="monotone"
                dataKey="allowed"
                name="Allowed"
                stroke="#34d399"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5 }}
                isAnimationActive={false}
              />

              <Line
                type="monotone"
                dataKey="rejected"
                name="Rejected"
                stroke="#fb7185"
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
        Latest {MAX_POINTS} samples · Refreshes every second
      </p>
    </section>
  );
}
