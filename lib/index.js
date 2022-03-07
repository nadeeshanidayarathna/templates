const stealthPlugin = require('puppeteer-extra-plugin-stealth');
const puppeteer = require("puppeteer-extra").use(stealthPlugin);
const sha1 = require('js-sha1');
const fs = require("fs");
const path = require('path');

const recursiveScraper = async function scrapeAll(url, cssSelector, retry) {
    let pageScraper
    fs.lstat(path.join(__dirname, cssSelector), function (err, stat) {
        if (err) {
            console.log("scraper for the particular SP is not available")
            process.exit(0)
        }
        if (!stat.isDirectory()) {
            console.log("scraper for the particular SP is not available")
            process.exit(0)
        }
        pageScraper = require(`./${cssSelector}/pageScraper`)
    })
    let i = 0
    while (true) {
        try {
            console.log(`Iterating ${i} time to scrap the url ..........`)
            const dir = "downloads\\" + sha1(url);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
            }
            let newBrowser = await puppeteer.launch({
                headless: false,
                args: ["--disable-setuid-sandbox"],
                'ignoreHTTPSErrors': true
            });
            await pageScraper(newBrowser, url)
            console.log(`-----------------------------------------------`)
            console.log('successfully scraped the url !!!')
            console.log('url:' + url)
            console.log(`-----------------------------------------------`)
            process.exit(0)
        } catch (err) {
            if (err) {
                console.log(err.message)
                i += 1
                if (i >= retry) {
                    console.log('recursion exceeded the retry value............')
                    break;
                }
                continue
            }
        }
    }
    console.log('Failed to crawl .....................retry after sometimes')
    process.exit(0)
}

module.exports = recursiveScraper