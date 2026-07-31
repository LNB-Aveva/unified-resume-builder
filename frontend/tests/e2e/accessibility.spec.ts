import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const PUBLIC_PAGES = [
  { name: "landing", path: "/" },
  { name: "keyword-analyzer", path: "/keyword-analyzer" },
  { name: "sign-in", path: "/sign-in" },
  { name: "privacy", path: "/privacy" },
  { name: "terms", path: "/terms" },
  { name: "blog", path: "/blog" },
];

for (const { name, path } of PUBLIC_PAGES) {
  test(`${name} page passes WCAG 2.1 AA`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState("domcontentloaded");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .exclude(".cookie-consent")
      .analyze();

    const violations = results.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious"
    );

    expect(
      violations,
      `${name}: ${violations.length} serious/critical a11y violations:\n${violations
        .map((v) => `  [${v.impact}] ${v.id}: ${v.description} (${v.nodes.length} nodes)`)
        .join("\n")}`
    ).toHaveLength(0);
  });
}
