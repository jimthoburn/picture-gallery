// import { config } from "../_config.js";

// https://github.com/facebook/jest/issues/4842#issuecomment-344170963
// https://www.npmjs.com/package/esm
const esmImport = require("esm")(module /*, options*/);
const config = esmImport("../_config.js").config;
const { describeAccessibility,
        describeFindability,
        hasAnOpenGraphImage } = esmImport("../helpers/describe.js");

describe("🏡 Home page", () => {
  beforeAll(async () => {
    await page.goto(config.test.hostURL + config.test.homeURL);
  });

  hasAnOpenGraphImage({ url: config.test.homeURL });
});
