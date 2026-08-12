import { test, expect } from "@playwright/test";

test.setTimeout(60_000);

// ─── Mock API responses ──────────────────────────────────────────────

const MOCK_GAP_RESPONSE = {
  overall_score: 72,
  grade: "B",
  grade_label: "Good Match",
  hard_skills_score: 80,
  soft_skills_score: 60,
  matched_keywords: ["Python", "AWS", "Docker"],
  missing_keywords: ["Kubernetes", "CI/CD"],
  matched_hard_skills: ["Python", "AWS", "Docker"],
  missing_hard_skills: ["Kubernetes", "Terraform"],
  matched_soft_skills: ["communication"],
  missing_soft_skills: ["mentoring"],
  total_job_keywords: 8,
  total_matched: 4,
  total_missing: 4,
};

const MOCK_COMPLIANCE_RESPONSE = {
  overall_score: 85,
  critical_issues: 0,
  warnings: 1,
  suggestions_failed: 1,
  passed_count: 13,
  total_checks: 15,
  checks: [
    { rule: "Contact Information", passed: true, severity: "critical", message: "Found email and phone." },
    { rule: "Section Headers", passed: true, severity: "critical", message: "Found standard section headers." },
    { rule: "File Format", passed: true, severity: "critical", message: "Plain text is ATS-parseable." },
    { rule: "Font Consistency", passed: true, severity: "critical", message: "No problematic fonts detected." },
    { rule: "Length Check", passed: true, severity: "critical", message: "Resume is within 1-2 pages." },
    { rule: "Email Format", passed: true, severity: "critical", message: "Valid email format found." },
    { rule: "Phone Format", passed: true, severity: "critical", message: "Valid phone format found." },
    { rule: "No Graphics", passed: true, severity: "warning", message: "No image references detected." },
    { rule: "No Tables", passed: true, severity: "warning", message: "No table markup detected." },
    { rule: "Consistent Dates", passed: false, severity: "warning", message: "Use a consistent date format (e.g. Jan 2021)." },
    { rule: "Action Verbs", passed: true, severity: "suggestion", message: "Bullet points start with action verbs." },
    { rule: "Quantified Results", passed: false, severity: "suggestion", message: "Add numbers to quantify your achievements." },
    { rule: "Keyword Density", passed: true, severity: "suggestion", message: "Good keyword coverage." },
    { rule: "No Pronouns", passed: true, severity: "suggestion", message: "No first-person pronouns detected." },
    { rule: "Skills Section", passed: true, severity: "critical", message: "Skills section found." },
  ],
};

const MOCK_SUMMARY_RESPONSE = {
  summary:
    "Results-driven software engineer with 5+ years of experience building scalable backend systems using Python, FastAPI, and AWS. Proven track record of reducing latency by 35% through microservice migration and mentoring junior engineers to senior-level performance.",
  word_count: 42,
  model_used: "mistralai/Mistral-7B-Instruct-v0.3",
  tip: "Keep your summary between 30-80 words for maximum readability.",
};

const MOCK_REWRITE_RESPONSE = {
  rewrites: [
    {
      original: "Worked on backend services",
      rewritten:
        "Architected and deployed 12 Docker-containerized microservices on AWS, reducing API latency by 40% and handling 50k daily requests",
      keywords_woven: ["Docker", "AWS", "microservices"],
    },
    {
      original: "Helped with deployments",
      rewritten:
        "Built end-to-end CI/CD pipeline using Kubernetes, cutting deployment time from 2 hours to 8 minutes across 3 environments",
      keywords_woven: ["CI/CD", "Kubernetes"],
    },
  ],
  model_used: "mistralai/Mistral-7B-Instruct-v0.3",
  tip: "Use numbers to quantify impact whenever possible.",
};

const MOCK_COVER_LETTER_RESPONSE = {
  cover_letter:
    "Dear Hiring Team,\n\nI am writing to express my interest in the Senior Software Engineer role at Acme Corp. With over 5 years of experience building scalable backend systems, I am confident in my ability to contribute meaningfully to your engineering team.\n\nIn my current role, I led the migration from a monolithic architecture to microservices, reducing API latency by 35% and improving deployment frequency from weekly to daily releases. I also mentored 3 junior engineers, two of whom were promoted within 18 months.\n\nI look forward to discussing how my background in Python, AWS, and distributed systems aligns with your team's goals.\n\nSincerely,\nJane Smith",
  word_count: 112,
  model_used: "mistralai/Mistral-7B-Instruct-v0.3",
  tip: "Personalize the opening with a specific detail about the company's recent work.",
};

// ─── Shared setup: bypass auth for /tools ────────────────────────────

test.beforeEach(async ({ context }) => {
  await context.addCookies([
    { name: "e2e_bypass", value: "1", domain: "localhost", path: "/" },
  ]);
});

test("steps 1–3 reuse the job description and resume without storing another copy", async ({
  page,
}) => {
  await page.goto("/tools");

  const jobDescription = "Senior platform engineer with Python, AWS, and Kubernetes experience.";
  const resume = "Platform engineer with five years of Python and AWS experience.";

  await page.getByLabel("Job description text").fill(jobDescription);
  await expect(page.locator("#gap-job-desc")).toHaveValue(jobDescription);
  await expect(page.getByText("Job description: ready")).toBeVisible();

  await page.locator("#gap-resume").fill(resume);
  await expect(page.locator("#compliance-resume")).toHaveValue(resume);
  await expect(page.getByText("Resume: ready")).toBeVisible();

  await page.getByRole("button", { name: "Clear both" }).click();
  await expect(page.getByLabel("Job description text")).toHaveValue("");
  await expect(page.locator("#gap-resume")).toHaveValue("");
  await expect(page.locator("#compliance-resume")).toHaveValue("");
});

// ─── Gap Analysis ────────────────────────────────────────────────────

test.describe("Tool flow — Gap Analysis", () => {
  test("submitting job + resume shows grade, score, and skill breakdown", async ({
    page,
  }) => {
    await page.route("**/api/v1/gap", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_GAP_RESPONSE),
      }),
    );

    await page.goto("/tools");
    const section = page.locator("#gap-analysis");
    await section.scrollIntoViewIfNeeded();

    await page.locator("#gap-job-desc").fill(
      "Senior Software Engineer requiring Python, AWS, Docker, Kubernetes, Terraform, CI/CD",
    );
    await page.locator("#gap-resume").fill(
      "Experienced Python developer with 5 years of AWS and Docker expertise. Strong communication skills.",
    );
    await section.locator("button", { hasText: "Analyze My Gap" }).click();

    await expect(page.getByText("B").first()).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("/100")).toBeVisible();
    await expect(page.getByText("Good Match")).toBeVisible();
    await expect(page.getByText("Found in your resume").first()).toBeVisible();
    await expect(page.getByText("Add to your resume").first()).toBeVisible();

    await page.getByLabel("Job description text").fill("A different role requiring Go.");
    await expect(page.getByText("Good Match")).not.toBeVisible();
  });
});

// ─── Compliance Checker ──────────────────────────────────────────────

test.describe("Tool flow — Compliance Checker", () => {
  test("submitting resume shows score and pass/fail checks", async ({
    page,
  }) => {
    await page.route("**/api/v1/compliance", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_COMPLIANCE_RESPONSE),
      }),
    );

    await page.goto("/tools");
    const section = page.locator("#compliance-checker");
    await section.scrollIntoViewIfNeeded();

    await page.locator("#compliance-resume").fill(
      "Jane Smith\njane@example.com\n(555) 123-4567\nLondon, UK\n\nProfessional Summary\nExperienced software engineer with 5 years...\n\nExperience\nSenior Engineer at Acme Corp (Jan 2021 - Present)\n- Built REST APIs serving 50k daily requests\n\nSkills\nPython, AWS, Docker",
    );
    await section
      .locator("button", { hasText: "Run ATS Compliance Check" })
      .click();

    await expect(page.getByText("85")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("13 of 15 checks passed")).toBeVisible();
    await expect(page.getByText("Contact Information")).toBeVisible();
    await expect(page.getByText("1 warnings")).toBeVisible();

    await page.locator("#gap-resume").fill("A different resume draft.");
    await expect(page.getByText("13 of 15 checks passed")).not.toBeVisible();
  });
});

// ─── Summary Generator ──────────────────────────────────────────────

test.describe("Tool flow — Summary Generator", () => {
  test("filling form and generating shows AI summary with word count", async ({
    page,
  }) => {
    await page.route("**/api/v1/summary", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_SUMMARY_RESPONSE),
      }),
    );

    await page.goto("/tools");
    const section = page.locator("#summary-generator");
    await section.scrollIntoViewIfNeeded();

    await page.locator("#sum-job-title").fill("Senior Software Engineer");
    await page.locator("#sum-jd").fill(
      "We are looking for a senior engineer to build scalable backend services using Python and AWS.",
    );
    await page.locator("#sum-exp").fill(
      "- Built REST APIs with FastAPI serving 10k daily requests\n- Led migration from monolith to microservices\n- Mentored 3 junior engineers",
    );
    await section
      .locator("button", { hasText: "Generate Professional Summary" })
      .click();

    await expect(
      page.getByText("AI Generated Summary"),
    ).toBeVisible({ timeout: 15_000 });
    await expect(
      page.getByText("Results-driven software engineer", { exact: false }),
    ).toBeVisible();
    await expect(page.getByText("42 words")).toBeVisible();
  });
});

// ─── Bullet Rewriter ────────────────────────────────────────────────

test.describe("Tool flow — Bullet Rewriter", () => {
  test("submitting bullets shows before/after pairs with woven keywords", async ({
    page,
  }) => {
    await page.route("**/api/v1/rewrite", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_REWRITE_RESPONSE),
      }),
    );

    await page.goto("/tools");
    const section = page.locator("#bullet-rewriter");
    await section.scrollIntoViewIfNeeded();

    await page.locator("#br-job-title").fill("Senior Software Engineer");
    await page.locator("#br-keywords").fill("Docker, Kubernetes, CI/CD, AWS, microservices");
    await page.locator("#br-bullets").fill(
      "Worked on backend services\nHelped with deployments",
    );
    await section
      .locator("button", { hasText: "Rewrite Bullets with AI" })
      .click();

    await expect(
      page.getByText("2 bullets rewritten"),
    ).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("Before").first()).toBeVisible();
    await expect(page.getByText("After").first()).toBeVisible();
    await expect(
      page.locator("text=Before").first(),
    ).toBeVisible();
    await expect(
      page.locator("p", { hasText: "Worked on backend services" }),
    ).toBeVisible();
    await expect(
      page.getByText("Docker-containerized", { exact: false }),
    ).toBeVisible();
    await expect(page.getByText("+ Docker").first()).toBeVisible();
  });
});

// ─── Cover Letter Generator ─────────────────────────────────────────

test.describe("Tool flow — Cover Letter Generator", () => {
  test("filling form generates a cover letter with word count and tone", async ({
    page,
  }) => {
    await page.route("**/api/v1/cover-letter", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_COVER_LETTER_RESPONSE),
      }),
    );

    await page.goto("/tools");
    const section = page.locator("#cover-letter");
    await section.scrollIntoViewIfNeeded();

    await page.locator("#cl-job-title").fill("Senior Software Engineer");
    await page.locator("#cl-company").fill("Acme Corp");
    await page.locator("#cl-jd").fill(
      "We need a senior engineer to build scalable services. Python, AWS, Docker required.",
    );
    await page.locator("#cl-exp").fill(
      "- Led backend migration reducing latency by 35%\n- Mentored 3 junior engineers\n- Built CI/CD pipeline",
    );
    await section
      .locator("button", { hasText: "Generate Cover Letter" })
      .click();

    await expect(
      page.getByText("AI Generated Cover Letter"),
    ).toBeVisible({ timeout: 15_000 });
    await expect(
      page.getByText("Dear Hiring Team,"),
    ).toBeVisible();
    await expect(page.getByText("112 words")).toBeVisible();
    await expect(page.getByText("formal").last()).toBeVisible();
  });
});

// ─── Resume Exporter (PDF download) ─────────────────────────────────

test.describe("Tool flow — Resume Exporter", () => {
  test("filling personal info and downloading triggers PDF", async ({
    page,
  }) => {
    await page.route("**/api/v1/export/pdf", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/pdf",
        body: Buffer.from("%PDF-1.4 fake pdf content for testing"),
      }),
    );

    await page.goto("/tools");
    const section = page.locator("#pdf-export");
    await section.scrollIntoViewIfNeeded();

    await page.locator("#re-fullname").fill("Jane Smith");
    await page.locator("#re-email").fill("jane@example.com");
    await page.locator("#re-phone").fill("+44 7700 000000");
    await page.locator("#re-location").fill("London, UK");

    const downloadPromise = page.waitForEvent("download");
    await section
      .locator("button", { hasText: "Download PDF Resume" })
      .click();

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain("Jane");
    expect(download.suggestedFilename()).toMatch(/\.pdf$/);
  });
});
