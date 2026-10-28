
import { getToken } from "./authService";

const GATEWAY_URL = "http://localhost:8080";

async function fetchDashboardEndpoint(endpoint) {
  const token = getToken();

  if (!token) {
    throw new Error("Please sign in to view metrics.");
  }

  const response = await fetch(`${GATEWAY_URL}${endpoint}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch metrics: HTTP ${response.status}`
    );
  }

  return response.json();
}

export async function fetchRateLimiterMetrics() {
  const data = await fetchDashboardEndpoint(
    "/dashboard/metrics"
  );

  return {
    total: Number(data.totalRequests ?? 0),
    allowed: Number(data.allowedRequests ?? 0),
    rejected: Number(data.rejectedRequests ?? 0),
  };
}

export async function fetchLatencyMetrics() {
  const data = await fetchDashboardEndpoint(
    "/dashboard/latency"
  );

  return {
    averageLatencyMs: Number(
      data.averageLatencyMs ?? 0
    ),
    p95LatencyMs: Number(
      data.p95LatencyMs ?? 0
    ),
    requestsPerSecond: Number(
      data.requestsPerSecond ?? 0
    ),
  };
}
