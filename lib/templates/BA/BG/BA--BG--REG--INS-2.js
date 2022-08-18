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
            await page.waitForSelector("#middlepart");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############

                // TODO:
                const rootTitle = document.querySelectorAll(".long-title-regulation")[0];
                wrapElement(document, rootTitle, "level1");
                wrapElementDate(document, "issue-date", "1998-06-09T00:00:00");
                wrapElementDate(document, "effective-date", "1998-11-02T00:00:00");

                // ################
                // # content:info #
                // ################

                const content = document.querySelectorAll("#middlepart")[0];
                wrapElement(document, content, "ease-content");

                const revisionL2 = document.querySelectorAll(".lawRevisionOrders-heading")[0];
                wrapElement(document, revisionL2, "level2");

                const contL2 = document.querySelectorAll(".label-schedule-heading");
                wrapElements(document, contL2, "level2", group = false);

                const contL3 = document.querySelectorAll(".label-group1");
                wrapElements(document, contL3, "level3", group = false);

                const contTableL3 = document.querySelectorAll(".title-text-schedule");
                wrapElements(document, contTableL3, "level3", group = false);

                //Remove unwanted content
                Array.prototype.forEach.call(document.querySelectorAll("img"), function (node) { node.remove(); });

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