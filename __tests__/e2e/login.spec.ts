// __tests__/e2e/login.spec.ts
import { test, expect } from "@playwright/test";

// These tests run WITHOUT saved auth state
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Login page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("shows the TrackFlow brand", async ({ page }) => {
    await expect(page.getByText("TrackFlow")).toBeVisible();
    await expect(page.getByText("Sign in to your workspace")).toBeVisible();
  });

  test("shows validation error for wrong credentials", async ({ page }) => {
    await page.getByLabel("Email").fill("wrong@example.com");
    await page.getByLabel("Password").fill("wrongpassword");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText(/invalid email or password/i)).toBeVisible({ timeout: 8_000 });
  });

  test("redirects to dashboard after successful login", async ({ page }) => {
    await page.getByLabel("Email").fill("demo@trackflow.dev");
    await page.getByLabel("Password").fill("password123");
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.waitForURL("**/dashboard", { timeout: 15_000 });
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  });

  test("has a link to registration page", async ({ page }) => {
    await page.getByRole("link", { name: "Create a new account" }).click();
    await page.waitForURL("**/register");
    await expect(page.getByRole("heading", { name: "Get started" })).toBeVisible();
  });
});
