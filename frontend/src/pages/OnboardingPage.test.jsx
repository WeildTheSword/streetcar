import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { OnboardingPage } from "./OnboardingPage";
import { fetchStudent } from "@/services/api";

const navigate = vi.fn();
const finishOnboarding = vi.fn();

vi.mock("@/services/api");
vi.mock("@/auth/useAuth", () => ({
  useAuth: () => ({
    session: { profileId: "s1", displayName: "Morgan Avery" },
    finishOnboarding,
  }),
}));
vi.mock("react-router-dom", () => ({ useNavigate: () => navigate }));
// The walkthrough overlay is its own component with its own timers; it is not under test here.
vi.mock("@/components/DemoGuide", () => ({ DemoGuide: () => null }));

const STUDENT = {
  name: "Morgan Avery",
  targetRole: "Investment Banker",
  transcript: [
    { term: "Fall '23", code: "ACCN 2010", title: "Financial Accounting", credits: 3, grade: "A" },
    { term: "Fall '23", code: "CMPS 1500", title: "Intro to Computer Science", credits: 4, grade: "A-" },
    { term: "Spring '24", code: "FINE 3010", title: "Financial Management", credits: 3, grade: "A" },
  ],
};

const ROW_MS = 130;
const STAGE_MS = 850;

/** Advance fake time inside act so React flushes each timer-driven update. */
async function advance(ms) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}

/**
 * Advance one timer tick at a time. Each reveal step schedules the next one from an
 * effect, and React only flushes effects when act() exits, so one long advance would
 * fire just the first tick.
 */
async function tick(ms, times) {
  for (let i = 0; i < times; i += 1) {
    await advance(ms);
  }
}

/** Render on fake timers and let the fetched student settle into state. */
async function renderSettled() {
  vi.useFakeTimers();
  render(<OnboardingPage />);
  await advance(0);
}

describe("OnboardingPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    fetchStudent.mockResolvedValue(STUDENT);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("renders the profile step with the Splash ID prefilled and the pull button", async () => {
    // Arrange
    render(<OnboardingPage />);

    // Act — nothing to act on; this checks what rendered
    // Assert
    expect(
      await screen.findByRole("heading", { name: "Load your student profile" }),
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue("425006469")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Pull my transcript" })).toBeInTheDocument();
    expect(fetchStudent).toHaveBeenCalledWith("s1");
  });

  test("pulling the transcript streams the first row in and keeps the scan locked", async () => {
    // Arrange
    await renderSettled();

    // Act
    fireEvent.click(screen.getByRole("button", { name: "Pull my transcript" }));
    await advance(ROW_MS);

    // Assert
    expect(screen.getByText("ACCN 2010")).toBeInTheDocument();
    expect(screen.queryByText("FINE 3010")).not.toBeInTheDocument();
    expect(screen.getByText("Reading your record…")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reading your record" })).toBeDisabled();
  });

  test("once every row has streamed in, the credits are totalled and the scan unlocks", async () => {
    // Arrange
    await renderSettled();

    // Act
    fireEvent.click(screen.getByRole("button", { name: "Pull my transcript" }));
    await tick(ROW_MS, STUDENT.transcript.length);

    // Assert
    expect(screen.getByText("FINE 3010")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.queryByText("Reading your record…")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Build my fingerprint" })).toBeEnabled();
  });

  test("building the fingerprint runs every scan stage, then reveals the path", async () => {
    // Arrange
    await renderSettled();
    fireEvent.click(screen.getByRole("button", { name: "Pull my transcript" }));
    await tick(ROW_MS, STUDENT.transcript.length);

    // Act
    fireEvent.click(screen.getByRole("button", { name: "Build my fingerprint" }));
    await tick(STAGE_MS, 4);

    // Assert
    expect(screen.getByText("Fingerprint complete")).toBeInTheDocument();
    expect(screen.getByText("Investment Banker")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continue to my path" })).toBeInTheDocument();
  });

  test("the scan is still running one stage short of the end", async () => {
    // Arrange
    await renderSettled();
    fireEvent.click(screen.getByRole("button", { name: "Pull my transcript" }));
    await tick(ROW_MS, STUDENT.transcript.length);

    // Act
    fireEvent.click(screen.getByRole("button", { name: "Build my fingerprint" }));
    await tick(STAGE_MS, 3);

    // Assert
    expect(screen.getByText("Building your fingerprint")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Continue to my path" })).not.toBeInTheDocument();
  });
});
