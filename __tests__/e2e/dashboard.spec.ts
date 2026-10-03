// __tests__/e2e/dashboard.spec.ts — Authenticated tests
import { test, expect } from "@playwright/test";

test.describe("Dashboard (authenticated)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
  });

  test("shows the dashboard heading", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  });

  test("shows stat cards", async ({ page }) => {
    await expect(page.getByText("Active projects")).toBeVisible();
    await expect(page.getByText("Total phases")).toBeVisible();
    await expect(page.getByText("Sprints")).toBeVisible();
  });

  test("shows new project button", async ({ page }) => {
    await expect(
      page.getByRole("link", { name: /new project/i })
    ).toBeVisible();
  });

  test("navigates to new project page", async ({ page }) => {
    await page.getByRole("link", { name: /new project/i }).click();
    await page.waitForURL("**/projects/new");
    await expect(page.getByRole("heading", { name: "Create a project" })).toBeVisible();
  });

  test("sidebar links are present", async ({ page }) => {
    await expect(page.getByRole("link", { name: "Projects" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Sprint Board" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Backlog" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Milestones" })).toBeVisible();
  });

  test("redirects unauthenticated user to login", async ({ browser }) => {
    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page    = await context.newPage();
    await page.goto("/dashboard");
    await page.waitForURL("**/login");
    await context.close();
  });
});
