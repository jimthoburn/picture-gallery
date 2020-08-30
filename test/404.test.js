import { config } from "../_config.js";

describe("🚥 404 page", function() {
  it("exists", async () => {
    const response = await page.goto(config.test.hostURL + "/an-unknown-url/");
    expect(response.status()).toBe(404);
    const pageSource = await page.content();
    const matches = pageSource.match("This page couldn’t be found");
    expect(matches).not.toBeNull();
  });
});

