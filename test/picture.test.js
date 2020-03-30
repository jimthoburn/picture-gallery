// import { config } from "../_config.js";

// https://github.com/facebook/jest/issues/4842#issuecomment-344170963
// https://www.npmjs.com/package/esm
const esmImport = require("esm")(module /*, options*/);
const { config } = esmImport("../_config.js");
const { describeHasContent, describeAccessibility, describeFindability } = esmImport("../helpers/describe.js");

const options = {
  name: "🖼  Picture",
  url: config.test.pictureURL
};

describeHasContent(options);

describeAccessibility(options);

describeFindability(options);
