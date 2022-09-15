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
            await page.waitForSelector(".doc-content");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############

                // Root Title
                const rootTitle = document.querySelectorAll("h1")[0];
                wrapElement(document, rootTitle, "level1");
                wrapElementDate(document, "issue-date", "2022-03-10" + "T00:00:00");


                // ################
                // # content:info #
                // ################

                // Scope
                const contentElement = document.querySelectorAll(".doc-content")[0];
                wrapElement(document, contentElement, "ease-content");

                //Levels

                const level2Element = document.querySelectorAll("h2")
                wrapElements(document, level2Element, "level2");

                const level3Element = document.querySelectorAll("h3")
                wrapElements(document, level3Element, "level3");


                return Promise.resolve();
            });
            // 4.Write
            await base.writePage(page, url, sp, path, true, true);
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