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
            await page.waitForSelector(".doc-content");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############

                // TODO:
                const rootTitle = document.querySelectorAll(".c16")[0];
                wrapElement(document, rootTitle, "level1");
                wrapElementDate(document, "issue-date", "2022-04-28T00:00:00");
                wrapElementDate(document, "effective-date", "2022-05-01T00:00:00");

                // ################
                // # content:info #
                // ################

                // TODO:
                const content = document.querySelectorAll(".doc-content")[0];
                wrapElement(document, content, "ease-content");

                const contentL2 = document.querySelectorAll(".c173")[0];
                wrapElement(document, contentL2, "level2");

                const contentsL3 = document.querySelectorAll(".c55");
                for(const contentL3 of contentsL3){
                    wrapElement(document, contentL3, "level3");
                }
                
                const contentL4 = document.querySelectorAll(".c175")[0];
                wrapElement(document, contentL4, "level4");

                // removing unwanted content from ease-content

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