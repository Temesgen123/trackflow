// __tests__/e2e/projects.spec.ts — Project CRUD E2E tests
import { test, expect } from "@playwright/test";

const TEST_PROJECT_NAME = `E2E Test Project ${Date.now()}`;

test.describe("Projects (authenticated)", () => {
  test("can create a new project", async ({ page }) => {
    await page.goto("/projects/new");
    await expect(page.getByRole("heading", { name: "Create a project" })).toBeVisible();

    await page.getByLabel("Project name").fill(TEST_PROJECT_NAME);
    await page.getByLabel("Description").fill("Created by Playwright E2E test");

    await page.getByRole("button", { name: "Create project" }).click();

    // Should redirect to project detail page
    await page.waitForURL("**/projects/**", { timeout: 10_000 });
    await expect(page.getByText(TEST_PROJECT_NAME)).toBeVisible();
  });

  test("shows error for empty project name", async ({ page }) => {
    await page.goto("/projects/new");
    await page.getByRole("button", { name: "Create project" }).click();
    // HTML5 validation prevents submit — name field should be focused
    const nameInput = page.getByLabel("Project name");
    await expect(nameInput).toBeFocused();
  });

  test("shows projects list", async ({ page }) => {
    await page.goto("/projects");
    await expect(page.getByRole("heading", { name: "Projects" })).toBeVisible();
    await expect(page.getByRole("link", { name: /new project/i })).toBeVisible();
  });

  test("can navigate to a project from dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    const projectLinks = page.locator('a[href^="/projects/"]').filter({ hasNot: page.locator('[href="/projects/new"]') });
    const count = await projectLinks.count();
    if (count > 0) {
      await projectLinks.first().click();
      await page.waitForURL("**/projects/**");
      await expect(page.getByText("Phases")).toBeVisible();
    }
  });
});
