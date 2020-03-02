
describe("Firefox", () => {
  beforeAll(async () => {
    await page.goto("https://whatismybrowser.com/");
  });

  it("should display “firefox” text on page", async () => {
    const browser = await page.$eval(".string-major a", el => el.text);
    expect(browser).toContain("Firefox");
  });
});
