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
            await page.waitForSelector("#MainContent_pnlHtmlControls");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelector("#MainContent_pnlHtmlControls .acentred:first-of-type");
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2013-06-13" + "T00:00:00");
                wrapElementDate(document, "effective-date", "2013-06-13" + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('#MainContent_pnlHtmlControls');
                wrapElement(document, contentElement, "ease-content");

                const level2Element = document.querySelectorAll(".aheade, .ListA0 > b");
                for (const elements of level2Element) {
                    if (elements.textContent.trim() != "") {
                        wrapElement(document, elements, "level2");
                    }
                }

                // removing unwanted content from ease-content

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