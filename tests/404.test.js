// @ts-check
import { test, expect } from "@playwright/test";
import { config } from "../_config.js";

test.describe("🚥 404 page", () => {
  test("exists", async ({ page }) => {
    const response = await page.goto(config.test.hostURL + "/an-unknown-url/");
    expect(response.status()).toBe(404);
    const pageSource = await page.content();
    const matches = pageSource.match("This page couldn’t be found");
    expect(matches).not.toBeNull();
  });
});

