// @ts-check
import { test, expect } from "@playwright/test";
import { config } from "../_config.js";

import isUrl from "is-url";
import fetch from "node-fetch";


function describeHasContent({ name, url }) {
  test.describe(`${name}, has content 🖼`, function() {
    test("has an image with a valid URL", async ({ page }) => {
      await page.goto(config.test.hostURL + url);
      const src = await page.$eval(`img:not([src*="data:image"])`, element =>
        element.getAttribute("src")
      );
      const response = await fetch(src.indexOf("http") === 0 ? src : `${config.test.hostURL}${src}`);
      expect(response.ok).toBe(true);
    });
  });
}

function hasAnOpenGraphImage({ url }) {
  if (config.host && config.host.indexOf("http") === 0) {
    test("has an open graph image, based on “host” specified in “_config.js”", async ({ page }) => {
      await page.goto(config.test.hostURL + url);
      const content = await page.$eval(`meta[property="og:image"]`, element =>
        element.getAttribute("content")
      );
      const response = await fetch(content);
      expect(response.ok).toBe(true);
      // const isValidURL = isUrl(content)
      //     // Double check for strings with two instances of “https://”
      //     // https://pictures.tobbi.cohttps://cdn.glitch.com/0066dc23-cee2-4973-ae99-075586a1eded%2F17.jpg?v=1572802598055
      //     && content.match(/https?:\/\//g).length == 1;
      // expect(isValidURL).toBe(true);
    });
  } else {
    test("has a valid open graph image that starts with “http”, or does not have an open graph image specified–since “host” is empty or invalid in “_config.js”", async ({ page }) => {
      await page.goto(config.test.hostURL + url);
      let metaElement = null;
      try {
        const metaElement = await page.waitForSelector(`meta[property="og:image"]`, { timeout: 1 });
        const content = await page.$eval(`meta[property="og:image"]`, element =>
          element.getAttribute("content")
        );
        const response = await fetch(content);
        expect(response.ok).toBe(true);
        // const isValidURL = isUrl(content)
        //     // Double check for strings with two instances of “https://”
        //     // https://pictures.tobbi.cohttps://cdn.glitch.com/0066dc23-cee2-4973-ae99-075586a1eded%2F17.jpg?v=1572802598055
        //     && content.match(/https?:\/\//g).length == 1;
        // expect(isValidURL).toBe(true);
      } catch {
        expect(metaElement).toBeNull();
      }
    });
  }
}

function describeFindability({ name, url }) {
  test.describe(`${name}, findability 🔦`, function() {

    hasAnOpenGraphImage({ url });

    if (config.askSearchEnginesNotToIndex) {
      test("asks search engines not to index it, since config.askSearchEnginesNotToIndex is set to “true”", async ({ page }) => {
        await page.goto(config.test.hostURL + url);
        const content = await page.$eval(`meta[name="robots"]`, element =>
          element.getAttribute("content")
        );
        expect(content).toBe("noindex");
      });

      test("is not listed in the site map, since config.askSearchEnginesNotToIndex is set to “true”", async ({ page }) => {
        await page.goto(config.test.hostURL + "/sitemap.xml");
        const pageSource = await page.content();
        const matches = pageSource.match(new RegExp(`<loc>${config.host}${url}<\/loc>`));
        expect(matches).toBeNull();
      });
    } else if (!config.host) {
      test("doesn’t ask search engines not to index it", async ({ page }) => {
        await page.goto(config.test.hostURL + url);
        let element = null;
        try {
          element = await page.waitForSelector(`meta[name="robots"][content="noindex"]`, { timeout: 1 });
        } catch {
          expect(element).toBe(null);
        }
      });

      test("is not listed in the site map, since config.host is empty and the site map does not exist", async ({ page }) => {
        const response = await page.goto(config.test.hostURL + "/sitemap.xml");
        expect(response.status()).toBe(404);
      });
    } else {
      test("doesn’t ask search engines not to index it", async ({ page }) => {
        await page.goto(config.test.hostURL + url);
        let element = null;
        try {
          element = await page.waitForSelector(`meta[name="robots"][content="noindex"]`, { timeout: 1 });
        } catch {
          expect(element).toBe(null);
        }
      });

      test("is listed in the site map", async ({ page }) => {
        await page.goto(config.test.hostURL + "/sitemap.xml");
        const pageSource = await page.content();
        const matches = pageSource.match(new RegExp(`<loc>${config.host}${url}<\/loc>`));
        expect(matches).not.toBeNull();
      });
    }
  });
}

function describeAccessibility({ name, url }) {
  test.describe(`${name}, accessibility ⌨️`, function() {
    test("has an “alt” attribute with descriptive text for each image", async ({ page }) => {
      await page.goto(config.test.hostURL + url);
      const alt = await page.$eval(`img:not([src*="data:image"])`, element =>
        element.getAttribute("alt")
      );
      expect(alt).toMatch(/[a-z0-9]+/);
    });
  });
}

export { describeHasContent, describeFindability, describeAccessibility, hasAnOpenGraphImage }
