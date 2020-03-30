// import { config } from "../_config.js";

// https://github.com/facebook/jest/issues/4842#issuecomment-344170963
// https://www.npmjs.com/package/esm
const esmImport = require("esm")(module /*, options*/);
const config = esmImport("../_config.js").config;
const { describeHasContent,
        describeAccessibility,
        describeFindability } = esmImport("../helpers/describe.js");

const options = {
  name: "🏡 Home page",
  url: config.test.groupAlbumURL
};

describeHasContent(options);

describeFindability(options);

describeAccessibility(options);
