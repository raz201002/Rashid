import { expect, test } from "@playwright/test";

test("learner routes are directly reachable and reload safe", async ({ page }) => {
  await page.goto("/studio/economics");
  await expect(page.getByRole("heading", { name: "Economics", exact: true })).toBeVisible();
  await expect(page.getByText("Economics—screen, not approval")).toBeVisible();
  await page.reload();
  await expect(page.getByText("Financial viability:", { exact: true })).toBeVisible();
});
