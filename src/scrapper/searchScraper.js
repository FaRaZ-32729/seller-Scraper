// module.exports = async function searchProducts(page, keyword) {

//   const url = `https://www.amazon.com/s?k=${encodeURIComponent(keyword)}`;

//   await page.setUserAgent(
//     "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"
//   );

//   await page.goto(url, {
//     waitUntil: "domcontentloaded",
//     timeout: 120000
//   });

//   await new Promise(r => setTimeout(r, 3000));

//   const links = await page.evaluate(() => {

//     const products = [];

//     document.querySelectorAll("a.a-link-normal.s-no-outline").forEach(el => {

//       if (el.href) products.push(el.href);

//     });

//     return products.slice(0, 10);

//   });

//   return links;

// };


// module.exports = async function searchProducts(page, keyword) {

//   // const url = `https://www.amazon.co.uk/s?k=${encodeURIComponent(keyword)}`;

//   const url = `https://www.amazon.co.uk/s?k=${encodeURIComponent(keyword)}`;

//   await page.goto(url, {
//     waitUntil: "domcontentloaded",
//     timeout: 120000
//   });

//   await new Promise(r => setTimeout(r, 4000));

//   const links = await page.evaluate(() => {

//     const urls = [];

//     document.querySelectorAll('a[href*="/dp/"]').forEach(el => {

//       const link = el.href.split("?")[0];

//       if (!urls.includes(link)) {
//         urls.push(link);
//       }

//     });

//     return urls.slice(0, 20);

//   });

//   return links;

// };



module.exports = async function searchProducts(page, keyword) {

  const MAX_PAGES = 5; // how many pages to scrape
  const allLinks = new Set();

  console.log("🔎 Searching Amazon UK for:", keyword);

  for (let pageNumber = 1; pageNumber <= MAX_PAGES; pageNumber++) {

    const url = `https://www.amazon.co.uk/s?k=${encodeURIComponent(keyword)}&page=${pageNumber}`;

    console.log("------------------------------------------------");
    console.log(`📄 Opening search page ${pageNumber}`);
    console.log(url);

    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 120000
    });

    // Random delay (anti bot)
    const delay = Math.floor(Math.random() * 3000) + 4000;
    console.log(`⏳ Waiting ${delay}ms to mimic human`);
    await new Promise(r => setTimeout(r, delay));

    // Detect CAPTCHA
    const captcha = await page.$('form[action="/errors/validateCaptcha"]');

    if (captcha) {
      console.log("🚨 CAPTCHA detected — waiting 30 seconds...");
      await new Promise(r => setTimeout(r, 30000));
      continue;
    }

    // Human-like scrolling
    await autoScroll(page);

    const links = await page.evaluate(() => {

      const urls = new Set();

      document.querySelectorAll('a[href*="/dp/"]').forEach(el => {

        if (!el.href) return;

        const clean = el.href.split("?")[0];

        if (clean.includes("/dp/")) {
          urls.add(clean);
        }

      });

      return Array.from(urls);

    });

    console.log(`📦 Products found on page ${pageNumber}:`, links.length);

    links.forEach(link => allLinks.add(link));

  }

  console.log("================================================");
  console.log("✅ Total unique product links collected:", allLinks.size);

  return Array.from(allLinks);

};

async function autoScroll(page) {

  await page.evaluate(async () => {

    await new Promise((resolve) => {

      let totalHeight = 0;
      const distance = 300;

      const timer = setInterval(() => {

        const scrollHeight = document.body.scrollHeight;

        window.scrollBy(0, distance);

        totalHeight += distance;

        if (totalHeight >= scrollHeight) {

          clearInterval(timer);
          resolve();

        }

      }, 200);

    });

  });

}