import { config } from "../_config.js";

import { describeHasContent, describeAccessibility, describeFindability } from "../helpers/describe.js";

const options = {
  name: "🖼  Picture",
  url: config.test.pictureURL
};

describeHasContent(options);

describeAccessibility(options);

describeFindability(options);
