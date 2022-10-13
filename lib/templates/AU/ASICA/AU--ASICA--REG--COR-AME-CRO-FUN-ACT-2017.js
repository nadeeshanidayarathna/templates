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
            await page.waitForSelector("#MainContent_pnlHtmlControls");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelectorAll(".ShortT")[0];
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2017-03-29" + "T00:00:00");
                // ################
                // # content:info #
                // ################
                const content = document.querySelector("#MainContent_pnlHtmlControls");
                wrapElement(document, content, "ease-content");

                var level2Elements = Array.from(document.querySelectorAll(".ActHead5"));
                level2Elements = level2Elements.slice(0, 3)
                wrapElements(document, level2Elements, "level2");

                const level2Elements2 = document.querySelectorAll(".ActHead6")
                wrapElements(document, level2Elements2, "level2");


                const level3Elements = document.querySelectorAll(".ActHead7")
                wrapElements(document, level3Elements, "level3");


                const level4Elements = document.querySelectorAll(".ActHead9")
                wrapElements(document, level4Elements, "level4");


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