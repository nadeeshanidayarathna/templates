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
            await page.waitForSelector(".WordSection1");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############

                // TODO:
                const rootTitle = document.querySelectorAll(".c110")[0];
                wrapElement(document, rootTitle, "level1");
                wrapElementDate(document, "issue-date", "2022-06-20T00:00:00");

                // ################
                // # content:info #
                // ################

                // TODO:
                const content = document.querySelectorAll(".WordSection1")[0];
                wrapElement(document, content, "ease-content");

                const contentsH1 = document.querySelectorAll("h1");
                for(const contentH1 of contentsH1){
                    wrapElement(document, contentH1, "level2");
                }

                const contentsH2 = document.querySelectorAll("h2");
                for(const contentH2 of contentsH2){
                    wrapElement(document, contentH2, "level3");
                }

                // removing unwanted content from ease-content
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