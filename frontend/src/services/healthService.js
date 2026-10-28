
import { getToken } from "./authService";

const GATEWAY_URL = "http://localhost:8080";

export async function checkServices() {
  const token = getToken();

  let response;

  try {
    response = await fetch(`${GATEWAY_URL}/service-health`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  } catch {
    throw new Error("Cannot connect to the API Gateway.");
  }

  if (!response.ok) {
    throw new Error(`Health check failed: HTTP ${response.status}`);
  }

  try {
    return await response.json();
  } catch {
    throw new Error("The health endpoint returned an invalid JSON response.");
  }
}

// Compatibility export for components using the previous function name.
export async function fetchServiceHealth() {
  return checkServices();
}
