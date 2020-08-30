import { config } from "../_config.js";

import { describeHasContent, describeAccessibility, describeFindability } from "../helpers/describe.js";

const options = {
  name: "📗=>📗 Child album",
  url: config.test.groupAlbumChildURL
};

describeHasContent(options);

describeAccessibility(options);

describeFindability(options);
