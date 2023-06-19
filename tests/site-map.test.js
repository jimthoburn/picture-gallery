// @ts-check
import { test, expect } from "@playwright/test";
import { config } from "../_config.js";

test.describe("🗺  Site map", function() {
  if (config.askSearchEnginesNotToIndex) {
    test("is not referenced by robots.txt, since config.askSearchEnginesNotToIndex is set to “true”", async ({ page }) => {
      const response = await page.goto(config.test.hostURL + "/robots.txt");
      if (response.status() !== 404) {
        const pageSource = await page.content();
        expect(pageSource).not.toMatch("sitemap.xml");
      } else {
        expect(response.status()).toBe(404);
      }
    });

    test("does not exist, since config.askSearchEnginesNotToIndex is set to “true”", async ({ page }) => {
      const response = await page.goto(config.test.hostURL + "/sitemap.xml");
      expect(response.status()).toBe(404);
    });
  } else if (!config.host) {
    test("is not referenced by robots.txt, since config.host is empty and robots.txt does not exist", async ({ page }) => {
      const response = await page.goto(config.test.hostURL + "/robots.txt");
      expect(response.status()).toBe(404);
    });

    test("does not exist, since config.host is empty", async ({ page }) => {
      const response = await page.goto(config.test.hostURL + "/sitemap.xml");
      expect(response.status()).toBe(404);
    });
  } else {
    test("is referenced by robots.txt", async ({ page }) => {
      await page.goto(config.test.hostURL + "/robots.txt");
      const pageSource = await page.content();
      expect(pageSource).toMatch("sitemap.xml");
    });
  }
});
