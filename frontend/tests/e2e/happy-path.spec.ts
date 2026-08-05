import { test, expect } from "@playwright/test";

const MOCK_ANALYZE_RESPONSE = {
  job_title: "Senior Software Engineer",
  company: "CloudScale Inc.",
  hard_skills: ["Python", "Go", "AWS", "Docker", "Kubernetes", "PostgreSQL"],
  soft_skills: ["communication", "problem-solving", "mentoring"],
  required_experience: "5+ years",
  keywords: ["Python", "Go", "AWS", "Docker", "Kubernetes", "PostgreSQL", "CI/CD", "microservices"],
  responsibilities: ["Design and implement backend services", "Lead technical design reviews"],
};

test.describe("Landing page", () => {
  test("renders hero headline, nav, and primary CTA", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("nav")).toBeVisible();
    await expect(page.locator("footer")).toBeVisible();
    const cta = page.locator('a[href="/sign-up"], a[href="/keyword-analyzer"]').first();
    await expect(cta).toBeVisible();
  });

  test("nav links navigate to correct pages", async ({ page }) => {
    await page.goto("/");
    const blogLink = page.locator('nav a[href="/blog"]');
    if (await blogLink.isVisible()) {
      await blogLink.click();
      await expect(page).toHaveURL(/\/blog/);
    }
  });

  test("FAQ section renders with questions", async ({ page }) => {
    await page.goto("/");
    const faqHeadings = page.locator("h2, h3").filter({ hasText: /FAQ|question/i });
    if (await faqHeadings.count() > 0) {
      await expect(faqHeadings.first()).toBeVisible();
    }
  });
});

test.describe("Keyword Analyzer — happy path", () => {
  test("page loads with textarea and submit button", async ({ page }) => {
    await page.goto("/keyword-analyzer");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator('textarea[aria-label="Job description text"]')).toBeVisible();
    await expect(page.locator("button", { hasText: /extract|analyze/i })).toBeVisible();
  });

  test("Try Demo button fills the textarea", async ({ page }) => {
    await page.goto("/keyword-analyzer");
    const textarea = page.locator('textarea[aria-label="Job description text"]');
    await expect(textarea).toHaveValue("");
    const demoBtn = page.locator("button", { hasText: /try demo|try it/i });
    if (await demoBtn.isVisible()) {
      await demoBtn.click();
      await expect(textarea).not.toHaveValue("");
    }
  });

  test("submitting a job description shows extracted keywords", async ({ page }) => {
    await page.route("**/api/v1/analyze", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_ANALYZE_RESPONSE),
      }),
    );

    await page.goto("/keyword-analyzer");
    const textarea = page.locator('textarea[aria-label="Job description text"]');
    await textarea.fill("Senior Software Engineer - requires Python, AWS, Docker");
    await page.locator("button", { hasText: /extract|analyze/i }).click();

    await expect(page.getByText("Python", { exact: true })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("Senior Software Engineer").first()).toBeVisible();
  });
});

test.describe("ATS Checker page", () => {
  test("renders heading and FAQ content", async ({ page }) => {
    await page.goto("/ats-checker");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("text=What is an ATS score")).toBeVisible();
  });
});

test.describe("Blog", () => {
  test("index lists articles with links", async ({ page }) => {
    await page.goto("/blog");
    await expect(page.locator("h1")).toBeVisible();
    const articleLinks = page.locator('a[href*="/blog/"]');
    expect(await articleLinks.count()).toBeGreaterThanOrEqual(1);
  });

  test("article page renders content", async ({ page }) => {
    await page.goto("/blog");
    const firstLink = page.locator('a[href*="/blog/"]').first();
    const href = await firstLink.getAttribute("href");
    if (href) {
      await page.goto(href);
      await expect(page.locator("h1")).toBeVisible();
      await expect(page.locator("article, main, [role='main']").first()).toBeVisible();
    }
  });
});

test.describe("Legal pages", () => {
  test("privacy policy loads with required content", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("text=privacy").first()).toBeVisible();
  });

  test("terms page loads with required content", async ({ page }) => {
    await page.goto("/terms");
    await expect(page.locator("h1")).toBeVisible();
  });
});

test.describe("Auth redirect", () => {
  test("accessing /tools without auth redirects to /sign-in", async ({ page }) => {
    await page.goto("/tools");
    await page.waitForURL(/\/sign-in/, { timeout: 10_000 });
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("accessing /account without auth redirects to /sign-in", async ({ page }) => {
    await page.goto("/account");
    await page.waitForURL(/\/sign-in/, { timeout: 10_000 });
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("accessing /resumes without auth redirects to /sign-in", async ({ page }) => {
    await page.goto("/resumes");
    await page.waitForURL(/\/sign-in/, { timeout: 10_000 });
    await expect(page).toHaveURL(/\/sign-in/);
  });
});

test.describe("Sign-in page", () => {
  test("renders email and password fields with submit button", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page.locator("h1", { hasText: /welcome|sign in/i })).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"], button:has-text("Sign")')).toBeVisible();
  });

  test("sign-up page renders with form", async ({ page }) => {
    await page.goto("/sign-up");
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });
});

test.describe("SEO persona pages", () => {
  test("career changers page loads", async ({ page }) => {
    await page.goto("/resume-checker-for-career-changers");
    await expect(page.locator("h1")).toBeVisible();
  });

  test("tech jobs page loads", async ({ page }) => {
    await page.goto("/resume-checker-for-tech-jobs");
    await expect(page.locator("h1")).toBeVisible();
  });
});
