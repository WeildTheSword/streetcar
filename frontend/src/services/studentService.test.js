import { afterEach, describe, expect, test, vi } from "vitest";
import {
  createApplication,
  deleteApplication,
  fetchApplications,
  fetchMyAlumni,
  fetchMyAppointments,
  fetchResume,
  fetchSummary,
  saveResume,
  startConversation,
  updateApplication,
} from "./studentService";
import {
  fetchHiringTrends,
  fetchLogs,
  fetchOutcomes,
  fetchPerformance,
  fetchStudentReports,
} from "./advisorService";

const respond = (status, body) =>
  vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => (body === undefined ? Promise.reject(new Error("no body")) : Promise.resolve(body)),
  });
const unreachable = () => vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));

const sent = (fetchMock) => {
  const [url, init] = fetchMock.mock.calls[0];
  return { path: new URL(url).pathname, method: init.method, body: init.body && JSON.parse(init.body) };
};

afterEach(() => vi.unstubAllGlobals());

describe("studentService through the HTTP client", () => {
  test.each([
    ["fetchSummary", fetchSummary, [], "GET", "/me/summary", undefined],
    ["fetchMyAppointments", fetchMyAppointments, [], "GET", "/me/appointments", undefined],
    ["fetchMyAlumni", fetchMyAlumni, [], "GET", "/me/alumni", undefined],
    ["startConversation", startConversation, [11, "Hello"], "POST", "/me/alumni/11/conversations", { message: "Hello" }],
    ["fetchApplications", fetchApplications, [], "GET", "/me/applications", undefined],
    ["createApplication", createApplication, [{ company: "Lazard" }], "POST", "/me/applications", { company: "Lazard" }],
    ["updateApplication", updateApplication, [4, { company: "Lazard" }], "PUT", "/me/applications/4", { company: "Lazard" }],
    ["deleteApplication", deleteApplication, [4], "DELETE", "/me/applications/4", undefined],
    ["fetchResume", fetchResume, [], "GET", "/me/resume", undefined],
    ["saveResume", saveResume, [{ headline: "Hi" }], "PUT", "/me/resume", { headline: "Hi" }],
  ])("%s calls %s %s", async (_name, fn, args, method, path, body) => {
    // Arrange
    const fetchMock = respond(200, { ok: true });
    vi.stubGlobal("fetch", fetchMock);

    // Act
    const result = await fn(...args);

    // Assert
    expect(result).toEqual({ ok: true });
    expect(sent(fetchMock)).toEqual({ path, method, body });
  });

  test("a conflict passes the server's message through", async () => {
    // Arrange
    vi.stubGlobal("fetch", respond(409, { message: "You are already talking to Sarah Kim." }));

    // Act + Assert
    await expect(startConversation(10, "Hi")).rejects.toThrow("You are already talking to Sarah Kim.");
  });

  test("an error with no message falls back to a generic one", async () => {
    // Arrange
    vi.stubGlobal("fetch", respond(500));

    // Act + Assert
    await expect(saveResume({})).rejects.toThrow("Unable to save your resume. Please try again.");
  });

  test("an unreachable API gives a readable message", async () => {
    // Arrange
    vi.stubGlobal("fetch", unreachable());

    // Act + Assert
    await expect(fetchApplications()).rejects.toThrow("Unable to reach the server.");
  });

  test("a delete's 204 resolves to null", async () => {
    // Arrange
    vi.stubGlobal("fetch", respond(204));

    // Act
    const result = await deleteApplication(4);

    // Assert
    expect(result).toBeNull();
  });
});

describe("advisorService insight endpoints through the HTTP client", () => {
  test.each([
    ["fetchHiringTrends", fetchHiringTrends, "/advisor/insights/hiring"],
    ["fetchPerformance", fetchPerformance, "/advisor/insights/performance"],
    ["fetchOutcomes", fetchOutcomes, "/advisor/insights/outcomes"],
    ["fetchStudentReports", fetchStudentReports, "/advisor/reports/students"],
    ["fetchLogs", fetchLogs, "/advisor/logs"],
  ])("%s reads %s", async (_name, fn, path) => {
    // Arrange
    const fetchMock = respond(200, []);
    vi.stubGlobal("fetch", fetchMock);

    // Act
    const result = await fn();

    // Assert
    expect(result).toEqual([]);
    expect(sent(fetchMock)).toEqual({ path, method: "GET", body: undefined });
  });

  test("a forbidden response passes the server's message through", async () => {
    // Arrange
    vi.stubGlobal("fetch", respond(403, { message: "Forbidden" }));

    // Act + Assert
    await expect(fetchLogs()).rejects.toThrow("Forbidden");
  });

  test("an error with no message falls back to a generic one", async () => {
    // Arrange
    vi.stubGlobal("fetch", respond(500));

    // Act + Assert
    await expect(fetchOutcomes()).rejects.toThrow("Unable to load outcomes. Please try again.");
  });
});
