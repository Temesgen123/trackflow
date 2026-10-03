// __tests__/e2e/backlog.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Backlog (authenticated)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/backlog");
  });

  test("shows the backlog heading", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Backlog" })).toBeVisible();
  });

  test("shows filter controls", async ({ page }) => {
    await expect(page.getByPlaceholder("Search tasks…")).toBeVisible();
    await expect(page.getByRole("combobox").first()).toBeVisible();
  });

  test("shows stat cards", async ({ page }) => {
    await expect(page.getByText("Total tasks")).toBeVisible();
    await expect(page.getByText("Unassigned")).toBeVisible();
    await expect(page.getByText(/High \/ Urgent/i)).toBeVisible();
  });

  test("search filters tasks", async ({ page }) => {
    const search = page.getByPlaceholder("Search tasks…");
    await search.fill("zzznomatchxxx");
    await expect(page.getByText("No tasks found")).toBeVisible({ timeout: 5_000 });
  });
});
