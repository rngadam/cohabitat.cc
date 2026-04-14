const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    // Navigate to the local server
    await page.goto("http://localhost:8080/index.html");

    // Wait for the images and text to load
    await page.waitForSelector('h1');

    // Take a full page screenshot to verify changes
    await page.screenshot({ path: "screenshots/index_changes.png", fullPage: true });

    await browser.close();
})();
