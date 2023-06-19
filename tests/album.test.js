// @ts-check
import { test, expect } from "@playwright/test";
import { config } from "../_config.js";

import { describeAccessibility, describeFindability } from "../helpers/describe.js";

const options = {
  name: "📗 Album",
  url: config.test.albumURL
};

test.describe(options.name, function() {
  test("is listed on the home page", async ({ page }) => {
    await page.goto(config.test.hostURL + config.test.homeURL);
    let element = null;
    try {
      element = await page.waitForSelector(`a[href*="${options.url}"]`, { timeout: 1 });
    } catch {
      expect(element).toBe(null);
    }
  });
});

describeAccessibility(options);

describeFindability(options);

