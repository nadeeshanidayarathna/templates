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
            await page.waitForSelector("#textTabContent");
            await page.evaluate(function process() {

                // #############
                // # root:info #
                // #############
                Array.prototype.forEach.call(document.querySelectorAll("tbody, .hd-modifiers"), function (node) { node.remove(); });
                Array.prototype.forEach.call(document.querySelectorAll(".linkToTop, .oj-hd-date, .oj-hd-lg, .oj-hd-ti, .oj-hd-oj, .reference, .separator, .disclaimer, .arrow, .modref, tbody .title-doc-first"), function (node) { node.remove(); });

                // TODO:
                const level1Element = document.querySelectorAll(".title-doc-first");
                wrapElements(document, level1Element, "level1", group=true);
        
                wrapElementDate(document, "issue-date", "2013-12-20" + "T00:00:00");
               wrapElementDate(document, "effective-date", "2014-03-19" + "T00:00:00");
                // ################
                // # content:info #
                // ################

                // TODO:
                const content = document.querySelector("#textTabContent");
                wrapElement(document, content, "ease-content");

                const level3Element = document.querySelectorAll('.title-article-norm');
                wrapElements(document, level3Element, "level2");



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