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
            await base.downloadPage(page, url, sp, path);

            // 2.Identify
            // 3.Wrap
            await page.waitForSelector("body");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############

                const h1Element = document.querySelectorAll('h1')[0];
                const h2Element = document.querySelectorAll('h2')[0];
                let level1Element = [h1Element, h2Element];
                wrapElements(document, level1Element, "level1", group = true);
                wrapElementDate(document, "issue-date", "2022-03-22" + "T00:00:00");

                // ################
                // # content:info #
                // ################

                const contentElement = document.querySelectorAll('body')[0];
                wrapElement(document, contentElement, "ease-content");

                const level2Element = document.querySelectorAll('h3, h4');
                wrapElements(document, level2Element, "level2", group = false);

                const level3Element = document.querySelectorAll('h5');
                wrapElements(document, level3Element, "level3", group = false);

                const level4Element = document.querySelectorAll('h6');
                wrapElements(document, level4Element, "level4", group = false);

                const level5Element = document.querySelectorAll('h7');
                wrapElements(document, level5Element, "level5", group = false);

                const footnoteElement = document.querySelectorAll('div[id^="ftn"]');
                wrapElements(document, footnoteElement, "footnote", group = false);

                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll(".remover"), function (node) { node.remove(); });

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