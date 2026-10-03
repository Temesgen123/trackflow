// __tests__/e2e/settings.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Settings (authenticated)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/settings");
  });

  test("shows the settings heading", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
  });

  test("shows account info card", async ({ page }) => {
    await expect(page.getByText("Account")).toBeVisible();
    await expect(page.getByText("Joined")).toBeVisible();
  });

  test("shows profile form with pre-filled values", async ({ page }) => {
    await expect(page.getByLabel("Full name")).not.toHaveValue("");
    await expect(page.getByLabel("Email address")).not.toHaveValue("");
  });

  test("save button disabled when no changes", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: "Save changes" }).first()
    ).toBeDisabled();
  });

  test("save button enables after editing name", async ({ page }) => {
    const nameInput = page.getByLabel("Full name");
    await nameInput.fill("Updated Name");
    await expect(
      page.getByRole("button", { name: "Save changes" }).first()
    ).toBeEnabled();
  });

  test("shows danger zone section", async ({ page }) => {
    await expect(page.getByText("Danger zone")).toBeVisible();
    await expect(page.getByRole("button", { name: "Delete account" })).toBeDisabled();
  });
});
