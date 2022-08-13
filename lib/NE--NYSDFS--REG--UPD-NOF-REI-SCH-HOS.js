const base = require("./common/base");

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
                const rootTitle = "(1) Updated No-Fault Reimbursement Schedules for Hospital Inpatient Services; (2) Mileage Reimbursement for No-Fault Claimant On and After 1/1/82; and (3) New York State Health Department Regulation for Resolution Of Hospital Inpatient Services Disputes Effective 1/1/91.";
                wrapElementLevel1(document, rootTitle);

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