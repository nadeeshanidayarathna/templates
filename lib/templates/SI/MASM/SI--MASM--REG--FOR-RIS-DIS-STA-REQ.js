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
                const rootTitle = "FORM 14 RISK DISCLOSURE STATEMENT REQUIRED TO BE FURNISHED UNDER REGULATION 47E(2)AND TO BE KEPT UNDER REGULATION 39(2)(d) BY THE HOLDER OF A CAPITAL MARKETS SERVICES LICENCE FOR FUND MANAGEMENT RELATING TO MANAGEMENT OF PORTFOLIO OF CAPITAL MARKETS PRODUCTS IN RESPECT OF FUTURES AND CERTAIN OVER-THE-COUNTER DERIVATIVES CONTRACTS";
                wrapElementLevel1(document, rootTitle);

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('body');
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