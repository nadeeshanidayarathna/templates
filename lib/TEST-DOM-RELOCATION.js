const stealthPlugin = require("puppeteer-extra-plugin-stealth");
const puppeteer = require("puppeteer-extra").use(stealthPlugin());
const base = require("./common/base");

const scraper = async function download(url, sp, path) {
    try {
        console.log("callings scraper url:" + url + " sp:" + sp + " path:" + path);
        const { id, originalHtmlPath, buildHtmlPath, originalTextPath, buildTextPath, metadataPath } = await base.createFolder(url, sp, path);
        const browser = await puppeteer.launch({
            headless: false,
            devtools: false
        });

        {
            // 1.Download
            console.log("getting url:" + url);
            const page = await browser.newPage();
            url = await base.download(id, originalHtmlPath, metadataPath, page, url);

            // 2.Identify
            // 3.Collect
            await page.waitForSelector("body");
            page.on("console", (msg) => console.log(msg.text()));
            var tags = await page.evaluate(function process() {
                var tags = [];
                const levels = document.querySelectorAll(".level1");
                for (const level of levels) {
                    try { tags.push(level.outerHTML); } catch (e) { }
                }

                return Promise.resolve(tags);
            });
            // 4.Build
            await base.build(buildHtmlPath, tags);
            await page.close();
        }
        await browser.close();
    } catch (e) {
        console.log(e);
        console.log("Failed to scrape!!!");
        process.exit(1);
    }
}
module.exports = scraper;