// module.exports = async function scrapeProductSeller(page, productUrl) {

//   await page.goto(productUrl, {
//     waitUntil: "domcontentloaded",
//     timeout: 60000
//   });

//   const seller = await page.evaluate(() => {

//     const sellerElement = document.querySelector("#sellerProfileTriggerId");

//     if (!sellerElement) return null;

//     return {
//       sellerName: sellerElement.innerText,
//       sellerLink: sellerElement.href
//     };

//   });

//   return seller;

// };


module.exports = async function scrapeProductSeller(page, productUrl) {

  await page.goto(productUrl, {
    waitUntil: "domcontentloaded",
    timeout: 120000
  });

  await new Promise(r => setTimeout(r, 3000));

  const data = await page.evaluate(() => {

    const sellerEl = document.querySelector("#sellerProfileTriggerId");

    let fulfillment = "Unknown";

    const merchantInfo = document.querySelector("#merchant-info");

    if (merchantInfo) {

      const text = merchantInfo.innerText.toLowerCase();

      if (text.includes("amazon.com")) {
        fulfillment = "Vendor";
      }
      else if (text.includes("fulfilled by amazon")) {
        fulfillment = "FBA";
      }
      else if (text.includes("ships from") && text.includes("sold by")) {
        fulfillment = "FBM";
      }

    }

    return {

      sellerName: sellerEl ? sellerEl.innerText.trim() : null,
      sellerLink: sellerEl ? sellerEl.href : null,
      fulfillment

    };

  });

  return data;

};