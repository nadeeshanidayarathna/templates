const base = require("./common/base");
const constants = require("./common/constants");

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
            await page.waitForSelector("<TBD>");
            await page.evaluate(function process(constants) {
                // #############
                // # root:info #
                // #############

                // TODO:
                // wrapElement(document, level1Element, constants.LEVEL1);
                // wrapElementDate(document, issueDateElement, constants.ISSUE_DATE, issueDateElement.textContent + "T00:00:00");
                // wrapElementDate(document, effectiveDateElement, constants.EFFECTIVE_DATE, effectiveDateElement.textContent + "T00:00:00");

                // ################
                // # content:info #
                // ################

                // TODO:
                // wrapElement(document, contentElement, constants.EASE_CONTENT);
                // wrapElement(document, level2Element, constants.LEVEL2);
                // wrapElement(document, level3Element, constants.LEVEL3);
                // wrapElement(document, level4Element, constants.LEVEL4);
                // wrapElement(document, level5Element, constants.LEVEL5);
                // wrapElement(document, level6Element, constants.LEVEL6);
                // wrapElement(document, level7Element, constants.LEVEL7);
                // wrapElement(document, level8Element, constants.LEVEL8);
                // wrapElement(document, level9Element, constants.LEVEL9);
                // wrapElement(document, footnoteElement, constants.FOOTNOTE);

                // removing unwanted content from ease-content
                // TODO:

                return Promise.resolve();
            }, constants);
            // 4.Write
            await base.writePage(page, url, sp, path, true);
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