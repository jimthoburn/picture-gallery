
import { config } from "../_config.js";

import isUrl from "is-url";


function hasAnOpenGraphImage({ url }) {
  if (config.host && config.host.indexOf("http") === 0) {
    it("has an open graph image, based on “host” specified in “_config.js”", async () => {
      await page.goto(config.test.hostURL + url);
      const content = await page.$eval(`meta[property="og:image"]`, element =>
        element.getAttribute("content")
      );
      const isValidURL = isUrl(content)
          // Double check for strings with two instances of “https://”
          // https://pictures.tobbi.cohttps://cdn.glitch.com/0066dc23-cee2-4973-ae99-075586a1eded%2F17.jpg?v=1572802598055
          && content.match(/https?:\/\//g).length == 1;
      expect(isValidURL).toBe(true);
    });
  } else {
    it("has a valid open graph image that starts with “http”, or does not have an open graph image specified–since “host” is empty or invalid in “_config.js”", async () => {
      await page.goto(config.test.hostURL + url);
      const metaElement = await page.$(`meta[property="og:image"]`);
      if (metaElement) {
        const content = await page.$eval(`meta[property="og:image"]`, element =>
          element.getAttribute("content")
        );
        const isValidURL = isUrl(content)
            // Double check for strings with two instances of “https://”
            // https://pictures.tobbi.cohttps://cdn.glitch.com/0066dc23-cee2-4973-ae99-075586a1eded%2F17.jpg?v=1572802598055
            && content.match(/https?:\/\//g).length == 1;
        expect(isValidURL).toBe(true);
      } else {
        expect(metaElement).toBeNull();
      }
    }); 
  }
}

function describeFindability({ name, url }) {
  describe(`${name}, findability 🔦`, function() {

    hasAnOpenGraphImage({ url });

    if (config.askSearchEnginesNotToIndex) {
      it("asks search engines not to index it, since config.askSearchEnginesNotToIndex is set to “true”", async () => {
        await page.goto(config.test.hostURL + url);
        const content = await page.$eval(`meta[name="robots"]`, element =>
          element.getAttribute("content")
        );
        expect(content).toBe("noindex");
      });

      it("is not listed in the site map, since config.askSearchEnginesNotToIndex is set to “true”", async () => {
        await page.goto(config.test.hostURL + "/sitemap.xml");
        const pageSource = await page.content();
        const matches = pageSource.match(new RegExp(`<loc>.*${url}<\/loc>`));
        expect(matches).toBeNull();
      });
    } else if (!config.host) {
      it("doesn’t ask search engines not to index it", async () => {
        await page.goto(config.test.hostURL + url);
        const element = await page.$(`meta[name="robots"][content="noindex"]`);
        expect(element).toBeNull();
      });

      it("is not listed in the site map, since config.host is empty and the site map does not exist", async () => {
        const response = await page.goto(config.test.hostURL + "/sitemap.xml");
        expect(response.status()).toBe(404);
      });
    } else {
      it("doesn’t ask search engines not to index it", async () => {
        await page.goto(config.test.hostURL + url);
        const element = await page.$(`meta[name="robots"][content="noindex"]`);
        expect(element).toBeNull();
      });

      it("is listed in the site map", async () => {
        await page.goto(config.test.hostURL + "/sitemap.xml");
        const pageSource = await page.content();
        const matches = pageSource.match(new RegExp(`<loc>.*${url}<\/loc>`));
        expect(matches).not.toBeNull();
      });
    }
  });
}

function describeAccessibility({ name, url }) {
  describe(`${name}, accessibility ⌨️`, function() {
    it("has an “alt” attribute with descriptive text for each image", async () => {
      await page.goto(config.test.hostURL + url);
      const alt = await page.$eval(`img:not([src*="data:image"])`, element =>
        element.getAttribute("alt")
      );
      expect(alt).toMatch(/[a-z0-9]+/);
    });
  });
}

export { describeFindability, describeAccessibility, hasAnOpenGraphImage }
