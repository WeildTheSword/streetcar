import { HttpError, NetworkError, request } from "./httpClient";

const UNREACHABLE = "Unable to reach the server. Check that the API is running and try again.";

// Turns the client's errors into messages a user can read, as submissionService does.
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

/** Every student account in the database, for the advisor's My Students list. */
export const fetchStudents = () =>
  call("/advisor/students", undefined, "Unable to load students. Please try again.");

/** One student's account, submissions, alumni conversations and appointments. */
export const fetchStudentAccount = (id) =>
  call(`/advisor/students/${id}`, undefined, "Unable to load that student. Please try again.");

/** The signed-in advisor's appointments, soonest first. */
export const fetchAppointments = () =>
  call("/advisor/appointments", undefined, "Unable to load appointments. Please try again.");

export const createAppointment = (appointment) =>
  call("/advisor/appointments", { method: "POST", body: appointment },
    "Unable to book that appointment. Please try again.");

export const cancelAppointment = (id) =>
  call(`/advisor/appointments/${id}`, { method: "DELETE" },
    "Unable to cancel that appointment. Please try again.");

/** Every alumni account in the database. */
export const fetchAlumni = () =>
  call("/advisor/alumni", undefined, "Unable to load alumni. Please try again.");

/** The signed-in user's own account, for any role. */
export const fetchAccount = () =>
  call("/account", undefined, "Unable to load your account. Please try again.");
