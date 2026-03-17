const { launchBrowser }       = require("../utils/browserManager");
const scrapeCompanyOfficer    = require("../scrapper/companiesHouseScraper");
const AmazonLead              = require("../models/amazonLeadModel");

// ─────────────────────────────────────────────────────────
// Controller: verifyLead
// POST /api/verify/:id
//
// Looks up a single lead by ID, searches Companies House
// for the business owner, and saves the result back to DB.
// ─────────────────────────────────────────────────────────

async function verifyLead(req, res) {

  const { id } = req.params;

  try {

    const lead = await AmazonLead.findById(id);

    if (!lead) {
      return res.status(404).json({ error: "Lead not found" });
    }

    const searchName = lead.businessName || lead.sellerName;

    if (!searchName) {
      return res.status(400).json({ error: "Lead has no business name to look up" });
    }

    console.log("Verifying lead:", searchName);

    const browser = await launchBrowser();
    const page    = await browser.newPage();

    let result = null;

    try {

      result = await scrapeCompanyOfficer(page, searchName);

    } finally {

      await browser.close();

    }

    if (!result) {
      return res.status(404).json({ error: "No Companies House record found", searchName });
    }

    // save back to the lead document
    lead.ownerName        = result.ownerName;
    lead.ownerRole        = result.ownerRole;
    lead.companyNumber    = result.companyNumber;
    lead.companiesHouseUrl= result.companiesHouseUrl;
    lead.verifiedAt       = new Date();

    await lead.save();

    console.log("Lead verified:", lead.businessName, "→", result.ownerName);

    return res.json({
      success: true,
      leadId:  id,
      ownerName:         result.ownerName,
      ownerRole:         result.ownerRole,
      companyNumber:     result.companyNumber,
      companiesHouseUrl: result.companiesHouseUrl
    });

  } catch (err) {

    console.log("verifyLead error:", err.message);
    return res.status(500).json({ error: err.message });

  }

}

// ─────────────────────────────────────────────────────────
// Controller: verifyAllLeads
// POST /api/verify/batch
//
// SSE stream — verifies all unverified leads one by one
// and pushes progress events to the frontend.
// ─────────────────────────────────────────────────────────

async function verifyAllLeads(req, res) {

  // SSE headers
  res.setHeader("Content-Type",      "text/event-stream");
  res.setHeader("Cache-Control",     "no-cache");
  res.setHeader("Connection",        "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  const keepAlive = setInterval(() => res.write(": ping\n\n"), 20000);

  function send(event, data) {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  }

  let browser;

  try {

    // only process leads that haven't been verified yet
    const unverified = await AmazonLead.find({
      $or: [
        { ownerName: null },
        { ownerName: { $exists: false } }
      ]
    }).select("_id businessName sellerName").lean();

    send("total", { count: unverified.length });

    if (unverified.length === 0) {
      send("done", { message: "All leads already verified" });
      clearInterval(keepAlive);
      res.end();
      return;
    }

    send("log", { message: `Verifying ${unverified.length} leads...`, type: "info" });

    browser = await launchBrowser();
    const page = await browser.newPage();

    let verified = 0;
    let failed   = 0;

    for (let i = 0; i < unverified.length; i++) {

      const lead       = unverified[i];
      const searchName = lead.businessName || lead.sellerName;

      send("progress", { index: i + 1, total: unverified.length, name: searchName });

      try {

        const result = await scrapeCompanyOfficer(page, searchName);

        if (result) {

          await AmazonLead.findByIdAndUpdate(lead._id, {
            ownerName:         result.ownerName,
            ownerRole:         result.ownerRole,
            companyNumber:     result.companyNumber,
            companiesHouseUrl: result.companiesHouseUrl,
            verifiedAt:        new Date()
          });

          verified++;

          send("verified", {
            leadId:    lead._id,
            name:      searchName,
            ownerName: result.ownerName,
            ownerRole: result.ownerRole
          });

        } else {

          failed++;
          send("not_found", { leadId: lead._id, name: searchName });

        }

      } catch (err) {

        failed++;
        send("log", { message: `Error on ${searchName}: ${err.message}`, type: "error" });

      }

    }

    send("done", { verified, failed, total: unverified.length });

  } catch (err) {

    send("error", { message: err.message });

  } finally {

    clearInterval(keepAlive);
    if (browser) await browser.close();
    res.end();

  }

}

module.exports = { verifyLead, verifyAllLeads };