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
            await page.waitForSelector(".doc-content");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelectorAll("h1")[0];
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2015-08-07" + "T00:00:00");
                // ################
                // # content:info #
                // ################
                const content = document.querySelectorAll(".doc-content")[0];
                wrapElement(document, content, "ease-content");

                
                const level2Elements = document.querySelectorAll(".c23");
                wrapElements(document, level2Elements, "level2");


                const forFootnoteElements = document.querySelectorAll(".cfn");
                wrapElements(document, forFootnoteElements, "footnote");



                
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