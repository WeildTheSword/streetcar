const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

async function request(path = "", options) {
  const response = await fetch(`${API_URL}/submissions${path}`, options);
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Unable to access submissions. Please try again.");
  }
  // DELETE answers 204 No Content, so there is no body to parse
  return response.status === 204 ? null : response.json();
}

const withBody = (method, record) => ({
  method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(record),
});

export const fetchSubmissions = () => request();
export const createSubmission = (record) => request("", withBody("POST", record));
export const updateSubmission = (id, record) => request(`/${id}`, withBody("PUT", record));
export const deleteSubmission = (id) => request(`/${id}`, { method: "DELETE" });
