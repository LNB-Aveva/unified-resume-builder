import { test, expect } from "@playwright/test";

const MOCK_ANALYZE_RESPONSE = {
  job_title: "Senior Software Engineer",
  company: "CloudScale Inc.",
  hard_skills: ["Python", "Go", "AWS"],
  soft_skills: ["communication"],
  required_experience: "5+ years",
  keywords: ["Python", "Go", "AWS", "CI/CD"],
  responsibilities: ["Design and implement backend services"],
};

// These assertions are meaningful on the "mobile" Playwright project (Pixel 7
// viewport, 412px). They also run on desktop chromium as a regression guard.
test.describe("Mobile layout & flows", () => {
  test("landing page has no horizontal overflow", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();
    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    expect(overflows).toBe(false);
  });

  test("keyword analyzer is usable and results render on small screens", async ({ page }) => {
    await page.route("**/api/v1/analyze", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_ANALYZE_RESPONSE),
      }),
    );

    await page.goto("/keyword-analyzer");
    const textarea = page.locator('textarea[aria-label="Job description text"]');
    await expect(textarea).toBeVisible();

    await textarea.fill("Senior Software Engineer - requires Python, AWS");
    const submit = page.locator("button", { hasText: /extract|analyze/i });

    // Primary action must meet a ~44px touch-target height on mobile.
    const box = await submit.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThanOrEqual(40);

    await submit.click();
    await expect(page.getByText("Python", { exact: true })).toBeVisible({ timeout: 10_000 });

    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    expect(overflows).toBe(false);
  });

  test("protected route still redirects to sign-in on mobile", async ({ page }) => {
    await page.goto("/tools");
    await page.waitForURL(/\/sign-in/, { timeout: 10_000 });
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("sign-in form fields are reachable on small screens", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    expect(overflows).toBe(false);
  });
});
