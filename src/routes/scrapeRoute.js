const express = require("express");
const router = express.Router();
const puppeteer = require("puppeteer");

const searchProducts = require("../scrapper/searchScraper");
const scrapeProductSeller = require("../scrapper/productScraper");
const scrapeSellerProfile = require("../scrapper/sellerScraper");
const { loadCookies } = require("../utils/cookieManager");
const amazonLeadModel = require("../models/amazonLeadModel");
const extractSellerId = require("../utils/extractSellerId");

router.get("/scrape", async (req, res) => {

  const startTime = Date.now();
  const keyword = req.query.keyword;

  console.log("==================================================");
  console.log("🚀 New scraping request");
  console.log("Keyword:", keyword);

  if (!keyword) {
    console.log("❌ Keyword missing");
    return res.status(400).json({ error: "Keyword required" });
  }

  let browser;

  try {

    console.log("🌐 Launching browser...");

    browser = await puppeteer.launch({
      headless: "new",
      executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox"
      ]
    });

    console.log("✅ Browser launched");

    const page = await browser.newPage();

    console.log("🍪 Loading cookies...");
    await loadCookies(page);
    console.log("✅ Cookies loaded");

    console.log("🌍 Opening Amazon homepage");

    await page.goto("https://www.amazon.co.uk", {
      waitUntil: "domcontentloaded"
    });

    console.log("🔎 Searching products...");

    const productLinks = await searchProducts(page, keyword);

    console.log("📦 Total products found:", productLinks.length);

    const results = [];

    let index = 0;

    for (const link of productLinks) {

      index++;

      console.log("--------------------------------------------------");
      console.log(`📦 Product ${index}/${productLinks.length}`);
      console.log("URL:", link);

      try {

        // =========================
        // SCRAPE PRODUCT SELLER
        // =========================

        console.log("🛒 Extracting seller from product page...");

        const sellerInfo = await scrapeProductSeller(page, link);

        if (!sellerInfo) {
          console.log("⚠️ Seller info returned null");
          continue;
        }

        console.log("Seller Info:", sellerInfo);

        if (!sellerInfo?.sellerLink) {
          console.log("⚠️ Seller link not found — skipping product");
          continue;
        }

        // =========================
        // SCRAPE SELLER PROFILE
        // =========================

        console.log("🏪 Opening seller profile...");

        const sellerProfile = await scrapeSellerProfile(page, sellerInfo.sellerLink);

        if (!sellerProfile) {
          console.log("⚠️ Seller profile scraping failed");
          continue;
        }

        console.log("Seller Profile:", sellerProfile);

        if (!sellerProfile?.address) {
          console.log("⚠️ Seller address missing — skipping");
          continue;
        }

        const address = sellerProfile.address.toUpperCase();
        const postcode = sellerProfile.postcode || "";

        const ukPostcodeRegex = /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i;

        console.log("📍 Seller Address:", address);

        const isUK =
          ukPostcodeRegex.test(postcode) ||
          address.endsWith(", UK") ||
          address.endsWith(", GB") ||
          address.includes("UNITED KINGDOM");

        if (!isUK) {

          console.log("❌ Skipped non UK seller:", address);

          continue;

        }

        console.log("✅ Seller passed location filter");

        // =========================
        // SAVE RESULT
        // =========================

        const result = {
          productUrl: link,
          sellerName: sellerInfo.sellerName,
          fulfillment: sellerInfo.fulfillment,
          businessName: sellerProfile.businessName,
          address: sellerProfile.address,
          postcode: sellerProfile.postcode,
          sellerRating: sellerProfile.sellerRating,
          ratingPercentage: sellerProfile.ratingPercentage,
          totalRatings: sellerProfile.totalRatings,
          pageUrl: sellerProfile.pageUrl
        };

        const sellerId = extractSellerId(sellerProfile.pageUrl);

        if (!sellerId) {
          console.log("⚠️ Could not extract sellerId");
          continue;
        }

        try {

          const lead = await amazonLeadModel.findOneAndUpdate(

            { sellerId: sellerId }, // unique condition

            {
              sellerId,
              sellerName: sellerInfo.sellerName,
              sellerLink: sellerProfile.pageUrl,
              fulfillment: sellerInfo.fulfillment,
              businessName: sellerProfile.businessName,
              address: sellerProfile.address,
              postcode: sellerProfile.postcode,
              sellerRating: sellerProfile.sellerRating,
              ratingPercentage: sellerProfile.ratingPercentage,
              totalRatings: sellerProfile.totalRatings,
              productUrl: link
            },

            {
              upsert: true, // create if not exists
              new: true,
              setDefaultsOnInsert: true
            }

          );

          console.log("✅ Lead saved:", lead.businessName);

        } catch (err) {

          if (err.code === 11000) {

            console.log("⏩ Duplicate seller skipped");

          } else {

            console.log("❌ DB error:", err.message);

          }

        }

        console.log("🎯 Lead added:", result.businessName);

      } catch (productError) {

        console.log("❌ Error scraping product:", link);
        console.log(productError.message);
        console.log(productError.stack);

      }

    }

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log("==================================================");
    console.log("✅ Scraping finished");
    console.log("📊 Total Leads:", results.length);
    console.log("⏱️ Time Taken:", totalTime, "seconds");

    res.json(results);

  } catch (error) {

    console.log("❌ Critical scraping failure");
    console.log(error.message);
    console.log(error.stack);

    res.status(500).json({
      error: "Scraping failed",
      message: error.message
    });

  } finally {

    if (browser) {

      console.log("🧹 Closing browser...");

      await browser.close();

      console.log("✅ Browser closed");

    }

  }

});

module.exports = router;