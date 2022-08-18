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
            await page.waitForSelector(".pub");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const rootTitle = 'A Definition of "Qualified Actuary" and Guidelines Concerning Requirements for an Actuarial Opinion and Memorandum for Certain Reserves for Guaranteed Interest and Similar Contracts Under Section 205';
                wrapElementLevel1(document, rootTitle);
                wrapElementDate(document, "issue-date", "1982-12-31" + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector(".pub");
                wrapElement(document, contentElement, "ease-content");

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