const { group } = require("yargs");
const base = require("../../../common/base");

const scraper = async function download(url, sp, path) {
    try {
        console.log("callings scraper url:" + url + " sp:" + sp + " path:" + path);
        const browser = await base.puppeteer().launch({
            headless: false,
            devtools: false
        });
        {
            // 1.Download
            console.log("getting url:" + url);
            const page = await browser.newPage();
            await base.downloadPage(page, url, sp, path, null, 'utf16le');

            // 2.Identify
            // 3.Wrap
            await page.waitForSelector("body");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############

                const rootTitle = document.querySelector("h6");
                wrapElement(document, rootTitle, "level1");

                // ################
                // # content:info #
                // ################

                const content = document.querySelector("body");
                wrapElement(document, content, "ease-content");

                const contentL2 = document.querySelectorAll("h1");
                wrapElements(document, contentL2, "level2");

                const contentL3 = document.querySelectorAll("h2");
                wrapElements(document, contentL3, "level3");

                const contentL4 = document.querySelectorAll("h3");
                wrapElements(document, contentL4, "level4");

                const footnoteElement = document.querySelectorAll(".MsoEndnoteText");
                wrapElements(document, footnoteElement, "footnote");

                const footnoteElements = document.querySelectorAll(".MsoEndnoteTexts");
                wrapElements(document, footnoteElements, "footnote", group=true);

                return Promise.resolve();
            });
            // 4.Write
            await base.writePage(page, url, sp, path, true, true, true);
            await page.close();
        }
        await base.test().runPageTest(browser, url, sp, path);
        await browser.close();
    } catch (e) {
        console.log(e);
        console.log("Failed to scrape!!!");
        process.exit(1);
    }
}
module.exports = scraper;