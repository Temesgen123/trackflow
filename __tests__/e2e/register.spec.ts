// __tests__/e2e/register.spec.ts
import { test, expect } from "@playwright/test";

test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Registration page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/register");
  });

  test("shows all form fields", async ({ page }) => {
    await expect(page.getByLabel("Full name")).toBeVisible();
    await expect(page.getByLabel("Email address")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByLabel("Confirm password")).toBeVisible();
  });

  test("submit button disabled when form is empty", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: "Create account" })
    ).toBeDisabled();
  });

  test("shows password strength bar as user types", async ({ page }) => {
    await page.getByLabel("Password").fill("weakpass");
    await expect(page.getByText(/weak|fair|good|strong/i)).toBeVisible();
  });

  test("shows mismatch error when passwords differ", async ({ page }) => {
    await page.getByLabel("Password").fill("password123");
    await page.getByLabel("Confirm password").fill("different123");
    await expect(page.getByText("Passwords do not match")).toBeVisible();
  });

  test("shows error for duplicate email", async ({ page }) => {
    await page.getByLabel("Full name").fill("Test User");
    await page.getByLabel("Email address").fill("demo@trackflow.dev");
    await page.getByLabel("Password").fill("password123");
    await page.getByLabel("Confirm password").fill("password123");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(
      page.getByText(/already exists/i)
    ).toBeVisible({ timeout: 8_000 });
  });

  test("has link back to login", async ({ page }) => {
    await page.getByRole("link", { name: "Sign in" }).click();
    await page.waitForURL("**/login");
  });
});
