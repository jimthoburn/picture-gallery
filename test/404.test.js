// import { config } from "../_config.js";

// https://github.com/facebook/jest/issues/4842#issuecomment-344170963
// https://www.npmjs.com/package/esm
const esmImport = require("esm")(module /*, options*/);
const { config } = esmImport("../_config.js");

describe("🚥 404 page", function() {
  it("exists", async () => {
    const response = await page.goto(config.test.hostURL + "/an-unknown-url/");
    expect(response.status()).toBe(404);
    const pageSource = await page.content();
    const matches = pageSource.match("This page couldn’t be found");
    expect(matches).not.toBeNull();
  });
});

