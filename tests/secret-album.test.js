// @ts-check
import { test, expect } from "@playwright/test";
import { config } from "../_config.js";

test.describe("📒 Secret album", function() {
  const url = config.test.secretAlbumURL;

  test("is not listed on the home page", async ({ page }) => {
    await page.goto(config.test.hostURL + config.test.homeURL);
    let element = null;
    try {
      element = await page.waitForSelector(`a[href*="${url}"]`, { timeout: 1 });
    } catch {
      expect(element).toBe(null);
    }
  });

  test("asks search engines not to index it", async ({ page }) => {
    await page.goto(config.test.hostURL + url);
    const content = await page.$eval(`meta[name="robots"]`, element =>
      element.getAttribute("content")
    );
    expect(content).toBe("noindex");
  });

  test("is not listed in the site map", async ({ page }) => {
    await page.goto(config.test.hostURL + "/sitemap.xml");
    const pageSource = await page.content();
    const matches = pageSource.match(new RegExp(`<loc>.*${url}<\/loc>`));
    expect(matches).toBeNull();
  });
});
