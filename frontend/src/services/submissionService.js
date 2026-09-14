const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

async function request(options) {
  const response = await fetch(`${API_URL}/submissions`, options);
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Unable to access submissions. Please try again.");
  }
  return response.json();
}

export const fetchSubmissions = () => request();
export const createSubmission = (record) => request({
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(record),
});
