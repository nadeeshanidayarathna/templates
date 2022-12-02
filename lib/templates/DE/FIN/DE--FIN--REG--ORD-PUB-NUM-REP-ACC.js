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
            await page.waitForSelector(".document-details-content  .container.mt-1");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelector('.Titel2');
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2021-05-31" + "T00:00:00");
                wrapElementDate(document, "effective-date", "2021-07-01" + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('.document-details-content  .container.mt-1');
                wrapElement(document, contentElement, "ease-content");

                const level2Element = document.querySelectorAll('.ParagrafGruppeOverskrift');
                wrapElements(document, level2Element, "level2");

                const level3Element = document.querySelectorAll('.ParagrafNr');
                wrapElements(document, level3Element, "level3");

                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll(".collapse, .metadata-box-header"), function (node) { node.remove(); });

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