import { expect, test } from "@playwright/test";

const learnerRoutes = [
  ["/", "Load profile"], ["/studio/size-battery", "Size battery"], ["/studio/dispatch", "Dispatch"], ["/studio/thermal-limits", "Thermal limits"], ["/studio/uncertainty", "Uncertainty"], ["/studio/safety-drill", "Safety drill"], ["/studio/decision-history", "Decision history"], ["/studio/economics", "Economics"], ["/studio/knowledge-check", "Knowledge check"]
] as const;

for (const [route, heading] of learnerRoutes) {
  test(`${route} is directly reachable and reload safe`, async ({ page }) => {
    await page.goto(route);
    await expect(page.getByRole("heading", { name: heading, exact: true })).toBeVisible();
    await page.reload();
    await expect(page.getByRole("heading", { name: heading, exact: true })).toBeVisible();
  });
}

test("instructor demo is directly reachable", async ({ page }) => {
  await page.goto("/instructor");
  await expect(page.getByRole("heading", { name: "Instructor overview", exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText("Instructor demo · local learning state")).toBeVisible();
});
