import { expect, test } from "@playwright/test";

test.describe("Smoke E2E", () => {
  test("la página de inicio muestra el panel de gestión", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /Panel de gestión/i })).toBeVisible();
  });
});
