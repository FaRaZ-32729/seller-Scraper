// module.exports = async function loginAmazon(page) {

//   await page.goto("https://www.amazon.com/ap/signin", {
//     waitUntil: "domcontentloaded"
//   });

//   await page.type("#ap_email", process.env.AMAZON_EMAIL, { delay: 100 });

//   await page.click("#continue");

//   await page.waitForSelector("#ap_password");

//   await page.type("#ap_password", process.env.AMAZON_PASSWORD, { delay: 100 });

//   await page.click("#signInSubmit");

//   await page.waitForNavigation({ waitUntil: "networkidle2" });

//   console.log("Amazon login successful");

// };