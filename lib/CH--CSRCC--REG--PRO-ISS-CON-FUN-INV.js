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
            await page.waitForSelector(".pages_content");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const rootTitle = "关于基金从业人员投资证券投资基金有关事项的规定";
                wrapElementLevel1(document, rootTitle);
                wrapElementDate(document, "issue-date", "2012-06-12T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector(".pages_content");
                wrapElement(document, contentElement, "ease-content");

                // TODO:
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