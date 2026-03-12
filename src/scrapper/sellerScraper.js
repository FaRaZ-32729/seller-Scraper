module.exports = async function scrapeSellerProfile(page, sellerUrl) {

  await page.goto(sellerUrl, { waitUntil: "networkidle2" });

  const data = await page.evaluate(() => {

    const info = document.querySelector("#page-section-detail-seller-info");

    if (!info) return {};

    const text = info.innerText;

    const lines = text.split("\n");

    return {
      businessName: lines[0] || "",
      address: lines.slice(1).join(", ")
    };

  });

  return data;

};