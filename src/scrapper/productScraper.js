module.exports = async function scrapeProductSeller(page, productUrl) {

  await page.goto(productUrl, {
    waitUntil: "domcontentloaded",
    timeout: 60000
  });

  const seller = await page.evaluate(() => {

    const sellerElement = document.querySelector("#sellerProfileTriggerId");

    if (!sellerElement) return null;

    return {
      sellerName: sellerElement.innerText,
      sellerLink: sellerElement.href
    };

  });

  return seller;

};