// module.exports = async function searchProducts(page, keyword) {

//   const url = `https://www.amazon.com/s?k=${encodeURIComponent(keyword)}`;

//   await page.setUserAgent(
//     "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"
//   );

//   await page.goto(url, {
//     waitUntil: "domcontentloaded",
//     timeout: 120000
//   });

//   await new Promise(r => setTimeout(r, 3000));

//   const links = await page.evaluate(() => {

//     const products = [];

//     document.querySelectorAll("a.a-link-normal.s-no-outline").forEach(el => {

//       if (el.href) products.push(el.href);

//     });

//     return products.slice(0, 10);

//   });

//   return links;

// };


module.exports = async function searchProducts(page, keyword) {

  const url = `https://www.amazon.com/s?k=${encodeURIComponent(keyword)}`;

  await page.goto(url, {
    waitUntil: "domcontentloaded",
    timeout: 120000
  });

  await new Promise(r => setTimeout(r, 4000));

  const links = await page.evaluate(() => {

    const urls = [];

    document.querySelectorAll('a[href*="/dp/"]').forEach(el => {

      const link = el.href.split("?")[0];

      if (!urls.includes(link)) {
        urls.push(link);
      }

    });

    return urls.slice(0, 20);

  });

  return links;

};