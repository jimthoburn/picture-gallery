// import { config } from "../_config.js";

// https://github.com/facebook/jest/issues/4842#issuecomment-344170963
// https://www.npmjs.com/package/esm
const esmImport = require("esm")(module /*, options*/);
const config = esmImport("../_config.js").config;

describe("🏡 Home page", () => {
  beforeAll(async () => {
    await page.goto(config.test.hostURL + config.test.homeURL);
  });

  it("has an “alt” attribute with descriptive text for each image", async () => {
    const alt = await page.$eval(`img:not([src*="data:image"])`, element =>
      element.getAttribute("alt")
    );
    expect(alt).toMatch(/[a-z0-9]+/);
  });
});

describe("📗 Album", function() {
  beforeAll(async () => {
    await page.goto(config.test.hostURL + config.test.albumURL);
  });

  it("has an “alt” attribute with descriptive text for each image", async () => {
    const alt = await page.$eval(`img:not([src*="data:image"])`, element =>
      element.getAttribute("alt")
    );
    expect(alt).toMatch(/[a-z0-9]+/);
  });
});

describe("📗📗📗 Group album", function() {
  beforeAll(async () => {
    await page.goto(config.test.hostURL + config.test.groupAlbumURL);
  });

  it("has an “alt” attribute with descriptive text for each image", async () => {
    const alt = await page.$eval(`img:not([src*="data:image"])`, element =>
      element.getAttribute("alt")
    );
    expect(alt).toMatch(/[a-z0-9]+/);
  });
});

describe("📗=>📗 Child album", function() {
  beforeAll(async () => {
    await page.goto(config.test.hostURL + config.test.groupAlbumChildURL);
  });

  it("has an “alt” attribute with descriptive text for each image", async () => {
    const alt = await page.$eval(`img:not([src*="data:image"])`, element =>
      element.getAttribute("alt")
    );
    expect(alt).toMatch(/[a-z0-9]+/);
  });
});

describe("🖼  Picture", function() {
  beforeAll(async () => {
    await page.goto(config.test.hostURL + config.test.pictureURL);
  });

  it("has an “alt” attribute with descriptive text for each image", async () => {
    const alt = await page.$eval(`img:not([src*="data:image"])`, element =>
      element.getAttribute("alt")
    );
    expect(alt).toMatch(/[a-z0-9]+/);
  });
});
