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
            await page.evaluate(function process() {
                const levels = document.querySelectorAll(".level1");
                for (const level of levels) {
                    Relocate(level, level, []);
                }

                function Relocate(originalNode, currentNode, tags) {
                    if (currentNode.parentNode.nodeName.toUpperCase() == "BODY") {
                        console.log("found parent body in " + tags.toString() + ". removing original node from the dom");
                        originalNode.remove();
                    } else {
                        tags.push(currentNode.nodeName.toUpperCase());
                        Relocate(originalNode, currentNode.parentNode, tags);
                    }
                }

                return Promise.resolve();
            });
            await base.write(url, sp, path, page);

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