import { afterEach, describe, expect, test, vi } from "vitest";
import { API_URL, HttpError, NetworkError, request } from "./httpClient";

const respond = (status, body) =>
  vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => (body === undefined ? Promise.reject(new Error("no body")) : Promise.resolve(body)),
  });

describe("httpClient", () => {
  afterEach(() => vi.unstubAllGlobals());

  test("GET joins the path onto the one base URL and returns the parsed JSON", async () => {
    // Arrange
    const fetchMock = respond(200, [{ id: 1 }]);
    vi.stubGlobal("fetch", fetchMock);

    // Act
    const data = await request("/courses");

    // Assert
    expect(data).toEqual([{ id: 1 }]);
    expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/courses`, { method: "GET", headers: undefined, body: undefined });
  });

  test("a body is sent as JSON with the matching header", async () => {
    // Arrange
    const fetchMock = respond(201, { id: 2 });
    vi.stubGlobal("fetch", fetchMock);

    // Act
    await request("/submissions", { method: "POST", body: { major: "Finance" } });

    // Assert
    expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/submissions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ major: "Finance" }),
    });
  });

  test("204 No Content resolves to null without reading a body", async () => {
    // Arrange
    vi.stubGlobal("fetch", respond(204));

    // Act
    const data = await request("/submissions/3", { method: "DELETE" });

    // Assert
    expect(data).toBeNull();
  });

  test("a rejected request throws HttpError carrying the status and the error body", async () => {
    // Arrange
    vi.stubGlobal("fetch", respond(404, { message: "Submission not found." }));

    // Act
    const error = await request("/submissions/9").catch((caught) => caught);

    // Assert
    expect(error).toBeInstanceOf(HttpError);
    expect(error.status).toBe(404);
    expect(error.body).toEqual({ message: "Submission not found." });
  });

  test("a rejected request with no JSON body still throws HttpError, with an empty body", async () => {
    // Arrange
    vi.stubGlobal("fetch", respond(500));

    // Act
    const error = await request("/courses").catch((caught) => caught);

    // Assert
    expect(error).toBeInstanceOf(HttpError);
    expect(error.body).toEqual({});
  });

  test("an unreachable server throws NetworkError instead of fetch's TypeError", async () => {
    // Arrange
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

    // Act
    const error = await request("/courses").catch((caught) => caught);

    // Assert
    expect(error).toBeInstanceOf(NetworkError);
  });
});

describe("httpClient base URL", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  test("uses VITE_API_URL when it is set", async () => {
    // Arrange
    vi.stubEnv("VITE_API_URL", "http://api.example.test");
    vi.resetModules();

    // Act
    const { API_URL: configured } = await import("./httpClient");

    // Assert
    expect(configured).toBe("http://api.example.test");
  });

  test("falls back to localhost:8080 when VITE_API_URL is not set", async () => {
    // Arrange
    vi.stubEnv("VITE_API_URL", "");
    vi.resetModules();

    // Act
    const { API_URL: fallback } = await import("./httpClient");

    // Assert
    expect(fallback).toBe("http://localhost:8080");
  });
});
