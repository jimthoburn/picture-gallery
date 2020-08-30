import { config } from "../_config.js";

import { describeHasContent,
         describeAccessibility,
         describeFindability } from "../helpers/describe.js";

const options = {
  name: "🏡 Home page",
  url: config.test.groupAlbumURL
};

describeHasContent(options);

describeFindability(options);

describeAccessibility(options);
