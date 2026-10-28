import { expect, test, type Page } from "@playwright/test";
import path from "node:path";

// A checked-in, real MP4 keeps media events/decoding intact without downloading
// the external scenario library. Game components, state, timings, and scoring
// are never replaced or manipulated by these tests.
const mediaFixture = path.resolve("public/assets/video/tile-flips.mp4");
const scenarios = [
  { title: "Supply Chain Transparency", answer: "Leverage a sustainable sourcing platform", score: 125 },
  { title: "Demand Forecasting", answer: "Leverage a deep learning model to improve demand forecasting in future", score: 150 },
  { title: "Scaling Internationally", answer: "Work with a cloud sovereignty partner to set up data boundaries for data residency and access control over AI deployments.", score: 165 },
  { title: "Cybersecurity", answer: "Implement AI threat detection for risk mitigation insights", score: 180 },
  { title: "Impact of AI", answer: "Train your IT team on building software sustainably principles", score: 195 },
];

function button(page: Page, name: string) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return page.getByRole("button", { name: new RegExp(`^${escaped}$`, "i") });
}

async function startGame(page: Page, isMobile: boolean) {
  // The loading intro advances automatically; its sound prompt can already be
  // covered by Begin after a slow initial asset load. Wait for the active CTA.
  await button(page, "Begin").click();
  await button(page, "Continue").click();
  if (isMobile) {
    // The first tap dismisses the character carousel's swipe instructions.
    await page.locator('[class*="CharacterSelect_CharacterSelect"]').tap({ position: { x: 100, y: 200 } });
  }
  await expect(page.getByRole("heading", { name: "Stella", exact: true })).toBeVisible();
  await button(page, "Select character").click();
  await expect(page.getByRole("heading", { name: scenarios[0].title, exact: true })).toBeVisible();
  await expect(page.getByText("SCC 100", { exact: true })).toBeVisible();
}

async function answer(page: Page, title: string, choice: string, isMobile: boolean) {
  await expect(page.getByRole("heading", { name: title, exact: true })).toBeVisible();
  if (isMobile) await button(page, "Actions").click();
  await button(page, choice).click();
  if (isMobile) await button(page, "Act now").click();
}

test.beforeEach(async ({ page }) => {
  await page.route(/\/assets\/video\/.*\.(?:mp4|webm)(?:\?.*)?$/i, (route) =>
    route.fulfill({ path: mediaFixture, contentType: "video/mp4" }),
  );
});

test("completes five scenarios, checks the annual report, and starts a clean new game", async ({ page, isMobile }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("./", { waitUntil: "domcontentloaded" });
  await startGame(page, isMobile);
  for (const [index, scenario] of scenarios.entries()) {
    await test.step(`Scenario ${index + 1}: ${scenario.title}`, async () => {
      await answer(page, scenario.title, scenario.answer, isMobile);
      await expect(page.getByRole("heading", { name: "Smart decision", exact: true })).toBeVisible();
      await expect(page.getByText(`SCC ${scenario.score}`, { exact: true })).toBeVisible();
      await button(page, index === 4 ? "See how you did" : "Continue").click();
    });
  }
  await expect(page.getByRole("heading", { name: "Ready for your annual review?", exact: true })).toBeVisible();
  await button(page, "Start highlights").click();
  for (const [index, title] of ["Protecting the organisation", "New market Sovereignty", "Were you cybersecure?"].entries()) {
    await expect(page.getByRole("heading", { name: title, exact: true })).toBeVisible();
    await button(page, index === 2 ? "Your annual review" : "Next").click();
  }
  await expect(page.getByRole("heading", { name: "Best year on record for Sunrise Cereals Co.", exact: true })).toBeVisible();
  await expect(page.getByText("0195", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Read article", exact: true })).toHaveAttribute("href", /ft\.com\/partnercontent\/google-cloud\//);
  await button(page, "Play as a new character").click();
  await startGame(page, isMobile);
  // This proves the first game's attempt history was reset as well as its score.
  await answer(page, scenarios[0].title, "Plan quarterly visits to your supplier", isMobile);
  await expect(page.getByRole("heading", { name: "Think again...", exact: true })).toBeVisible();
  await expect(page.getByText("SCC 90", { exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test("rewinds a wrong decision without awarding points for a second attempt", async ({ page, isMobile }) => {
  await page.goto("./", { waitUntil: "domcontentloaded" });
  await startGame(page, isMobile);
  await answer(page, scenarios[0].title, "Plan quarterly visits to your supplier", isMobile);
  await expect(page.getByRole("heading", { name: "Think again...", exact: true })).toBeVisible();
  await expect(page.getByText("SCC 90", { exact: true })).toBeVisible();
  await button(page, "Rewind").click();
  await answer(page, scenarios[0].title, scenarios[0].answer, isMobile);
  await expect(page.getByRole("heading", { name: "Smart decision", exact: true })).toBeVisible();
  await expect(page.getByText("SCC 90", { exact: true })).toBeVisible();
  await button(page, "Continue").click();
  await expect(page.getByRole("heading", { name: scenarios[1].title, exact: true })).toBeVisible();
  await expect(page.getByText("SCC 90", { exact: true })).toBeVisible();
});
