// module.exports = async function scrapeProductSeller(page, productUrl) {

//   await page.goto(productUrl, {
//     waitUntil: "domcontentloaded",
//     timeout: 120000
//   });

//   await new Promise(r => setTimeout(r, 3000));

//   const data = await page.evaluate(() => {

//     const sellerEl = document.querySelector("#sellerProfileTriggerId");

//     let fulfillment = "Unknown";

//     const merchantInfo = document.querySelector("#merchant-info");

//     if (merchantInfo) {

//       const text = merchantInfo.innerText.toLowerCase();

//       if (text.includes("amazon.com")) {
//         fulfillment = "Vendor";
//       }
//       else if (text.includes("fulfilled by amazon")) {
//         fulfillment = "FBA";
//       }
//       else if (text.includes("ships from") && text.includes("sold by")) {
//         fulfillment = "FBM";
//       }

//     }

//     return {

//       sellerName: sellerEl ? sellerEl.innerText.trim() : null,
//       sellerLink: sellerEl ? sellerEl.href : null,
//       fulfillment

//     };

//   });

//   return data;

// };


// module.exports = async function scrapeProductSeller(page, productUrl) {

//   await page.goto(productUrl, {
//     waitUntil: "domcontentloaded",
//     timeout: 120000
//   });

//   await new Promise(r => setTimeout(r, 3000));

//   const data = await page.evaluate(() => {

//     let sellerName = null;
//     let sellerLink = null;
//     let shipsFrom = "";
//     let soldBy = "";
//     let fulfillment = "Unknown";

//     // SELLER
//     const sellerEl = document.querySelector("#sellerProfileTriggerId");

//     if (sellerEl) {
//       sellerName = sellerEl.innerText.trim();
//       sellerLink = sellerEl.href;
//       soldBy = sellerName;
//     }

//     // SHIPS FROM
//     const shipsFromEl = document.querySelector(
//       "#fulfillerInfoFeature_feature_div .offer-display-feature-text-message"
//     );

//     if (shipsFromEl) {
//       shipsFrom = shipsFromEl.innerText.trim();
//     }

//     // FULFILLMENT DETECTION
//     if (shipsFrom.toLowerCase().includes("amazon") && soldBy.toLowerCase().includes("amazon")) {
//       fulfillment = "Vendor";
//     }
//     else if (shipsFrom.toLowerCase().includes("amazon")) {
//       fulfillment = "FBA";
//     }
//     else {
//       fulfillment = "FBM";
//     }

//     return {
//       sellerName,
//       sellerLink,
//       shipsFrom,
//       soldBy,
//       fulfillment
//     };

//   });

//   return data;

// };


// module.exports = async function scrapeProductSeller(page, productUrl) {

//   try {

//     // console.log("------------------------------------------------");
//     // console.log("🛒 Opening product page:");
//     // console.log(productUrl);

//     // await page.goto(productUrl, {
//     //   waitUntil: "domcontentloaded",
//     //   timeout: 120000
//     // });

//     // await new Promise(r => setTimeout(r, 3000));

//     // const data = await page.evaluate(() => {

//     //   const debug = {
//     //     sellerSelectorFound: false,
//     //     shipsFromSelectorFound: false
//     //   };

//     //   let sellerName = null;
//     //   let sellerLink = null;
//     //   let shipsFrom = "";
//     //   let soldBy = "";
//     //   let fulfillment = "Unknown";

//     //   // ===============================
//     //   // SELLER SELECTORS (Multiple)
//     //   // ===============================

//     //   const sellerSelectors = [
//     //     "#sellerProfileTriggerId",
//     //     "#bylineInfo",
//     //     "#merchantInfo a"
//     //   ];

//     //   let sellerEl = null;

//     //   for (const selector of sellerSelectors) {

//     //     const el = document.querySelector(selector);

//     //     if (el) {
//     //       sellerEl = el;
//     //       debug.sellerSelectorFound = selector;
//     //       break;
//     //     }

//     //   }

//     //   if (sellerEl) {

//     //     sellerName = sellerEl.innerText.trim();

//     //     if (sellerEl.href) {
//     //       sellerLink = sellerEl.href;
//     //     }

//     //     soldBy = sellerName;

//     //   }

//     //   // ===============================
//     //   // SHIPS FROM
//     //   // ===============================

//     //   const shipsFromEl = document.querySelector(
//     //     "#fulfillerInfoFeature_feature_div .offer-display-feature-text-message"
//     //   );

//     //   if (shipsFromEl) {

//     //     shipsFrom = shipsFromEl.innerText.trim();
//     //     debug.shipsFromSelectorFound = true;

//     //   }

//     //   // ===============================
//     //   // FULFILLMENT DETECTION
//     //   // ===============================

//     //   const ships = shipsFrom.toLowerCase();
//     //   const sold = soldBy.toLowerCase();

//     //   if (ships.includes("amazon") && sold.includes("amazon")) {

//     //     fulfillment = "Vendor";

//     //   }
//     //   else if (ships.includes("amazon")) {

//     //     fulfillment = "FBA";

//     //   }
//     //   else if (sold) {

//     //     fulfillment = "FBM";

//     //   }

//     //   if (sellerLink) {
//     //     sellerLink = sellerLink.replace("amazon.com", "amazon.co.uk");
//     //   }

//     //   return {
//     //     sellerName,
//     //     sellerLink,
//     //     shipsFrom,
//     //     soldBy,
//     //     fulfillment
//     //   };

//     //   // return {
//     //   //   sellerName,
//     //   //   sellerLink,
//     //   //   shipsFrom,
//     //   //   soldBy,
//     //   //   fulfillment,
//     //   //   debug
//     //   // };

//     // });

//     // // ===============================
//     // // NODE SIDE DEBUG
//     // // ===============================

//     // console.log("🔎 Seller extraction result:");

//     // console.log({
//     //   sellerName: data.sellerName,
//     //   sellerLink: data.sellerLink,
//     //   shipsFrom: data.shipsFrom,
//     //   fulfillment: data.fulfillment
//     // });

//     // if (!data.sellerName) {
//     //   console.log("⚠️ WARNING: Seller name not found");
//     // }

//     // if (!data.sellerLink) {
//     //   console.log("⚠️ WARNING: Seller link not found");
//     // }

//     // if (!data.shipsFrom) {
//     //   console.log("⚠️ WARNING: Ships From info missing");
//     // }

//     // console.log("🧠 Debug Info:", data.debug);

//     // return data;


//     console.log("------------------------------------------------");
//     console.log("🛒 Opening product page:");
//     console.log(productUrl);

//     await page.goto(productUrl, {
//       waitUntil: "domcontentloaded",
//       timeout: 120000
//     });

//     await new Promise(r => setTimeout(r, 3000));

//     const data = await page.evaluate(() => {

//       let sellerName = null;
//       let sellerLink = null;
//       let shipsFrom = "";
//       let soldBy = "";
//       let fulfillment = "Unknown";

//       // ===== SELLER PROFILE LINK =====

//       const merchantInfo = document.querySelector("#merchantInfo");

//       if (merchantInfo) {

//         const sellerAnchor = merchantInfo.querySelector("a");

//         if (sellerAnchor) {

//           sellerName = sellerAnchor.innerText.trim();
//           sellerLink = sellerAnchor.href;
//           soldBy = sellerName;

//         }

//       }

//       // ===== SHIPS FROM =====

//       const shipsFromEl = document.querySelector(
//         "#fulfillerInfoFeature_feature_div .offer-display-feature-text-message"
//       );

//       if (shipsFromEl) {
//         shipsFrom = shipsFromEl.innerText.trim();
//       }

//       // ===== FULFILLMENT DETECTION =====

//       const ships = shipsFrom.toLowerCase();
//       const sold = soldBy.toLowerCase();

//       if (ships.includes("amazon") && sold.includes("amazon")) {
//         fulfillment = "Vendor";
//       }
//       else if (ships.includes("amazon")) {
//         fulfillment = "FBA";
//       }
//       else if (sold) {
//         fulfillment = "FBM";
//       }

//       return {
//         sellerName,
//         sellerLink,
//         shipsFrom,
//         soldBy,
//         fulfillment
//       };

//     });

//     // ===== FILTER BRAND STORES =====

//     if (data?.sellerLink && data.sellerLink.includes("/stores/")) {

//       console.log("⚠️ Brand store detected, skipping:");
//       console.log(data.sellerLink);

//       return null;

//     }

//     if (data?.sellerLink && !data.sellerLink.includes("/sp")) {

//       console.log("⚠️ Not a seller profile page, skipping:");
//       console.log(data.sellerLink);

//       return null;

//     }

//     console.log("🔎 Seller extraction result:");
//     console.log(data);

//     return data;

//   } catch (error) {

//     console.log("❌ Product scraping failed");
//     console.log("Product URL:", productUrl);
//     console.log("Error:", error.message);

//     return null;

//   }

// };



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