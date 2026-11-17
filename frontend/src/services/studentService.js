import { HttpError, NetworkError, request } from "./httpClient";

const UNREACHABLE = "Unable to reach the server. Check that the API is running and try again.";

// Turns the client's errors into messages a user can read, as advisorService does.
async function call(path, options, fallbackMessage) {
  try {
    return await request(path, options);
  } catch (error) {
    if (error instanceof NetworkError) {
      throw new Error(UNREACHABLE);
    }
    if (error instanceof HttpError) {
      throw new Error(error.body.message || fallbackMessage);
    }
    throw error;
  }
}

/** The sidebar counts: alumni conversations, upcoming appointments and tracked applications. */
export const fetchSummary = () =>
  call("/me/summary", undefined, "Unable to load your summary. Please try again.");

/** The signed-in student's appointments, oldest first. */
export const fetchMyAppointments = () =>
  call("/me/appointments", undefined, "Unable to load your appointments. Please try again.");

/** Every alumni account, with where this student stands with each. */
export const fetchMyAlumni = () =>
  call("/me/alumni", undefined, "Unable to load alumni. Please try again.");

/** Opens a conversation with one alum. Resolves to that alum's updated row. */
export const startConversation = (alumId, message) =>
  call(`/me/alumni/${alumId}/conversations`, { method: "POST", body: { message } },
    "Unable to send that message. Please try again.");

/** The student's tracked job applications, most recently applied first. */
export const fetchApplications = () =>
  call("/me/applications", undefined, "Unable to load your applications. Please try again.");

export const createApplication = (application) =>
  call("/me/applications", { method: "POST", body: application },
    "Unable to save that application. Please try again.");

export const updateApplication = (id, application) =>
  call(`/me/applications/${id}`, { method: "PUT", body: application },
    "Unable to save that application. Please try again.");

export const deleteApplication = (id) =>
  call(`/me/applications/${id}`, { method: "DELETE" },
    "Unable to delete that application. Please try again.");

/** The student's resume. A student with none gets blank fields and a null updatedAt. */
export const fetchResume = () =>
  call("/me/resume", undefined, "Unable to load your resume. Please try again.");

export const saveResume = (resume) =>
  call("/me/resume", { method: "PUT", body: resume }, "Unable to save your resume. Please try again.");
