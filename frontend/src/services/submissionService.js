import { HttpError, NetworkError, request } from "./httpClient";

const UNREACHABLE = "Unable to reach the server. Check that the API is running and try again.";

// Turns the client's errors into messages a user can read. fetch's own text
// ("Failed to fetch") is not one of them.
async function call(path, options) {
  try {
    return await request(`/submissions${path}`, options);
  } catch (error) {
    if (error instanceof NetworkError) {
      throw new Error(UNREACHABLE);
    }
    if (error instanceof HttpError) {
      throw new Error(error.body.message || "Unable to access submissions. Please try again.");
    }
    throw error;
  }
}

export const fetchSubmissions = () => call("");
export const createSubmission = (record) => call("", { method: "POST", body: record });
export const updateSubmission = (id, record) => call(`/${id}`, { method: "PUT", body: record });
export const deleteSubmission = (id) => call(`/${id}`, { method: "DELETE" });
