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
                const level1Element = document.querySelector('h1');
                wrapElement(document, level1Element, "level1");

                wrapElementDate(document, "issue-date", "2021-08-03" + "T00:00:00");
                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('body');
                wrapElement(document, contentElement, "ease-content");

                const level2Element = document.querySelectorAll('h2');
                wrapElements(document, level2Element, "level2");

                // const level3Element = document.querySelectorAll('h3');
                // wrapElements(document, level3Element, "level3");

                const level3Element = document.querySelectorAll('.cc24');
                wrapElements(document, level3Element, "level3");

                const level4Elementn = document.querySelectorAll('.cc25');
                wrapElements(document, level4Elementn, "level4");

                const level4Element = document.querySelectorAll('h4');
                wrapElements(document, level4Element, "level3");

                // const level5Element = document.querySelectorAll('h5');
                // wrapElements(document, level5Element, "level5");

                const footnoteElement = document.querySelectorAll('.c12');
                wrapElements(document, footnoteElement, "footnote");

                const footnoteElements = document.querySelectorAll('.cc122');
                wrapElements(document, footnoteElements, "footnote", group=true);

        
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