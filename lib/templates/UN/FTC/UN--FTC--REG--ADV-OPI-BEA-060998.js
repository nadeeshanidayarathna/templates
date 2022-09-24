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
            await page.waitForSelector(".dialog-off-canvas-main-canvas");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelector('h1 > span');
                wrapElement(document, level1Element, "level1");

                const issueDates = document.querySelectorAll('.field__item >p:nth-of-type(1)')[11];
                const issueDate = (new Date(issueDates.textContent).getFullYear()) + "-" + ("0" + (new Date(issueDates.textContent).getMonth() + 1)).slice(-2) + "-" + ("0" + (new Date(issueDates.textContent).getDate())).slice(-2)
                wrapElementDate(document, "issue-date", issueDate + "T00:00:00");
                
                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('#content');
                wrapElement(document, contentElement, "ease-content");

                const level2Element = document.querySelectorAll('.field__item > h3');
                wrapElements(document, level2Element, "level2");
 
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