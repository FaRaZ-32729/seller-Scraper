module.exports = async function scrapeSellerProfile(page, sellerUrl) {

  await page.goto(sellerUrl, {
    waitUntil: "domcontentloaded",
    timeout: 120000
  });

  await new Promise(r => setTimeout(r, 3000));
  const data = await page.evaluate(() => {

    const result = {
      businessName: "",
      address: "",
      postcode: "",
      sellerRating: "",
      ratingPercentage: "",
      totalRatings: "",
      pageUrl: window.location.href
    };

    const info = document.querySelector("#page-section-detail-seller-info");

    if (info) {

      const text = info.innerText;

      // Extract Business Name
      const nameMatch = text.match(/Business Name:\s*(.*)/i);
      if (nameMatch) {
        result.businessName = nameMatch[1].trim();
      }

      // Extract Address block
      const addressMatch = text.match(/Business Address:\s*([\s\S]*)/i);
      if (addressMatch) {

        const addressText = addressMatch[1].trim();
        result.address = addressText.replace(/\n/g, ", ");

        // Extract ZIP / Postal Code
        const zipMatch = addressText.match(/\b\d{5}(-\d{4})?\b/);
        if (zipMatch) {
          result.postcode = zipMatch[0];
        }

      }

    }

    // Extract feedback section
    const feedback = document.body.innerText;

    const percentMatch = feedback.match(/(\d+)%\s+positive/i);
    if (percentMatch) {
      result.ratingPercentage = percentMatch[1] + "%";
      result.sellerRating = parseInt(percentMatch[1]);
    }

    const totalRatingsMatch = feedback.match(/\(([\d,]+)\s+ratings?\)/i);
    if (totalRatingsMatch) {
      result.totalRatings = totalRatingsMatch[1];
    }

    return result;

  });

  return data;

};