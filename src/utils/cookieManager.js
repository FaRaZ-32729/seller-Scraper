const fs = require("fs");
const path = require("path");

const COOKIE_PATH = path.join(__dirname, "../cookies.json");

async function saveCookies(page) {
    const cookies = await page.cookies();
    fs.writeFileSync(COOKIE_PATH, JSON.stringify(cookies, null, 2));
}

async function loadCookies(page) {
    if (!fs.existsSync(COOKIE_PATH)) return;

    const cookies = JSON.parse(fs.readFileSync(COOKIE_PATH));

    await page.setCookie(...cookies);

    console.log("✅ Cookies loaded");
}

module.exports = { saveCookies, loadCookies };