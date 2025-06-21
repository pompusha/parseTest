const getTyresByBrandLinks = require("./getTyresByBrandLinks");
const cheerio = require("cheerio");
const axios = require("axios");
const fs = require("fs");
const { Parser } = require("json2csv");
const saveTyresToDb = require("./db");

const data = [];

(async () => {
  const byBrend = await getTyresByBrandLinks();

  // for (let i = 0; i < byBrend.length; i++) {
  // To get a short sample of the website data, change the for loop condition,
  // otherwise it will parse all tires by brand.
  // For example:
  for (let i = 0; i < 3; i++) {
    await getAllUrlPages(byBrend[i]["href"]);
  }

  fs.writeFileSync("tyres.json", JSON.stringify(data, null, 2), "utf8");
  console.log("Saved tyres.json");
  const parser = new Parser();
  const csv = parser.parse(data);
  fs.writeFileSync("tyres.csv", csv, "utf8");
  console.log("Saved tyres.csv");
  await saveTyresToDb(data);
})();

async function getAllUrlPages(url) {
  try {
    const page = await axios.get(url);
    const $ = cheerio.load(page.data);
    const nextLink = $('a.page-link[rel="next"]').attr("href");
    await scrapTyre($, url);
    if (nextLink) {
      console.log(`Scraped link: ${nextLink}`);
      await getAllUrlPages(nextLink);
    } else {
      return;
    }
  } catch (error) {
    console.log(error);
  }
}
async function scrapTyre($, url) {
  try {
    $("#app > div.py-5 > div > div.related-products-grid > div > div").each(
      (_, el) => {
        const title = $(el)
          .find("div.row.position-relative > div.col-12 > div > h4")
          .text()
          .trim();

        const price = $(el)
          .find(
            "div.vstack.gap-2 > div.d-flex.align-items-baseline > div.fs-4.fw-bold.text-primary.product-price.me-4"
          )
          .text()
          .trim();

        const season = $(el)
          .find(
            "div.vstack.gap-2 > div.border-top.py-2.border-primary\\:20.d-flex > img:nth-child(1)"
          )
          .attr("title");
        //
        if (title != "" && price != "") {
          const spliteTitle = title.split(" ");
          const hostname = new URL(url).hostname;

          data.push({
            hostname: hostname,
            brand: spliteTitle[0],
            size: spliteTitle[1],
            aspect_ratio: spliteTitle[2],
            radius: spliteTitle[3],
            price: price,
            season: season || null,
          });
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
}
