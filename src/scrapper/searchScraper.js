// module.exports = async function searchProducts(page, keyword) {

//   const MAX_PAGES = 5; // how many pages to scrape
//   const allLinks = new Set();

//   console.log("🔎 Searching Amazon UK for:", keyword);

//   for (let pageNumber = 1; pageNumber <= MAX_PAGES; pageNumber++) {

//     const url = `https://www.amazon.co.uk/s?k=${encodeURIComponent(keyword)}&page=${pageNumber}`;

//     console.log("------------------------------------------------");
//     console.log(`📄 Opening search page ${pageNumber}`);
//     console.log(url);

//     await page.goto(url, {
//       waitUntil: "domcontentloaded",
//       timeout: 120000
//     });

//     // Random delay (anti bot)
//     const delay = Math.floor(Math.random() * 3000) + 4000;
//     console.log(`⏳ Waiting ${delay}ms to mimic human`);
//     await new Promise(r => setTimeout(r, delay));

//     // Detect CAPTCHA
//     const captcha = await page.$('form[action="/errors/validateCaptcha"]');

//     if (captcha) {
//       console.log("🚨 CAPTCHA detected — waiting 30 seconds...");
//       await new Promise(r => setTimeout(r, 30000));
//       continue;
//     }

//     // Human-like scrolling
//     await autoScroll(page);

//     const links = await page.evaluate(() => {

//       const urls = new Set();

//       document.querySelectorAll('a[href*="/dp/"]').forEach(el => {

//         if (!el.href) return;

//         const clean = el.href.split("?")[0];

//         if (clean.includes("/dp/")) {
//           urls.add(clean);
//         }

//       });

//       return Array.from(urls);

//     });

//     console.log(`📦 Products found on page ${pageNumber}:`, links.length);

//     links.forEach(link => allLinks.add(link));

//   }

//   console.log("================================================");
//   console.log("✅ Total unique product links collected:", allLinks.size);

//   return Array.from(allLinks);

// };

// async function autoScroll(page) {

//   await page.evaluate(async () => {

//     await new Promise((resolve) => {

//       let totalHeight = 0;
//       const distance = 300;

//       const timer = setInterval(() => {

//         const scrollHeight = document.body.scrollHeight;

//         window.scrollBy(0, distance);

//         totalHeight += distance;

//         if (totalHeight >= scrollHeight) {

//           clearInterval(timer);
//           resolve();

//         }

//       }, 200);

//     });

//   });

// }


const { getRandomAgent } = require("../utils/browserManager");

const MAX_PAGES = 5;

module.exports = async function searchProducts(page, keyword) {

  const allLinks = new Set();

  await page.setUserAgent(getRandomAgent());

  console.log("Searching Amazon UK for:", keyword);

  for (let pageNum = 1; pageNum <= MAX_PAGES; pageNum++) {

    const url = `https://www.amazon.co.uk/s?k=${encodeURIComponent(keyword)}&page=${pageNum}`;

    console.log(`Opening search page ${pageNum}:`, url);

    const loaded = await safeGoto(page, url);

    if (!loaded) {
      console.log(`Page ${pageNum} failed to load — skipping`);
      continue;
    }

    await randomDelay(4000, 7000);

    const hasCaptcha = await page.$('form[action="/errors/validateCaptcha"]');

    if (hasCaptcha) {
      console.log("CAPTCHA hit on search page — waiting 45 seconds");
      await randomDelay(45000, 50000);
      pageNum--; // retry same page
      continue;
    }

    // check if Amazon returned no results / redirected us away
    const noResults = await page.$(".s-no-outline");

    if (!noResults) {
      console.log(`Page ${pageNum} looks empty or invalid`);
    }

    await autoScroll(page);

    const links = await page.evaluate(() => {

      const found = new Set();

      document.querySelectorAll('a[href*="/dp/"]').forEach(el => {

        if (!el.href) return;

        // strip query params and fragment
        const url = new URL(el.href);
        const clean = url.origin + url.pathname;

        if (clean.includes("/dp/")) {
          found.add(clean);
        }

      });

      return [...found];

    });

    console.log(`Found ${links.length} products on page ${pageNum}`);

    links.forEach(l => allLinks.add(l));

    // don't hammer pages back to back
    await randomDelay(2000, 4000);

  }

  console.log("Total unique products found:", allLinks.size);

  return [...allLinks];

};

// ─── Helpers ──────────────────────────────────────────────

async function safeGoto(page, url, retries = 2) {

  for (let attempt = 1; attempt <= retries; attempt++) {

    try {

      await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 60000
      });

      return true;

    } catch (err) {

      console.log(`Navigation failed (attempt ${attempt}):`, err.message);

      if (attempt < retries) {
        await randomDelay(3000, 6000);
      }

    }

  }

  return false;

}

async function autoScroll(page) {

  await page.evaluate(async () => {

    await new Promise(resolve => {

      let scrolled = 0;
      const step = 250;

      const interval = setInterval(() => {

        window.scrollBy(0, step);
        scrolled += step;

        if (scrolled >= document.body.scrollHeight) {
          clearInterval(interval);
          resolve();
        }

      }, 150 + Math.random() * 100);

    });

  });

}

function randomDelay(min, max) {
  const ms = Math.floor(Math.random() * (max - min)) + min;
  return new Promise(r => setTimeout(r, ms));
}