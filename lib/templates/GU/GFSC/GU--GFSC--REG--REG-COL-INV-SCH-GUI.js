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
            await page.waitForSelector(".doc-content");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelector('.c288');
                wrapElement(document, level1Element, "level1");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('.doc-content');
                wrapElement(document, contentElement, "ease-content");

                const level2Element = document.querySelectorAll('h1');
                wrapElements(document, level2Element, "level2");

                const level3Element = document.querySelectorAll('h2');
                wrapElements(document, level3Element, "level3");

                const level4Element = document.querySelectorAll('.c455');
                wrapElements(document, level4Element, "level4");

                const level5Element = document.querySelectorAll('.c355');
                wrapElements(document, level5Element, "level5");

                const level6Element = document.querySelectorAll('.c255');
                wrapElements(document, level6Element, "level6");

                return Promise.resolve();
            });
            // 4.Write
            await base.writePage(page, url, sp, path, true, true, false);
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