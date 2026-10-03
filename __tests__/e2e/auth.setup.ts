// __tests__/e2e/auth.setup.ts — Playwright auth setup
// Runs once before all tests, saves session to .auth/user.json

import { test as setup, expect } from "@playwright/test";
import path from "path";

const authFile = path.join(__dirname, ".auth/user.json");

setup("authenticate", async ({ page }) => {
  await page.goto("/login");

  // Fill credentials
  await page.getByLabel("Email").fill(
    process.env.TEST_EMAIL ?? "demo@trackflow.dev"
  );
  await page.getByLabel("Password").fill(
    process.env.TEST_PASSWORD ?? "password123"
  );

  await page.getByRole("button", { name: "Sign in" }).click();

  // Wait for redirect to dashboard
  await page.waitForURL("**/dashboard", { timeout: 15_000 });
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

  // Save auth state
  await page.context().storageState({ path: authFile });
});
