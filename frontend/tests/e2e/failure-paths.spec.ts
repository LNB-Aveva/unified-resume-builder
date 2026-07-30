import { test, expect } from "@playwright/test";

test.describe("Keyword Analyzer — validation errors", () => {
  test("empty submission shows validation error", async ({ page }) => {
    await page.goto("/keyword-analyzer");
    await page.locator("button", { hasText: /extract|analyze/i }).click();
    await expect(page.locator("text=Please paste a job description")).toBeVisible();
  });

  test("whitespace-only submission shows validation error", async ({ page }) => {
    await page.goto("/keyword-analyzer");
    const textarea = page.locator('textarea[aria-label="Job description text"]');
    await textarea.fill("   ");
    await page.locator("button", { hasText: /extract|analyze/i }).click();
    await expect(page.locator("text=Please paste a job description")).toBeVisible();
  });
});

test.describe("Keyword Analyzer — API errors", () => {
  test("429 rate limit shows error message", async ({ page }) => {
    await page.route("**/api/v1/analyze", (route) =>
      route.fulfill({
        status: 429,
        contentType: "application/json",
        body: JSON.stringify({ detail: "Rate limit exceeded" }),
      }),
    );

    await page.goto("/keyword-analyzer");
    await page.locator('textarea[aria-label="Job description text"]').fill("Test job description");
    await page.locator("button", { hasText: /extract|analyze/i }).click();

    await expect(page.locator('[class*="red"], [class*="error"]').first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test("500 server error shows error message", async ({ page }) => {
    await page.route("**/api/v1/analyze", (route) =>
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ detail: "Internal server error" }),
      }),
    );

    await page.goto("/keyword-analyzer");
    await page.locator('textarea[aria-label="Job description text"]').fill("Test job description");
    await page.locator("button", { hasText: /extract|analyze/i }).click();

    await expect(page.locator("text=/server|error|wrong/i").first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test("network failure shows connection error", async ({ page }) => {
    await page.route("**/api/v1/analyze", (route) => route.abort("connectionrefused"));

    await page.goto("/keyword-analyzer");
    await page.locator('textarea[aria-label="Job description text"]').fill("Test job description");
    await page.locator("button", { hasText: /extract|analyze/i }).click();

    await expect(
      page.locator("text=/could not reach|try again|waking up|went wrong/i").first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("slow response keeps loading state visible", async ({ page }) => {
    await page.route("**/api/v1/analyze", async (route) => {
      await new Promise((r) => setTimeout(r, 5_000));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          job_title: "Engineer",
          company: null,
          hard_skills: ["Python"],
          soft_skills: [],
          required_experience: null,
          keywords: ["Python"],
          responsibilities: [],
        }),
      });
    });

    await page.goto("/keyword-analyzer");
    await page.locator('textarea[aria-label="Job description text"]').fill("Test job description");
    await page.locator("button", { hasText: /extract|analyze/i }).click();

    await expect(page.locator("text=/analyzing/i")).toBeVisible({ timeout: 3_000 });
    await expect(page.getByText("Python", { exact: true })).toBeVisible({ timeout: 15_000 });
  });
});

test.describe("404 handling", () => {
  test("non-existent page returns 404 or redirects", async ({ page }) => {
    const response = await page.goto("/this-page-does-not-exist-xyz");
    expect(response).not.toBeNull();
    const status = response!.status();
    expect([200, 404]).toContain(status);
  });
});
