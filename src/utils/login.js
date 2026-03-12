const puppeteer = require("puppeteer");
const { saveCookies } = require("./cookieManager");

(async () => {

    const browser = await puppeteer.launch({
        headless: false,
        executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        args: [
            "--start-maximized",
            "--no-sandbox",
            "--disable-setuid-sandbox"
        ],
        defaultViewport: null
    });

    const page = await browser.newPage();

    await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
    );

    await page.goto("https://www.amazon.com", {
        waitUntil: "domcontentloaded",
        timeout: 120000
    });

    console.log("🔐 Please login manually in the opened browser.");
    console.log("After login press ENTER in this terminal.");

    // Wait for user input instead of waiting for selector
    await new Promise(resolve => {
        process.stdin.once("data", resolve);
    });

    await saveCookies(page);

    console.log("✅ Cookies saved successfully");

    await browser.close();

})();