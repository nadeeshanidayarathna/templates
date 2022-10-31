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
                const level1Elements = document.querySelectorAll(".MsoTitle")[1];
                wrapElement(document, level1Elements, "level1");
                wrapElementDate(document, "issue-date", "2022-09-20" + "T00:00:00");
                wrapElementDate(document, "effective-date", "2022-09-30" + "T00:00:00");
                // ################
                // # content:info #
                // ################
                const content = document.querySelector("#MainContent_pnlHtmlControls");
                wrapElement(document, content, "ease-content");


                const level2Element = document.querySelectorAll(".CharSchNo")[2];
                wrapElement(document, level2Element, "level2");
                const level2And3Elements = document.querySelectorAll(".MsoNormal");
                wrapElements(document, [level2And3Elements[127],level2And3Elements[132]], "level2");
                wrapElements(document, [level2And3Elements[24],level2And3Elements[26],level2And3Elements[29],level2And3Elements[31]], "level3");


                const forFootnoteElements = document.querySelectorAll(".MsoFootnoteText");
                wrapElements(document, forFootnoteElements, "footnote");


                // removing unwanted content from ease-content    
                Array.prototype.forEach.call(document.querySelectorAll("img"), function (node) { node.remove(); });


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