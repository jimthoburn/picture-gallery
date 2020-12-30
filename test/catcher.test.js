import { config } from "../_config.js";

describe("😺 Catcher", function() {
  it("restores the original server-side rendered HTML, if an error happened during the initial client-side render", async () => {
    await page.goto(config.test.hostURL + config.test.albumURL + "?test=error-during-initial-render");
    let element = null;
    try {
      element = await page.waitForSelector(`img`, { timeout: 1 });
    } catch {
      expect(element).toBe(null);
    }
  });

  it("visits the page a user requested, if a client-side error happens after a user presses a link", async () => {
    await page.goto(config.test.hostURL + config.test.albumURL + "?test=error-after-user-interaction");
    const href = await page.$eval(`a[href]`, element =>
      element.getAttribute("href")
    );
    page.click(`a[href]`);  
    const request = await page.waitForRequest(new RegExp(href.replace(/\//g, "\/")));
    expect(request.url().replace(config.test.hostURL, "")).toBe(href.replace(config.test.hostURL, ""));
  });
});
