const stealthPlugin = require('puppeteer-extra-plugin-stealth');
const puppeteer = require("puppeteer-extra").use(stealthPlugin());
const common = require("../common");

const soloScraper = async function download(url, sp) {
    try {
        console.log("callings " + sp + " soloScraper url:" + url);
        const { downloadPath, buildPath } = common.createFolder(url, sp);
        const browser = await puppeteer.launch({
            headless: false,
            devtools: true
        });
        console.log("downloading url:" + url);
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: "networkidle0", timeout: 0 });
        await page.waitForSelector('.col-md-12.region-laurier-first');
        const html = await page.content();

        // 1.Download
        common.download(downloadPath, html);

        // 2.Identify
        // 3.Collect
        {
            page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
            var tags = await page.evaluate(function process() {
                var tags = []

                // root heading:h1 elements
                const elements = document.querySelectorAll(".col-md-12.region-laurier-first h1");
                tags.push("<div class='root'>");
                tags.push("<div class='h1'>" + elements[0].textContent + "</div>");
                tags.push("</div>");

                return Promise.resolve(tags);
            });

            // 4.Build
            common.build(buildPath, tags);
        }
        await page.close();
        await browser.close();
    } catch (e) {
        console.log(e.message);
        console.log('Failed to scrape!!!');
        process.exit(0);
    }
}

module.exports = soloScraper