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
                const level1Element = document.querySelector(".LI-Title").textContent;
                wrapElementLevel1(document, level1Element);
                wrapElementDate(document, "issue-date", "2016-08-12" + "T00:00:00");
                wrapElementDate(document, "effective-date", "2016-08-13" + "T00:00:00");
                // ################
                // # content:info #
                // ################
                const content = document.querySelector("#MainContent_pnlHtmlControls");
                wrapElement(document, content, "ease-content");


                const level2Element = document.querySelectorAll(".LI-Heading1");
                wrapElements(document, level2Element, "level2");


                const level3Element = document.querySelectorAll(".LI-Heading2");
                wrapElements(document, level3Element, "level3");




                // removing unwanted content from ease-content    
                Array.prototype.forEach.call(document.querySelectorAll("img,.WordSection2"), function (node) { node.remove(); });
                Array.prototype.forEach.call([document.querySelector(".LI-Title").parentNode], function (node) { node.remove(); });


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