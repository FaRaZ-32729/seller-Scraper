// module.exports = async function scrapeSellerProfile(page, sellerUrl) {

//   await page.goto(sellerUrl, { waitUntil: "networkidle2" });

//   const data = await page.evaluate(() => {

//     const info = document.querySelector("#page-section-detail-seller-info");

//     if (!info) return {};

//     const text = info.innerText;

//     const lines = text.split("\n");

//     return {
//       businessName: lines[0] || "",
//       address: lines.slice(1).join(", ")
//     };

//   });

//   return data;

// };



// module.exports = async function scrapeSellerProfile(page, sellerUrl) {

//   await page.goto(sellerUrl, {
//     waitUntil: "domcontentloaded",
//     timeout: 120000
//   });

//   await new Promise(r => setTimeout(r, 3000));

//   const data = await page.evaluate(() => {

//     const result = {
//       businessName: "",
//       address: "",
//       postcode: "",
//       ratingPercentage: "",
//       ratingNumber: "",
//       totalRatings: "",
//       pageUrl: window.location.href
//     };

//     // BUSINESS INFO
//     const info = document.querySelector("#page-section-detail-seller-info");

//     if (info) {

//       const text = info.innerText;
//       const lines = text.split("\n").filter(Boolean);

//       result.businessName = lines[0] || "";
//       result.address = lines.slice(1).join(", ");

//       const postcodeMatch = text.match(/[A-Z0-9]{3,10}/);
//       if (postcodeMatch) {
//         result.postcode = postcodeMatch[0];
//       }

//     }

//     // FEEDBACK SECTION
//     const feedbackSection = document.body.innerText;

//     // Example: "330 total ratings"
//     const totalRatingsMatch = feedbackSection.match(/(\d[\d,]*)\s+total ratings/i);
//     if (totalRatingsMatch) {
//       result.totalRatings = totalRatingsMatch[1];
//     }

//     // Example: "97% positive"
//     const percentMatch = feedbackSection.match(/\d+%\s+positive/i);
//     if (percentMatch) {
//       result.ratingPercentage = percentMatch[0];
//     }

//     // Example: "4.8 out of 5 stars"
//     const ratingMatch = feedbackSection.match(/\d\.\d\s+out of\s+5/i);
//     if (ratingMatch) {
//       result.ratingNumber = ratingMatch[0].split(" ")[0];
//     }

//     return result;

//   });

//   return data;

// };


module.exports = async function scrapeSellerProfile(page, sellerUrl) {

  await page.goto(sellerUrl, {
    waitUntil: "domcontentloaded",
    timeout: 120000
  });

  await new Promise(r => setTimeout(r, 3000));

  // const data = await page.evaluate(() => {

  //   const result = {
  //     businessName: "",
  //     address: "",
  //     postcode: "",
  //     sellerRating: "",
  //     ratingPercentage: "",
  //     totalRatings: "",
  //     pageUrl: window.location.href
  //   };

  //   // BUSINESS INFO
  //   const info = document.querySelector("#page-section-detail-seller-info");

  //   if (info) {

  //     const text = info.innerText;
  //     const lines = text.split("\n").filter(Boolean);

  //     result.businessName = lines[0] || "";
  //     result.address = lines.slice(1).join(", ");

  //     const postcodeMatch = text.match(/[A-Z0-9]{3,10}/);
  //     if (postcodeMatch) {
  //       result.postcode = postcodeMatch[0];
  //     }

  //   }

  //   // FEEDBACK SECTION
  //   const feedback = document.body.innerText;

  //   // Seller rating percentage
  //   const percentMatch = feedback.match(/(\d+)%\s+positive/i);
  //   if (percentMatch) {
  //     result.ratingPercentage = percentMatch[1] + "%";
  //     result.sellerRating = parseInt(percentMatch[1]); // numeric value
  //   }

  //   // Total ratings
  //   const totalRatingsMatch = feedback.match(/\(([\d,]+)\s+ratings?\)/i);
  //   if (totalRatingsMatch) {
  //     result.totalRatings = totalRatingsMatch[1];
  //   }

  //   return result;

  // });

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