// import { config } from "../_config.js";

// https://github.com/facebook/jest/issues/4842#issuecomment-344170963
// https://www.npmjs.com/package/esm
const esmImport = require("esm")(module /*, options*/);
const { config } = esmImport("../_config.js");
const { describeAccessibility, describeFindability } = esmImport("../helpers/describe.js");

const options = {
  name: "📗📗📗 Group album",
  url: config.test.groupAlbumURL
};

describe(options.name, function() {
  it("is listed on the home page", async () => {
    await page.goto(config.test.hostURL + config.test.homeURL);
    const element = await page.$(`a[href*="${options.url}"]`);
    expect(element).not.toBe(null);
  });
});

describeAccessibility(options);

describeFindability(options);
