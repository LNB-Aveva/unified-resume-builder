import { test, expect } from "@playwright/test";

test.describe("Landing page smoke", () => {
  test("renders hero and navigation", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("nav")).toBeVisible();
  });

  test("renders footer", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("footer")).toBeVisible();
  });

  test("keyword analyzer page loads", async ({ page }) => {
    await page.goto("/keyword-analyzer");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("textarea")).toBeVisible();
  });

  test("ATS checker page loads", async ({ page }) => {
    await page.goto("/ats-checker");
    await expect(page.locator("h1")).toBeVisible();
  });

  test("blog index loads", async ({ page }) => {
    await page.goto("/blog");
    await expect(page.locator("h1")).toBeVisible();
  });

  test("privacy page loads", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page.locator("h1")).toBeVisible();
  });
});
