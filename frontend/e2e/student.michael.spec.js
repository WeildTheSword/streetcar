import { expect, test } from "@playwright/test";

/**
 * Student flows, end to end against the real API (SCRUM-108).
 *
 * One thing about the backend shapes these tests. Onboarding is not stored per
 * account: DemoSessionState remembers it per fixture profile, in memory, and
 * every student account wears the same "morgan-thibodaux" profile. So whether a
 * student lands on /onboarding or /student after signing in depends on whether
 * any student has finished onboarding since the backend started. The tests read
 * the sign-in response for that flag rather than assume either answer, which is
 * what lets them pass on a fresh backend and again on the same one.
 */

const DEMO_STUDENT = { email: "morgan@tulane.edu", password: "streetcar" };

/** A value no earlier run can have left behind. */
function unique(label) {
  return `${label} ${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

/** Opens sign-in and walks past the role chooser to the student sign-up form. */
async function openStudentDoor(page) {
  await page.goto("/sign-in");
  await page.getByRole("button", { name: /^Student/ }).click();
  await expect(page.getByRole("heading", { name: "Create your account" })).toBeVisible();
}

/** Opens the student sign-in form, reached through the sign-up form's switch link. */
async function openStudentSignIn(page) {
  await openStudentDoor(page);
  await page.getByRole("button", { name: "Already have an account? Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
}

/**
 * Submits the demo student's credentials on the open sign-in form and returns
 * the API's sign-in response, so a caller can tell where the app should route.
 */
async function submitDemoStudentSignIn(page) {
  await page.getByLabel("Email").fill(DEMO_STUDENT.email);
  await page.getByLabel("Password").fill(DEMO_STUDENT.password);
  const signInResponse = page.waitForResponse(
    (response) => response.url().endsWith("/auth/login") && response.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Sign in", exact: true }).click();

  const response = await signInResponse;
  expect(response.status()).toBe(200);
  return response.json();
}

/**
 * Drives the three onboarding phases the way a student does. "Pull my
 * transcript" does not finish onboarding on its own: it opens the transcript
 * phase, whose "Build my fingerprint" button unlocks once every row has
 * streamed in, and the scan then offers "Continue to my path".
 */
async function completeOnboarding(page) {
  await expect(page).toHaveURL(/\/onboarding$/);
  await page.getByRole("button", { name: "Pull my transcript" }).click();

  await expect(page.getByText("What happens next")).toBeVisible();
  const build = page.getByRole("button", { name: "Build my fingerprint" });
  await expect(build).toBeEnabled({ timeout: 15_000 });
  await build.click();

  const proceed = page.getByRole("button", { name: "Continue to my path" });
  await expect(proceed).toBeVisible({ timeout: 15_000 });
  await proceed.click();
}

test.describe("student flows", () => {
  test("the demo student signs in and lands on their own side", async ({ page }) => {
    // Arrange
    await openStudentSignIn(page);

    // Act
    const session = await submitDemoStudentSignIn(page);

    // Assert
    // A student who has not finished onboarding is routed to /onboarding first.
    // On a fresh backend that is Morgan; once any student has onboarded, it is
    // /student. The response says which applies, so the test holds either way.
    expect(session.role).toBe("STUDENT");
    if (session.onboarded) {
      await expect(page).toHaveURL(/\/student$/);
      await expect(page.getByRole("heading", { name: "My Path" })).toBeVisible();
    } else {
      await expect(page).toHaveURL(/\/onboarding$/);
      await expect(page.getByRole("heading", { name: "Load your student profile" })).toBeVisible();
    }
  });

  test("a new student signs up, completes onboarding, and reaches the dashboard", async ({ page }) => {
    // Arrange
    const stamp = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const email = `e2e.student.${stamp}@tulane.edu`;
    const password = "streetcar-e2e";
    await openStudentDoor(page);

    // Act
    await page.getByLabel("Full name").fill("Riley Playwright");
    await page.getByLabel("Tulane email").fill(email);
    await page.getByLabel("Password", { exact: true }).fill(password);
    await page.getByLabel("Confirm").fill(password);
    await page.getByRole("button", { name: "Create account" }).click();

    // The welcome splash moves on by itself to onboarding.
    await expect(page.getByRole("heading", { name: "Load your student profile" })).toBeVisible({
      timeout: 15_000,
    });
    await completeOnboarding(page);

    // Assert
    await expect(page).toHaveURL(/\/student$/);
    await expect(page.getByRole("heading", { name: "My Path" })).toBeVisible();
  });

  test("a student creates an academic profile, edits it, and sees the change", async ({ page }) => {
    // Arrange
    await openStudentSignIn(page);
    const session = await submitDemoStudentSignIn(page);
    if (!session.onboarded) {
      // /profiles sits behind the onboarding gate, so a fresh backend needs this once.
      await completeOnboarding(page);
    }
    await expect(page).toHaveURL(/\/student$/);
    await page.goto("/profiles");
    await expect(page.getByRole("heading", { name: "Academic Profile" })).toBeVisible();

    const major = unique("E2E Major");
    const firstGoal = unique("E2E Goal");
    const editedGoal = unique("E2E Edited Goal");
    const createForm = page.locator("form").filter({ has: page.getByRole("button", { name: "Save profile" }) });

    // Act
    await createForm.getByLabel("GPA (0–4)").fill("3.42");
    await createForm.getByLabel("Completed courses (or None)").fill("CMPS 1500, CMPS 2200");
    await createForm.getByLabel("Major").fill(major);
    await createForm.getByLabel("Career goal").fill(firstGoal);
    await createForm.getByRole("button", { name: "Save profile" }).click();
    await expect(page.getByRole("status").filter({ hasText: "Academic profile saved." })).toBeVisible();

    const created = page.getByRole("listitem").filter({ hasText: `${major} — ${firstGoal}` });
    await expect(created).toBeVisible();
    await created.getByRole("button", { name: "Edit" }).click();

    const editing = page.getByRole("listitem").filter({ has: page.getByRole("group", { name: "Edit profile" }) });
    await editing.getByLabel("Career goal").fill(editedGoal);
    await editing.getByLabel("GPA (0–4)").fill("3.71");
    await editing.getByRole("button", { name: "Save changes" }).click();

    // Assert
    const updated = page.getByRole("listitem").filter({ hasText: `${major} — ${editedGoal}` });
    await expect(updated).toBeVisible();
    await expect(updated).toContainText("GPA: 3.71");
    await expect(page.getByText(`${major} — ${firstGoal}`)).toHaveCount(0);

    // The edit reached the API, not only the list in memory.
    await page.reload();
    await expect(page.getByRole("listitem").filter({ hasText: `${major} — ${editedGoal}` })).toBeVisible();
  });
});
