
import { getToken } from "./authService";

const GATEWAY_URL = "http://localhost:8080";

export async function fetchOrders() {
  const token = getToken();

  if (!token) {
    throw new Error("Please log in to view orders.");
  }

  let response;

  try {
    response = await fetch(`${GATEWAY_URL}/api/orders`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    throw new Error("Cannot connect to the API Gateway.");
  }

  if (response.status === 401) {
    throw new Error("Authentication failed. Please log in again.");
  }

  if (response.status === 403) {
    throw new Error("You do not have permission to view orders.");
  }

  if (response.status === 429) {
    throw new Error("Rate limit exceeded. Wait before trying again.");
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch orders: HTTP ${response.status}`);
  }

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error("The Order Service returned an invalid JSON response.");
  }

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.content)) {
    return data.content;
  }

  throw new Error("Unexpected order response format.");
}
