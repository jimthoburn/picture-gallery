import { config } from "../_config.js";

import { describeHasContent, describeAccessibility, describeFindability } from "../helpers/describe.js";

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

describeHasContent(options);

describeAccessibility(options);

describeFindability(options);
