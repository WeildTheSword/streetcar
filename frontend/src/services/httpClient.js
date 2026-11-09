// The one place the frontend talks to `fetch`. Every service module calls
// `request` instead, so the API address, JSON encoding and response parsing
// live here and nowhere else.
//
// The base URL comes from VITE_API_URL and falls back to localhost:8080, which
// must stay in sync with backend/.../config/CorsConfig.java.
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

/** The API answered, but with an error status. `body` is its JSON, or {} if it had none. */
export class HttpError extends Error {
  constructor(status, body) {
    super(`Request failed: ${status}`);
    this.status = status;
    this.body = body;
  }
}

/** The API could not be reached at all. */
export class NetworkError extends Error {
  constructor(cause) {
    super("Unable to reach the server.");
    this.cause = cause;
  }
}

// The signed-in user's JWT. AuthProvider sets it on sign-in and clears it on
// sign-out, so every request below carries it without each service asking.
let authToken = null;

/** Sets the token sent as `Authorization: Bearer`, or stops sending one when given null. */
export function setAuthToken(token) {
  authToken = token || null;
}

function headersFor(hasBody) {
  const headers = {};
  if (hasBody) headers["Content-Type"] = "application/json";
  if (authToken) headers.Authorization = `Bearer ${authToken}`;
  return Object.keys(headers).length > 0 ? headers : undefined;
}

/**
 * Sends a request to the API and returns its parsed JSON, or null for 204.
 * `body`, when given, is sent as JSON. The signed-in user's token, if any, is
 * attached as a Bearer header.
 */
export async function request(path, { method = "GET", body } = {}) {
  const hasBody = body !== undefined;
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: headersFor(hasBody),
      body: hasBody ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    throw new NetworkError(error);
  }
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new HttpError(response.status, errorBody);
  }
  return response.status === 204 ? null : response.json();
}
