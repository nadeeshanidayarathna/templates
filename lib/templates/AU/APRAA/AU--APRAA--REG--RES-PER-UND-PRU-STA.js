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
            await page.waitForSelector(".WordSection1");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############

                const rootTitle = document.querySelector(".MsoNormal b");
                wrapElement(document, rootTitle, "level1");

                wrapElementDate(document, "issue-date", "2013-05-01T00:00:00");
                
                // ################
                // # content:info #
                // ################

                const contentElement = document.querySelector(".WordSection1");
                wrapElement(document, contentElement, "ease-content");

                const level2Element = document.querySelectorAll("h1");
                wrapElements(document, level2Element, "level2");

                const level3Element = document.querySelectorAll("h2");
                wrapElements(document, level3Element, "level3");

                const level4Element = document.querySelectorAll("h3");
                wrapElements(document, level4Element, "level4");

                const level5Element = document.querySelectorAll("h4");
                wrapElements(document, level5Element, "level5");
                
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