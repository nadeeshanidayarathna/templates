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
                const level1Elements = document.querySelectorAll(".WordSection1>.MsoNormal>b")[0];
                wrapElement(document, level1Elements, "level1");
                wrapElementDate(document, "issue-date", "2021-07-30" + "T00:00:00");
                wrapElementDate(document, "effective-date", "2021-08-13" + "T00:00:00");
                // ################
                // # content:info #
                // ################
                const content = document.querySelector("#MainContent_pnlHtmlControls");
                wrapElement(document, content, "ease-content");


                const levelElements = document.querySelectorAll(".MsoNormal>b");
                wrapElement(document, levelElements[10], "level2");

                wrapElements(document, [levelElements[12], levelElements[31], levelElements[70], levelElements[84]], "level3");

                wrapElements(document, [levelElements[13], levelElements[14], levelElements[15], levelElements[21],
                levelElements[22], levelElements[26], levelElements[27], levelElements[28],
                levelElements[72], levelElements[73], levelElements[74], levelElements[75], levelElements[79],
                levelElements[80], levelElements[81], levelElements[82], levelElements[83]], "level4");


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