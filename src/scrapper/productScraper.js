module.exports = async function scrapeProductSeller(page, productUrl) {

  try {

    console.log("------------------------------------------------");
    console.log("🛒 Opening product page:");
    console.log(productUrl);

    await page.goto(productUrl, {
      waitUntil: "domcontentloaded",
      timeout: 120000
    });

    await new Promise(r => setTimeout(r, 3000));

    const sellerData = await page.evaluate(() => {

      let sellerName = null;
      let sellerLink = null;
      let shipsFrom = "";
      let soldBy = "";
      let fulfillment = "Unknown";

      // =============================
      // LAYOUT 1 — merchantInfo
      // =============================

      const merchant = document.querySelector("#merchantInfo");

      if (merchant) {

        const a = merchant.querySelector("a");

        if (a) {
          sellerName = a.innerText.trim();
          sellerLink = a.href;
          soldBy = sellerName;
        }

      }

      // =============================
      // LAYOUT 2 — tabular-buybox
      // =============================

      if (!sellerLink) {

        const rows = document.querySelectorAll("#tabular-buybox tr");

        rows.forEach(row => {

          const header = row.querySelector("span.a-text-bold");

          if (!header) return;

          const title = header.innerText.trim().toLowerCase();

          if (title.includes("sold by")) {

            const a = row.querySelector("a");

            if (a) {
              sellerName = a.innerText.trim();
              sellerLink = a.href;
              soldBy = sellerName;
            }

          }

          if (title.includes("ships from")) {

            const span = row.querySelector("span");

            if (span) shipsFrom = span.innerText.trim();

          }

        });

      }

      // =============================
      // LAYOUT 3 — sellerProfileTrigger
      // =============================

      if (!sellerLink) {

        const sellerBtn = document.querySelector("#sellerProfileTriggerId");

        if (sellerBtn) {

          sellerName = sellerBtn.innerText.trim();
          sellerLink = sellerBtn.href;
          soldBy = sellerName;

        }

      }

      // =============================
      // FULFILLMENT DETECTION
      // =============================

      const ships = shipsFrom.toLowerCase();
      const sold = soldBy.toLowerCase();

      if (ships.includes("amazon") && sold.includes("amazon")) {
        fulfillment = "Vendor";
      }
      else if (ships.includes("amazon")) {
        fulfillment = "FBA";
      }
      else if (sold) {
        fulfillment = "FBM";
      }

      return {
        sellerName,
        sellerLink,
        shipsFrom,
        soldBy,
        fulfillment
      };

    });

    console.log("🔎 Seller extraction result:");
    console.log(sellerData);

    // =============================
    // FILTER BRAND STORES
    // =============================

    if (sellerData?.sellerLink && sellerData.sellerLink.includes("/stores/")) {

      console.log("⚠️ Brand store detected — skipping");

      return null;

    }

    if (!sellerData?.sellerLink) {

      console.log("⚠️ Seller link not found — layout unsupported");

      return null;

    }

    return sellerData;

  } catch (error) {

    console.log("❌ Product scraping failed");
    console.log(error.message);

    return null;

  }

};