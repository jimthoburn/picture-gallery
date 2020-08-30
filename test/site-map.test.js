import { config } from "../_config.js";

describe("🗺  Site map", function() {
  if (config.askSearchEnginesNotToIndex) {
    it("is not referenced by robots.txt, since config.askSearchEnginesNotToIndex is set to “true”", async () => {
      const response = await page.goto(config.test.hostURL + "/robots.txt");
      if (response.status() !== 404) {
        const pageSource = await page.content();
        expect(pageSource).not.toMatch("sitemap.xml");
      } else {
        expect(response.status()).toBe(404);
      }
    });

    it("does not exist, since config.askSearchEnginesNotToIndex is set to “true”", async () => {
      const response = await page.goto(config.test.hostURL + "/sitemap.xml");
      expect(response.status()).toBe(404);
    });
  } else if (!config.host) {
    it("is not referenced by robots.txt, since config.host is empty and robots.txt does not exist", async () => {
      const response = await page.goto(config.test.hostURL + "/robots.txt");
      expect(response.status()).toBe(404);
    });

    it("does not exist, since config.host is empty", async () => {
      const response = await page.goto(config.test.hostURL + "/sitemap.xml");
      expect(response.status()).toBe(404);
    });
  } else {
    it("is referenced by robots.txt", async () => {
      await page.goto(config.test.hostURL + "/robots.txt");
      const pageSource = await page.content();
      expect(pageSource).toMatch("sitemap.xml");
    });
  }
});
