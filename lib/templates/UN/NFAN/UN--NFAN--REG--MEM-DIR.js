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
            await page.waitForSelector(".main-text");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelectorAll("h1")[0];
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2022-06-30" + "T00:00:00");
                // ################
                // # content:info #
                // ################
                const content = document.querySelectorAll(".main-text")[0];
                wrapElement(document, content, "ease-content");


                const level2Element1 = document.querySelectorAll("h2")[0];
                const level2Element2 = document.querySelectorAll("h2")[1];
                wrapElements(document, [level2Element1,level2Element2], "level2");

                
                const footnoteElements = document.querySelectorAll("p");
                for (const contentChild of footnoteElements) {
                    if (contentChild.textContent.startsWith("*")) {
                        wrapElement(document, contentChild, "footnote");
                    }
                }


               

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