// import { config } from "../_config.js";

// https://github.com/facebook/jest/issues/4842#issuecomment-344170963
// https://www.npmjs.com/package/esm
const esmImport = require("esm")(module /*, options*/);
const config = esmImport("../_config.js").config;

describe("🏡 Home page", () => {
  beforeAll(async () => {
    await page.goto(config.test.hostURL + config.test.homeURL);
  });

  it("has an open graph image, based on “host” specified in “_config.js”", async () => {
    if (config.host && config.host.indexOf("http") === 0) {
      const content = await page.$eval(`meta[property="og:image"]`, element =>
        element.getAttribute("content")
      );
      expect(content).toMatch(config.host);
    } else {
      return true;
    }
  });
});

describe("📗 Album", () => {

  const albumURL = config.test.albumURL;

  it("has an open graph image, based on “host” specified in “_config.js”", async () => {
    await page.goto(config.test.hostURL + albumURL);

    if (config.host && config.host.indexOf("http") === 0) {
      const content = await page.$eval(`meta[property="og:image"]`, element =>
        element.getAttribute("content")
      );
      expect(content).toMatch(config.host);
    } else {
      return true;
    }
  });

  it("is listed on the home page", async () => {
    await page.goto(config.test.hostURL + config.test.homeURL);
    const element = await page.$(`a[href*="${albumURL}"]`);
    expect(element).not.toBe(null);
  });

  if (config.askSearchEnginesNotToIndex) {
    it("asks search engines not to index it, since config.askSearchEnginesNotToIndex is set to “true”", async () => {
      await page.goto(config.test.hostURL + albumURL);
      const content = await page.$eval(`meta[name="robots"]`, element =>
        element.getAttribute("content")
      );
      expect(content).toBe("noindex");
    });

    it("is not listed in the site map, since config.askSearchEnginesNotToIndex is set to “true”", async () => {
      await page.goto(config.test.hostURL + "/sitemap.xml");
      const pageSource = await page.content();
      expect(pageSource).not.toMatch(config.host + albumURL);
    });
  } else {
    it("doesn’t ask search engines not to index it", async () => {
      await page.goto(config.test.hostURL + albumURL);
      const element = await page.$(`meta[name="robots"][content="noindex"]`);
      expect(element).toBeNull();
    });

    it("is listed in the site map", async () => {
      await page.goto(config.test.hostURL + "/sitemap.xml");
      const pageSource = await page.content();
      expect(pageSource).toMatch(config.host + albumURL);
    });
  }
});

describe("📗📗📗 Group album", () => {
  const albumURL = config.test.groupAlbumURL;

  it("has an open graph image, based on “host” specified in “_config.js”", async () => {
    await page.goto(config.test.hostURL + albumURL);

    if (config.host && config.host.indexOf("http") === 0) {
      const content = await page.$eval(`meta[property="og:image"]`, element =>
        element.getAttribute("content")
      );
      expect(content).toMatch(config.host);
    } else {
      return true;
    }
  });

  if (config.askSearchEnginesNotToIndex) {
    it("asks search engines not to index it, since config.askSearchEnginesNotToIndex is set to “true”", async () => {
      await page.goto(config.test.hostURL + albumURL);
      const content = await page.$eval(`meta[name="robots"]`, element =>
        element.getAttribute("content")
      );
      expect(content).toBe("noindex");
    });

    it("is not listed in the site map, since config.askSearchEnginesNotToIndex is set to “true”", async () => {
      await page.goto(config.test.hostURL + "/sitemap.xml");
      const pageSource = await page.content();
      expect(pageSource).not.toMatch(config.host + albumURL);
    });
  } else {
    it("doesn’t ask search engines not to index it", async () => {
      await page.goto(config.test.hostURL + albumURL);
      const element = await page.$(`meta[name="robots"][content="noindex"]`);
      expect(element).toBeNull();
    });

    it("is listed in the site map", async () => {
      await page.goto(config.test.hostURL + "/sitemap.xml");
      const pageSource = await page.content();
      expect(pageSource).toMatch(config.host + albumURL);
    });
  }
});

describe("📗=>📗 Child album", () => {
  const albumURL = config.test.groupAlbumChildURL;

  it("has an open graph image, based on “host” specified in “_config.js”", async () => {
    await page.goto(config.test.hostURL + albumURL);

    if (config.host && config.host.indexOf("http") === 0) {
      const content = await page.$eval(`meta[property="og:image"]`, element =>
        element.getAttribute("content")
      );
      expect(content).toMatch(config.host);
    } else {
      return true;
    }
  });

  if (config.askSearchEnginesNotToIndex) {
    it("asks search engines not to index it, since config.askSearchEnginesNotToIndex is set to “true”", async () => {
      await page.goto(config.test.hostURL + albumURL);
      const content = await page.$eval(`meta[name="robots"]`, element =>
        element.getAttribute("content")
      );
      expect(content).toBe("noindex");
    });

    it("is not listed in the site map, since config.askSearchEnginesNotToIndex is set to “true”", async () => {
      await page.goto(config.test.hostURL + "/sitemap.xml");
      const pageSource = await page.content();
      expect(pageSource).not.toMatch(config.host + albumURL);
    });
  } else {
    it("doesn’t ask search engines not to index it", async () => {
      await page.goto(config.test.hostURL + albumURL);
      const element = await page.$(`meta[name="robots"][content="noindex"]`);
      expect(element).toBeNull();
    });

    it("is listed in the site map", async () => {
      await page.goto(config.test.hostURL + "/sitemap.xml");
      const pageSource = await page.content();
      expect(pageSource).toMatch(config.host + albumURL);
    });
  }
});

describe("📒 Secret album", function() {
  it("is not listed on the home page", async () => {
    await page.goto(config.test.hostURL + config.test.homeURL);
    const element = await page.$(`a[href*="${config.test.secretAlbumURL}"]`);
    expect(element).toBe(null);
  });

  it("asks search engines not to index it", async () => {
    await page.goto(config.test.hostURL + config.test.secretAlbumURL);
    const content = await page.$eval(`meta[name="robots"]`, element =>
      element.getAttribute("content")
    );
    expect(content).toBe("noindex");
  });

  it("is not listed in the site map", async () => {
    await page.goto(config.test.hostURL + "/sitemap.xml");
    const pageSource = await page.content();
    expect(pageSource).not.toMatch(config.host + config.test.secretAlbumURL);
  });
});

describe("🖼  Picture", () => {
  const url = config.test.pictureURL;

  it("has an open graph image, based on “host” specified in “_config.js”", async () => {
    await page.goto(config.test.hostURL + url);

    if (config.host && config.host.indexOf("http") === 0) {
      const content = await page.$eval(`meta[property="og:image"]`, element =>
        element.getAttribute("content")
      );
      expect(content).toMatch(config.host);
    } else {
      return true;
    }
  });

  if (config.askSearchEnginesNotToIndex) {
    it("asks search engines not to index it, since config.askSearchEnginesNotToIndex is set to “true”", async () => {
      await page.goto(config.test.hostURL + url);
      const content = await page.$eval(`meta[name="robots"]`, element =>
        element.getAttribute("content")
      );
      expect(content).toBe("noindex");
    });

    it("is not listed in the site map, since config.askSearchEnginesNotToIndex is set to “true”", async () => {
      await page.goto(config.test.hostURL + "/sitemap.xml");
      const pageSource = await page.content();
      expect(pageSource).not.toMatch(config.host + url);
    });
  } else {
    it("doesn’t ask search engines not to index it", async () => {
      await page.goto(config.test.hostURL + url);
      const element = await page.$(`meta[name="robots"][content="noindex"]`);
      expect(element).toBeNull();
    });

    it("is listed in the site map", async () => {
      await page.goto(config.test.hostURL + "/sitemap.xml");
      const pageSource = await page.content();
      expect(pageSource).toMatch(config.host + url);
    });
  }
});

describe("🗺  Site map", function() {
  if (config.askSearchEnginesNotToIndex) {
    it("is not referenced by robots.txt, since config.askSearchEnginesNotToIndex is set to “true”", async () => {
      const response = await page.goto(config.test.hostURL + "/robots.txt");
      if (response.status() !== 404) {
        const pageSource = await page.content();
        expect(pageSource).not.toMatch("sitemap.xml");
      } else {
        expect(response.status()).toBe(404);
      }
    });

    it("does not exist, since config.askSearchEnginesNotToIndex is set to “true”", async () => {
      const response = await page.goto(config.test.hostURL + "/sitemap.xml");
      expect(response.status()).toBe(404);
    });
  } else {
    it("is referenced by robots.txt", async () => {
      await page.goto(config.test.hostURL + "/robots.txt");
      const pageSource = await page.content();
      expect(pageSource).toMatch("sitemap.xml");
    });
  }
});
