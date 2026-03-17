// const express = require("express");
// const router = express.Router();

// const { launchBrowser } = require("../utils/browserManager");
// const searchProducts = require("../scrapper/searchScraper");
// const scrapeProductSeller = require("../scrapper/productScraper");
// const scrapeSellerProfile = require("../scrapper/sellerScraper");
// const { loadCookies } = require("../utils/cookieManager");
// const AmazonLead = require("../models/amazonLeadModel");
// const extractSellerId = require("../utils/extractSellerId");

// router.get("/scrape", async (req, res) => {

//   const startTime = Date.now();
//   const keyword = req.query.keyword;

//   console.log("==================================================");
//   console.log("New scraping request — keyword:", keyword);

//   if (!keyword) {
//     return res.status(400).json({ error: "Keyword is required" });
//   }

//   let browser;

//   try {

//     browser = await launchBrowser();
//     const page = await browser.newPage();

//     await loadCookies(page);

//     await page.goto("https://www.amazon.co.uk", {
//       waitUntil: "domcontentloaded",
//       timeout: 60000
//     });

//     console.log("Amazon session ready");

//     const productLinks = await searchProducts(page, keyword);
//     console.log("Total product links collected:", productLinks.length);

//     const results = [];

//     for (let i = 0; i < productLinks.length; i++) {

//       const link = productLinks[i];

//       console.log("--------------------------------------------------");
//       console.log(`Product ${i + 1}/${productLinks.length}`);

//       try {

//         const sellerInfo = await scrapeProductSeller(page, link);

//         if (!sellerInfo?.sellerLink) {
//           console.log("No seller link found — skipping");
//           continue;
//         }

//         const sellerProfile = await scrapeSellerProfile(page, sellerInfo.sellerLink);

//         if (!sellerProfile?.address) {
//           console.log("Seller address missing — skipping");
//           continue;
//         }

//         const isUK = checkIfUKSeller(sellerProfile.address, sellerProfile.postcode);

//         if (!isUK) {
//           console.log("Non-UK seller — skipping:", sellerProfile.address);
//           continue;
//         }

//         const sellerId = extractSellerId(sellerProfile.pageUrl);

//         if (!sellerId) {
//           console.log("Could not extract sellerId — skipping");
//           continue;
//         }

//         const leadData = {
//           sellerId,
//           sellerName: sellerInfo.sellerName,
//           sellerLink: sellerProfile.pageUrl,
//           fulfillment: sellerInfo.fulfillment,
//           businessName: sellerProfile.businessName,
//           address: sellerProfile.address,
//           email: sellerProfile.email,
//           phoneNumber: sellerProfile.phoneNumber,
//           postcode: sellerProfile.postcode,
//           sellerRating: sellerProfile.sellerRating,
//           ratingPercentage: sellerProfile.ratingPercentage,
//           totalRatings: sellerProfile.totalRatings,
//           productUrl: link
//         };

//         const saved = await upsertLead(leadData);

//         if (saved) {
//           results.push(leadData);
//           console.log("Lead saved:", leadData.businessName || leadData.sellerName);
//         }

//       } catch (err) {
//         console.log("Error on product:", link);
//         console.log(err.message);
//       }

//     }

//     const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

//     console.log("==================================================");
//     console.log("Scraping finished — leads collected:", results.length);
//     console.log("Time taken:", elapsed, "seconds");

//     return res.json({
//       keyword,
//       totalLeads: results.length,
//       timeTaken: elapsed + "s",
//       results
//     });

//   } catch (err) {

//     console.log("Critical failure:", err.message);
//     console.log(err.stack);

//     return res.status(500).json({
//       error: "Scraping failed",
//       message: err.message
//     });

//   } finally {

//     if (browser) {
//       await browser.close();
//       console.log("Browser closed");
//     }

//   }

// });

// // ─── Helpers ──────────────────────────────────────────────

// function checkIfUKSeller(address, postcode) {

//   const ukPostcodeRegex = /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i;
//   const upper = address.toUpperCase();

//   return (
//     ukPostcodeRegex.test(postcode?.trim()) ||
//     upper.endsWith(", UK") ||
//     upper.endsWith(", GB") ||
//     upper.includes("UNITED KINGDOM") ||
//     upper.includes(", ENGLAND") ||
//     upper.includes(", SCOTLAND") ||
//     upper.includes(", WALES")
//   );

// }

// async function upsertLead(data) {

//   try {

//     const lead = await AmazonLead.findOneAndUpdate(
//       { sellerId: data.sellerId },
//       data,
//       { upsert: true, new: true, setDefaultsOnInsert: true }
//     );

//     return lead;

//   } catch (err) {

//     if (err.code === 11000) {
//       console.log("Duplicate seller — skipping DB insert");
//       return null;
//     }

//     console.log("DB error:", err.message);
//     return null;

//   }

// }

// module.exports = router;





//new working

// const express = require("express");
// const router = express.Router();

// const { launchBrowser } = require("../utils/browserManager");
// const searchProducts = require("../scrapper/searchScraper");
// const scrapeProductSeller = require("../scrapper/productScraper");
// const scrapeSellerProfile = require("../scrapper/sellerScraper");
// const { loadCookies } = require("../utils/cookieManager");
// const AmazonLead = require("../models/amazonLeadModel");
// const extractSellerId = require("../utils/extractSellerId");

// // ─── Helpers ──────────────────────────────────────────────

// function checkIfUKSeller(address, postcode) {

//   const ukPostcode = /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i;
//   const upper = (address || "").toUpperCase();

//   return (
//     ukPostcode.test((postcode || "").trim()) ||
//     upper.endsWith(", UK") ||
//     upper.endsWith(", GB") ||
//     upper.includes("UNITED KINGDOM") ||
//     upper.includes(", ENGLAND") ||
//     upper.includes(", SCOTLAND") ||
//     upper.includes(", WALES")
//   );

// }

// async function upsertLead(data) {

//   try {

//     return await AmazonLead.findOneAndUpdate(
//       { sellerId: data.sellerId },
//       data,
//       { upsert: true, new: true, setDefaultsOnInsert: true }
//     );

//   } catch (err) {

//     if (err.code === 11000) return null;
//     console.log("DB error:", err.message);
//     return null;

//   }

// }

// // ─────────────────────────────────────────────────────────
// // SSE helper — sends a named event + JSON payload
// // ─────────────────────────────────────────────────────────

// function send(res, event, data) {
//   res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
// }

// // ─────────────────────────────────────────────────────────
// // GET /api/scrape/stream?keyword=xxx&pages=5
// // ─────────────────────────────────────────────────────────

// router.get("/scrape/stream", async (req, res) => {

//   const keyword = req.query.keyword;
//   const maxPages = Math.min(parseInt(req.query.pages) || 3, 10);
//   const startTime = Date.now();

//   // ── SSE headers ──
//   res.setHeader("Content-Type", "text/event-stream");
//   res.setHeader("Cache-Control", "no-cache");
//   res.setHeader("Connection", "keep-alive");
//   res.setHeader("X-Accel-Buffering", "no"); // disable nginx buffering if behind proxy
//   res.flushHeaders();

//   // Keep-alive ping every 20s so the connection doesn't drop
//   const keepAlive = setInterval(() => res.write(": ping\n\n"), 20000);

//   // ── Guard ──
//   if (!keyword) {
//     send(res, "error_event", { message: "Keyword is required" });
//     clearInterval(keepAlive);
//     res.end();
//     return;
//   }

//   send(res, "log", { message: `Keyword: "${keyword}" | Pages: ${maxPages}`, type: "info" });

//   let browser;

//   try {

//     send(res, "log", { message: "Launching browser...", type: "dim" });

//     browser = await launchBrowser();
//     const page = await browser.newPage();

//     await loadCookies(page);

//     await page.goto("https://www.amazon.co.uk", {
//       waitUntil: "domcontentloaded",
//       timeout: 60000
//     });

//     send(res, "log", { message: "Amazon session ready", type: "success" });

//     // ── Search ──

//     send(res, "log", { message: "Searching for product links...", type: "dim" });

//     const productLinks = await searchProducts(page, keyword, maxPages);

//     send(res, "product_count", { total: productLinks.length });

//     // ── Scrape each product ──

//     let leadsFound = 0;

//     for (let i = 0; i < productLinks.length; i++) {

//       const link = productLinks[i];

//       send(res, "scanning", { index: i + 1, total: productLinks.length });
//       send(res, "log", { message: `[${i + 1}/${productLinks.length}] ${link}`, type: "dim" });

//       try {

//         // ── Seller info ──
//         const sellerInfo = await scrapeProductSeller(page, link);

//         if (!sellerInfo?.sellerLink) {
//           send(res, "skip", { reason: `No seller link — skipping` });
//           continue;
//         }

//         // ── Seller profile ──
//         const sellerProfile = await scrapeSellerProfile(page, sellerInfo.sellerLink);

//         if (!sellerProfile?.address) {
//           send(res, "skip", { reason: `No address found — skipping` });
//           continue;
//         }

//         // ── Location filter ──
//         const isUK = checkIfUKSeller(sellerProfile.address, sellerProfile.postcode);

//         if (!isUK) {
//           send(res, "skip", { reason: `Non-UK seller skipped: ${sellerProfile.address}` });
//           continue;
//         }

//         // ── Seller ID ──
//         const sellerId = extractSellerId(sellerProfile.pageUrl);

//         if (!sellerId) {
//           send(res, "skip", { reason: "Could not extract sellerId — skipping" });
//           continue;
//         }

//         const leadData = {
//           sellerId,
//           sellerName: sellerInfo.sellerName,
//           sellerLink: sellerProfile.pageUrl,
//           fulfillment: sellerInfo.fulfillment,
//           businessName: sellerProfile.businessName || null,
//           address: sellerProfile.address || null,
//           postcode: sellerProfile.postcode || null,
//           phoneNumber: sellerProfile.phoneNumber || null,
//           email: sellerProfile.email || null,
//           sellerRating: sellerProfile.sellerRating || null,
//           ratingPercentage: sellerProfile.ratingPercentage || null,
//           totalRatings: sellerProfile.totalRatings || null,
//           productUrl: link
//         };

//         // ── Save to DB ──
//         await upsertLead(leadData);

//         leadsFound++;

//         // ── Send lead to frontend ──
//         send(res, "lead", leadData);

//       } catch (err) {

//         send(res, "log", { message: `Error on product ${i + 1}: ${err.message}`, type: "error" });

//       }

//     }

//     const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

//     send(res, "done", {
//       totalLeads: leadsFound,
//       timeTaken: elapsed + "s"
//     });

//   } catch (err) {

//     send(res, "error_event", { message: err.message });

//   } finally {

//     clearInterval(keepAlive);

//     if (browser) {
//       await browser.close();
//     }

//     res.end();

//   }

// });

// // ─────────────────────────────────────────────────────────
// // GET /api/scrape/leads — fetch all stored leads from DB
// // ─────────────────────────────────────────────────────────

// router.get("/scrape/leads", async (req, res) => {

//   try {

//     const { page = 1, limit = 50, fulfillment, hasEmail, hasPhone } = req.query;

//     const filter = {};

//     if (fulfillment) filter.fulfillment = fulfillment;
//     if (hasEmail === "1") filter.email = { $ne: null };
//     if (hasPhone === "1") filter.phoneNumber = { $ne: null };

//     const leads = await AmazonLead
//       .find(filter)
//       .sort({ createdAt: -1 })
//       .skip((page - 1) * limit)
//       .limit(Number(limit));

//     const total = await AmazonLead.countDocuments(filter);

//     res.json({ total, page: Number(page), leads });

//   } catch (err) {

//     res.status(500).json({ error: err.message });

//   }

// });





// // ─────────────────────────────────────────────────────────
// // GET /api/scrape/leads — fetch all leads from DB
// // ─────────────────────────────────────────────────────────

// router.get("/scrape/leads", async (req, res) => {

//   try {

//     const {
//       page = 1,
//       limit = 20,
//       fulfillment,
//       hasEmail,
//       hasPhone,
//       search
//     } = req.query;

//     const filter = {};

//     if (fulfillment) filter.fulfillment = fulfillment;
//     if (hasEmail === "1") filter.email = { $ne: null };
//     if (hasPhone === "1") filter.phoneNumber = { $ne: null };

//     // search across name, business name, postcode, address
//     if (search) {
//       const regex = new RegExp(search, "i");
//       filter.$or = [
//         { sellerName: regex },
//         { businessName: regex },
//         { postcode: regex },
//         { address: regex },
//         { email: regex }
//       ];
//     }

//     const skip = (Number(page) - 1) * Number(limit);
//     const total = await AmazonLead.countDocuments(filter);
//     const leads = await AmazonLead
//       .find(filter)
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(Number(limit))
//       .lean();

//     res.json({ total, page: Number(page), limit: Number(limit), leads });

//   } catch (err) {

//     res.status(500).json({ error: err.message });

//   }

// });

// module.exports = router;

const express = require("express");
const router = express.Router();

const { streamScrape, getLeads } = require("../controllers/scrapeController");

router.get("/scrape/stream", streamScrape);
router.get("/scrape/leads", getLeads);

module.exports = router;