const { group } = require("yargs");
const base = require("../../../common/base");
const scraper = async function download(url, sp, path) {
    try {
        console.log("callings scraper url:" + url + " sp:" + sp + " path:" + path);
        const browser = await base.puppeteer().launch({
            headless: false,
            devtools: false,
            ignoreHTTPSErrors: true
        });
        {
            // 1.Download
            console.log("getting url:" + url);
            const page = await browser.newPage();
            await base.downloadPage(page, url, sp, path);
            // 2.Identify
            // 3.Wrap
            await page.waitForSelector(".right");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelectorAll(".ShortT")[0];
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2022-07-29" + "T00:00:00");
                wrapElementDate(document, "effective-date", "2022-07-01" + "T00:00:00");
                // ################
                // # content:info #
                // ################
                const content = document.querySelectorAll(".right")[0];
                wrapElement(document, content, "ease-content");


                const level2Element = document.querySelectorAll(".ActHead1");
                wrapElements(document, level2Element, "level2");


                const level3Element = document.querySelectorAll(".ActHead2");
                wrapElements(document, level3Element, "level3");


                const level4Element = document.querySelectorAll(".ActHead3");
                wrapElements(document, level4Element, "level4");


                const level5Element = document.querySelectorAll(".ActHead4");
                wrapElements(document, level5Element, "level5");


                const level6Element = document.querySelectorAll(".ActHead5");
                wrapElements(document, level6Element, "level6");


                // removing unwanted content from ease-content    
                Array.prototype.forEach.call(document.querySelectorAll("img,.WordSection2"), function (node) { node.remove(); });


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