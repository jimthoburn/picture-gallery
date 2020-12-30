import { config } from "../_config.js";

import { describeAccessibility, describeFindability } from "../helpers/describe.js";

const options = {
  name: "📗 Album",
  url: config.test.albumURL
};

describe(options.name, function() {
  it("is listed on the home page", async () => {
    await page.goto(config.test.hostURL + config.test.homeURL);
    let element = null;
    try {
      element = await page.waitForSelector(`a[href*="${options.url}"]`, { timeout: 1 });
    } catch {
      expect(element).toBe(null);
    }
  });
});

describeAccessibility(options);

describeFindability(options);

