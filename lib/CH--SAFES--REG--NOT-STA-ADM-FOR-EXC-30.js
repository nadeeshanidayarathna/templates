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
            await page.waitForSelector(".detail_con");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const rootTitle = "国家外汇管理局关于个人本外币兑换特许机构通过互联网办理兑换业务有关问题的通知";
                wrapElementLevel1(document, rootTitle);
                wrapElementDate(document, "issue-date", "2015-12-02T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector(".detail_con");
                wrapElement(document, contentElement, "ease-content");

                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll(".detail_gn"), function (node) { node.remove(); });
                Array.prototype.forEach.call(document.querySelectorAll(".list_mtit"), function (node) { node.remove(); });

                // TODO:
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