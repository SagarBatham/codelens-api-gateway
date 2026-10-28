
import { getToken } from "./authService";

const GATEWAY_URL = "http://localhost:8080";

export async function fetchProducts() {
  const token = getToken();

  if (!token) {
    throw new Error("Please sign in to view products.");
  }

  let response;

  try {
    response = await fetch(`${GATEWAY_URL}/api/products`, {
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
    throw new Error("Authentication failed. Please sign in again.");
  }

  if (response.status === 403) {
    throw new Error("You do not have permission to view products.");
  }

  if (response.status === 429) {
    throw new Error("Rate limit exceeded. Wait before trying again.");
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch products: HTTP ${response.status}`);
  }

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error("The Product Service returned an invalid JSON response.");
  }

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.content)) {
    return data.content;
  }

  throw new Error("Unexpected product response format.");
}
