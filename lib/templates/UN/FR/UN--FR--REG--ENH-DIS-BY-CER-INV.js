const { group } = require("yargs");
const base = require("../../../common/base");
const scraper = async function download(url, sp, path) {
    try {
        console.log("callings scraper url:" + url + " sp:" + sp + " path:" + path);
        const browser = await base.puppeteer().launch({
            headless: false,
            devtools: false,
        });
        {
            // 1.Download
            console.log("getting url:" + url);
            const page = await browser.newPage();
            await base.downloadPage(page, url, sp, path);
            // 2.Identify
            // 3.Wrap
            await page.waitForSelector("#main");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelector("#metadata_content_area>h1");
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2022-06-17" + "T00:00:00");


                // ################
                // # content:info #
                // ################
                const content = document.querySelector("#main");
                wrapElement(document, content, "ease-content");


                // removing unwanted content from ease-content    
                Array.prototype.forEach.call(document.querySelectorAll(".printed-page-wrapper,#h-10,.flush-paragraph,#print-disclaimer,.main-title-bar,.button,.doc-nav,.fr-seal-block,.metadata_list"), function (node) { node.remove(); });


                const level2Element = document.querySelectorAll("#fulltext_content_area>h1");
                for (contentChild of level2Element) {
                    if (!contentChild.textContent.startsWith("Note:")) {
                        wrapElement(document, contentChild, "level2");
                    }
                }

                const level2Element2 = document.querySelectorAll("#fulltext_content_area>h2");
                wrapElements(document, level2Element2, "level2");


                const level3Element = document.querySelectorAll("h3");
                wrapElements(document, level3Element, "level3");


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