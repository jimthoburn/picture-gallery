
import playwright from "playwright";
const { firefox, chromium, webkit, devices } = playwright;

(async () => {
  for (const browserType of ["chromium", "firefox", "webkit"]) {
    const browser = await playwright[browserType].launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto("http://localhost:4000/");
    await page.screenshot({ path: `example-${browserType}.png` });
    await browser.close();
  }
})();


const iPhone11 = devices['iPhone 11 Pro'];

(async () => {
  const browser = await webkit.launch();
  const context = await browser.newContext({
    viewport: iPhone11.viewport,
    userAgent: iPhone11.userAgent,
    geolocation: { longitude: 12.492507, latitude: 41.889938 },
    permissions: { 'https://www.google.com': ['geolocation'] }
  });
  const page = await context.newPage();
  await page.goto('https://maps.google.com');
  await page.click('text="Your location"');
  await page.waitForRequest(/.*preview\/pwa/);
  await page.screenshot({ path: 'colosseum-iphone.png' });
  await browser.close();
})();


const pixel2 = devices['Pixel 2'];

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: pixel2.viewport,
    userAgent: pixel2.userAgent,
    geolocation: { longitude: 12.492507, latitude: 41.889938 },
    permissions: { 'https://www.google.com': ['geolocation'] }
  });
  const page = await context.newPage();
  await page.goto('https://maps.google.com');
  await page.click('text="Your location"');
  await page.waitForRequest(/.*pwa\/net.js.*/);
  await page.screenshot({ path: 'colosseum-android.png' });
  await browser.close();
})();


(async () => {
  const browser = await firefox.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('http://localhost:4000/');
  const dimensions = await page.evaluate(() => {
    return {
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight,
      deviceScaleFactor: window.devicePixelRatio
    }
  })
  console.log(dimensions);

  await browser.close();
})();

