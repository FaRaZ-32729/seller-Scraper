// const express = require("express");
// const router = express.Router();
// const puppeteer = require("puppeteer");

// const searchProducts = require("../scrapper/searchScraper");
// const scrapeProductSeller = require("../scrapper/productScraper");
// const scrapeSellerProfile = require("../scrapper/sellerScraper");
// const { loadCookies } = require("../utils/cookieManager");   // ADD THIS

// router.get("/scrape", async (req, res) => {

//   const keyword = req.query.keyword;

//   if (!keyword) {
//     return res.status(400).json({ error: "Keyword required" });
//   }

//   // const browser = await puppeteer.launch({
//   //   headless: false,
//   //   executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
//   //   args: [
//   //     "--start-maximized",
//   //     "--no-sandbox",
//   //     "--disable-setuid-sandbox",
//   //     "--disable-dev-shm-usage",
//   //     "--disable-blink-features=AutomationControlled"
//   //   ],
//   //   defaultViewport: null
//   // });

//   const browser = await puppeteer.launch({
//     headless: "new",
//     executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
//     args: [
//       "--no-sandbox",
//       "--disable-setuid-sandbox"
//     ]
//   });

//   const page = await browser.newPage();

//   try {

//     await page.setUserAgent(
//       "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
//     );

//     // LOAD COOKIES
//     await loadCookies(page);

//     // Open Amazon homepage to activate cookies
//     await page.goto("https://www.amazon.com", {
//       waitUntil: "domcontentloaded"
//     });

//     console.log("✅ Amazon session restored");

//     const productLinks = await searchProducts(page, keyword);

//     const results = [];

//     for (let link of productLinks) {

//       const sellerInfo = await scrapeProductSeller(page, link);


//       if (sellerInfo?.sellerLink) {

//         const sellerProfile = await scrapeSellerProfile(page, sellerInfo.sellerLink);

//         results.push({
//           product: link,
//           sellerName: sellerInfo.sellerName,
//           businessName: sellerProfile.businessName,
//           address: sellerProfile.address
//         });

//       }

//     }

//     await browser.close();

//     res.json(results);

//   } catch (err) {

//     await browser.close();
//     console.log(err);
//     res.status(500).json({ error: "Scraping failed" });

//   }

// });

// module.exports = router;


const express = require("express");
const router = express.Router();
const puppeteer = require("puppeteer");

const searchProducts = require("../scrapper/searchScraper");
const scrapeProductSeller = require("../scrapper/productScraper");
const scrapeSellerProfile = require("../scrapper/sellerScraper");
const { loadCookies } = require("../utils/cookieManager");

router.get("/scrape", async (req, res) => {

  const keyword = req.query.keyword;

  if (!keyword) {
    return res.status(400).json({ error: "Keyword required" });
  }

  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox"
    ]
  });

  const page = await browser.newPage();

  await loadCookies(page);

  await page.goto("https://www.amazon.com", {
    waitUntil: "domcontentloaded"
  });

  const productLinks = await searchProducts(page, keyword);

  const results = [];

  for (const link of productLinks) {

    try {

      const sellerInfo = await scrapeProductSeller(page, link);

      if (!sellerInfo?.sellerLink) continue;

      const sellerProfile = await scrapeSellerProfile(page, sellerInfo.sellerLink);

      results.push({
        productUrl: link,
        sellerName: sellerInfo.sellerName,
        fulfillment: sellerInfo.fulfillment,
        ...sellerProfile
      });

      console.log(results)

    } catch (err) {

      console.log("Error scraping:", link);

    }

  }

  await browser.close();
  console.log("scraping is closed");

  res.json(results);

});

module.exports = router;