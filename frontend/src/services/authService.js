
const GATEWAY_URL = "http://localhost:8080";
const TOKEN_KEY = "codelens_token";

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message ||
        data.error ||
        `Request failed with HTTP ${response.status}`
    );
  }

  return data;
}

async function sendAuthRequest(endpoint, credentials) {
  let response;

  try {
    response = await fetch(`${GATEWAY_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(credentials),
    });
  } catch {
    throw new Error("Cannot connect to the API Gateway.");
  }

  return handleResponse(response);
}

export async function registerUser(credentials) {
  return sendAuthRequest("/api/users", credentials);
}

export async function loginUser(credentials) {
  const data = await sendAuthRequest("/api/users/login", credentials);

  if (typeof data.token !== "string" || !data.token.trim()) {
    throw new Error(
      "Login response does not contain a valid token field."
    );
  }

  try {
    localStorage.setItem(TOKEN_KEY, data.token);
  } catch {
    throw new Error(
      "Unable to save your login session. Check your browser storage settings."
    );
  }

  return data;
}

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function logoutUser() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Storage may be unavailable in restricted browser environments.
  }
}
