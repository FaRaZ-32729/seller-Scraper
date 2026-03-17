const { launchBrowser } = require("../utils/browserManager");
const searchProducts = require("../scrapper/searchScraper");
const scrapeProductSeller = require("../scrapper/productScraper");
const scrapeSellerProfile = require("../scrapper/sellerScraper");
const { loadCookies } = require("../utils/cookieManager");
const AmazonLead = require("../models/amazonLeadModel");
const extractSellerId = require("../utils/extractSellerId");

// ─── Private helpers ──────────────────────────────────────

function checkIfUKSeller(address, postcode) {

    const ukPostcode = /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i;
    const upper = (address || "").toUpperCase();

    return (
        ukPostcode.test((postcode || "").trim()) ||
        upper.endsWith(", UK") ||
        upper.endsWith(", GB") ||
        upper.includes("UNITED KINGDOM") ||
        upper.includes(", ENGLAND") ||
        upper.includes(", SCOTLAND") ||
        upper.includes(", WALES")
    );

}

async function upsertLead(data) {

    try {

        return await AmazonLead.findOneAndUpdate(
            { sellerId: data.sellerId },
            data,
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

    } catch (err) {

        if (err.code === 11000) return null;
        console.log("DB error:", err.message);
        return null;

    }

}

function send(res, event, data) {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

// ─────────────────────────────────────────────────────────
// Controller: streamScrape
// GET /api/scrape/stream?keyword=xxx&pages=5
// ─────────────────────────────────────────────────────────

async function streamScrape(req, res) {

    const keyword = req.query.keyword;
    const maxPages = Math.min(parseInt(req.query.pages) || 3, 20);
    const startTime = Date.now();

    // SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();

    // keep-alive ping every 20s
    const keepAlive = setInterval(() => res.write(": ping\n\n"), 20000);

    if (!keyword) {
        send(res, "error_event", { message: "Keyword is required" });
        clearInterval(keepAlive);
        res.end();
        return;
    }

    send(res, "log", { message: `Keyword: "${keyword}" | Pages: ${maxPages}`, type: "info" });

    let browser;

    try {

        send(res, "log", { message: "Launching browser...", type: "dim" });

        browser = await launchBrowser();
        const page = await browser.newPage();

        await loadCookies(page);

        await page.goto("https://www.amazon.co.uk", {
            waitUntil: "domcontentloaded",
            timeout: 60000
        });

        send(res, "log", { message: "Amazon session ready", type: "success" });
        send(res, "log", { message: "Searching for product links...", type: "dim" });

        const productLinks = await searchProducts(page, keyword, maxPages);

        send(res, "product_count", { total: productLinks.length });

        let leadsFound = 0;

        for (let i = 0; i < productLinks.length; i++) {

            const link = productLinks[i];

            send(res, "scanning", { index: i + 1, total: productLinks.length });
            send(res, "log", { message: `[${i + 1}/${productLinks.length}] ${link}`, type: "dim" });

            try {

                const sellerInfo = await scrapeProductSeller(page, link);

                if (!sellerInfo?.sellerLink) {
                    send(res, "skip", { reason: "No seller link — skipping" });
                    continue;
                }

                const sellerProfile = await scrapeSellerProfile(page, sellerInfo.sellerLink);

                if (!sellerProfile?.address) {
                    send(res, "skip", { reason: "No address — skipping" });
                    continue;
                }

                if (!checkIfUKSeller(sellerProfile.address, sellerProfile.postcode)) {
                    send(res, "skip", { reason: `Non-UK seller: ${sellerProfile.address}` });
                    continue;
                }

                const sellerId = extractSellerId(sellerProfile.pageUrl);

                if (!sellerId) {
                    send(res, "skip", { reason: "Could not extract sellerId — skipping" });
                    continue;
                }

                const leadData = {
                    sellerId,
                    sellerName: sellerInfo.sellerName,
                    sellerLink: sellerProfile.pageUrl,
                    fulfillment: sellerInfo.fulfillment,
                    businessName: sellerProfile.businessName || null,
                    address: sellerProfile.address || null,
                    postcode: sellerProfile.postcode || null,
                    phoneNumber: sellerProfile.phoneNumber || null,
                    email: sellerProfile.email || null,
                    sellerRating: sellerProfile.sellerRating || null,
                    ratingPercentage: sellerProfile.ratingPercentage || null,
                    totalRatings: sellerProfile.totalRatings || null,
                    productUrl: link
                };

                await upsertLead(leadData);

                leadsFound++;

                send(res, "lead", leadData);

            } catch (err) {

                send(res, "log", { message: `Error on product ${i + 1}: ${err.message}`, type: "error" });

            }

        }

        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

        send(res, "done", { totalLeads: leadsFound, timeTaken: elapsed + "s" });

    } catch (err) {

        send(res, "error_event", { message: err.message });

    } finally {

        clearInterval(keepAlive);
        if (browser) await browser.close();
        res.end();

    }

}

// ─────────────────────────────────────────────────────────
// Controller: getLeads
// GET /api/scrape/leads
// ─────────────────────────────────────────────────────────

async function getLeads(req, res) {

    try {

        const {
            page = 1,
            limit = 20,
            fulfillment,
            search
        } = req.query;

        const filter = {};

        if (fulfillment) filter.fulfillment = fulfillment;

        if (search) {
            const regex = new RegExp(search, "i");
            filter.$or = [
                { sellerName: regex },
                { businessName: regex },
                { postcode: regex },
                { address: regex },
                { email: regex }
            ];
        }

        const skip = (Number(page) - 1) * Number(limit);
        const total = await AmazonLead.countDocuments(filter);
        const leads = await AmazonLead
            .find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit))
            .lean();

        res.json({ total, page: Number(page), limit: Number(limit), leads });

    } catch (err) {

        res.status(500).json({ error: err.message });

    }

}

module.exports = { streamScrape, getLeads };