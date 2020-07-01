const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

// const sample = {
//   guests: 1,
//   bedrooms: 1,
//   beds: 1,
//   baths: 1,
//   GHsPerNight: 350,
// };

// https://www.airbnb.com/s/Accra--Greater-Accra-Region--Ghana/homes?tab_id=home_tab&refinement_paths%5B%5D=%2Fhomes&place_id=ChIJc6e3soSQ3w8R0y0OZdhO0b4&source=structured_search_input_header&search_type=pagination&map_toggle=false&federated_search_session_id=594d4fd9-ce0e-42db-ab3a-96bb02d20446&query=Accra%2C%20Ghana&section_offset=2&items_offset=20

let browser;

async function scrapeHomeLinks(url) {
  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto(url);
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);

    const homes = $("._e296pg")
      .map((i, element) => $(element).find("a").attr("href"))
      .get();
    links = homes.map((home) => {
      return `https://www.airbnb.com${home}`;
    });
    
    return links
  } catch (err) {
    console.log(err);
  }
}

async function descriptionScraper(url, page) {
  let roomText;
  try {
    await page.goto(url, { waitUntil: "networkidle2" });
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);

    const price = $(
      "#site-content > div > div > div > div > div > div > div:nth-child(1) > div > div > div > div > div > div > div > div._xqcexm > div > div > span > span"
    ).text();

    roomText = $("#site-content").text();

    const guestsAllowed = returnMatches(roomText, /\d+ guest/);
    const bedrooms = returnMatches(roomText, /\d+ (bedroom)/);
    const baths = returnMatches(roomText, /\d+ bath/);
    const beds = returnMatches(roomText, /\d+ bed/);

    return { price, guestsAllowed, bedrooms, baths, beds, url };
  } catch (err) {
    console.error(roomText);
    console.error(err);
    console.error(url);
  }
}

function returnMatches(roomText, regex) {
  const regExMatches = roomText.match(regex);
   result = "N/A";

  if (regExMatches != null) {
    result = regExMatches[0];
  } else {
    return result = "N/A";
    // throw `No matches for: ${regex}`;
    
  }
  return result;
}

async function main() {
  const browser = await puppeteer.launch({ headless: false });
  const descriptionPage = await browser.newPage();
  const links = await scrapeHomeLinks(
    "https://www.airbnb.com/s/Accra--Greater-Accra-Region--Ghana/homes?tab_id=home_tab&refinement_paths%5B%5D=%2Fhomes&place_id=ChIJc6e3soSQ3w8R0y0OZdhO0b4&source=structured_search_input_header&search_type=pagination&map_toggle=false&federated_search_session_id=594d4fd9-ce0e-42db-ab3a-96bb02d20446&query=Accra%2C%20Ghana&section_offset=2&items_offset=20"
  );
  for (var i = 0; i < links.length; i++) {
    const result = await descriptionScraper(links[i], descriptionPage);
    console.log({ result });
  }
}

main();
