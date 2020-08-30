import { config } from "../_config.js";

import { describeAccessibility, describeFindability } from "../helpers/describe.js";

const options = {
  name: "📗 Album",
  url: config.test.albumURL
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

