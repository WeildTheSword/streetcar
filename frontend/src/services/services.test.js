import { afterEach, describe, expect, test, vi } from "vitest";
import { ApiError, connection, fetchStudent, signIn } from "./api";
import { fetchCourses } from "./courseService";
import { deleteSubmission, fetchSubmissions } from "./submissionService";

const respond = (status, body) =>
  vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => (body === undefined ? Promise.reject(new Error("no body")) : Promise.resolve(body)),
  });
const unreachable = () => vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));

afterEach(() => vi.unstubAllGlobals());

describe("api.js through the HTTP client", () => {
  test("a reachable API marks the connection live and returns its data", async () => {
    // Arrange
    vi.stubGlobal("fetch", respond(200, { id: "morgan-thibodaux", onboarded: true }));

    // Act
    const student = await fetchStudent("morgan-thibodaux");

    // Assert
    expect(student.onboarded).toBe(true);
    expect(connection.live).toBe(true);
  });

  test("a rejection from the API is rethrown as ApiError, not hidden by the fallback", async () => {
    // Arrange
    vi.stubGlobal("fetch", respond(401));

    // Act
    const error = await signIn("morgan@tulane.edu", "wrong").catch((caught) => caught);

    // Assert
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(401);
  });

  test("an unreachable API falls back to the local fixtures and marks the connection offline", async () => {
    // Arrange
    vi.stubGlobal("fetch", unreachable());

    // Act
    const session = await signIn("morgan@tulane.edu", "streetcar");

    // Assert
    expect(session.profileId).toBe("morgan-thibodaux");
    expect(connection.live).toBe(false);
  });
});

describe("submissionService through the HTTP client", () => {
  test("an unreachable API gives a readable message", async () => {
    // Arrange
    vi.stubGlobal("fetch", unreachable());

    // Act + Assert
    await expect(fetchSubmissions()).rejects.toThrow("Unable to reach the server.");
  });

  test("an API error passes the server's message through", async () => {
    // Arrange
    vi.stubGlobal("fetch", respond(404, { message: "Submission not found." }));

    // Act + Assert
    await expect(deleteSubmission(9)).rejects.toThrow("Submission not found.");
  });

  test("an API error with no message falls back to a generic one", async () => {
    // Arrange
    vi.stubGlobal("fetch", respond(500));

    // Act + Assert
    await expect(fetchSubmissions()).rejects.toThrow("Unable to access submissions. Please try again.");
  });
});

describe("courseService through the HTTP client", () => {
  test("returns the course list", async () => {
    // Arrange
    vi.stubGlobal("fetch", respond(200, [{ id: 1, code: "CMPS 1500" }]));

    // Act
    const courses = await fetchCourses();

    // Assert
    expect(courses).toEqual([{ id: 1, code: "CMPS 1500" }]);
  });

  test("an API error becomes the existing 'Failed to fetch courses' message", async () => {
    // Arrange
    vi.stubGlobal("fetch", respond(500));

    // Act + Assert
    await expect(fetchCourses()).rejects.toThrow("Failed to fetch courses");
  });
});
