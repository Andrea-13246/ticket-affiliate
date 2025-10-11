import fetch from "node-fetch";
import * as cheerio from "cheerio";
import fs from "fs";

const urls = [
  "https://www.musement.com/it/milano/",
  "https://www.musement.com/it/roma/",
  "https://www.musement.com/it/napoli/",
  "https://www.musement.com/it/firenze/",
  "https://www.musement.com/it/venezia/"
];

let events = [];

async function scrapeCity(url) {
  const res = await fetch(url);
  const html = await res.text();
  const $ = cheerio.load(html);

  $(".card-product").each((_, el) => {
    const title = $(el).find(".card-product-title").text().trim();
    const image = $(el).find("img").attr("src");
    const price = $(el).find(".price").text().replace("da", "").trim();
    const link = "https://www.musement.com" + $(el).find("a").attr("href");
    const city = url.split("/it/")[1].replace("/", "");

    if (title && link) {
      events.push({
        title,
        city,
        venue: city.charAt(0).toUpperCase() + city.slice(1),
        date: "Data variabile",
        time: "—",
        price: price || "—",
        url: link + "?aid=TUO_AFFILIATE_ID",
        image: image || "",
        category: "musei"
      });
    }
  });
}

(async () => {
  for (const url of urls) {
    await scrapeCity(url);
  }

  const csvHeader = "title,city,venue,date,time,price,url,affid,image,category\n";
  const csvRows = events.map(ev =>
    `"${ev.title}","${ev.city}","${ev.venue}","${ev.date}","${ev.time}","${ev.price}","${ev.url}","","${ev.image}","${ev.category}"`
  );

  fs.writeFileSync("events.csv", csvHeader + csvRows.join("\n"), "utf8");
  console.log(`✅ Salvati ${events.length} eventi`);
})();
