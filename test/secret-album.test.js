// import { config } from "../_config.js";

// https://github.com/facebook/jest/issues/4842#issuecomment-344170963
// https://www.npmjs.com/package/esm
const esmImport = require("esm")(module /*, options*/);
const { config } = esmImport("../_config.js");


describe("📒 Secret album", function() {
  const url = config.test.secretAlbumURL;

  it("is not listed on the home page", async () => {
    await page.goto(config.test.hostURL + config.test.homeURL);
    const element = await page.$(`a[href*="${url}"]`);
    expect(element).toBe(null);
  });

  it("asks search engines not to index it", async () => {
    await page.goto(config.test.hostURL + url);
    const content = await page.$eval(`meta[name="robots"]`, element =>
      element.getAttribute("content")
    );
    expect(content).toBe("noindex");
  });

  it("is not listed in the site map", async () => {
    await page.goto(config.test.hostURL + "/sitemap.xml");
    const pageSource = await page.content();
    const matches = pageSource.match(new RegExp(`<loc>.*${url}<\/loc>`));
    expect(matches).toBeNull();
  });
});
