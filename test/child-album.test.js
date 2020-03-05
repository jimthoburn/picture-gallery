// import { config } from "../_config.js";

// https://github.com/facebook/jest/issues/4842#issuecomment-344170963
// https://www.npmjs.com/package/esm
const esmImport = require("esm")(module /*, options*/);
const { config } = esmImport("../_config.js");
const { describeAccessibility, describeFindability } = esmImport("../helpers/describe.js");

const options = {
  name: "📗=>📗 Child album",
  url: config.test.groupAlbumChildURL
};

describeAccessibility(options);

describeFindability(options);
