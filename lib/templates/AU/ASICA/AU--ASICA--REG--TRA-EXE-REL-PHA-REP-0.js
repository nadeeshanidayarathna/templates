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
                const level1Elements = document.querySelectorAll(".Default>b");
                level1Elements[0].textContent = level1Elements[0].textContent + " "
                wrapElements(document, [level1Elements[0], level1Elements[1]], "level1", group = true);
                wrapElementDate(document, "issue-date", "2014-04-01" + "T00:00:00");
                wrapElementDate(document, "effective-date", "2014-04-01" + "T00:00:00");
                // ################
                // # content:info #
                // ################
                const content = document.querySelector("#MainContent_pnlHtmlControls");
                wrapElement(document, content, "ease-content");

                var levelElements = Array.from(document.querySelectorAll(".Default>b"));
                var level2Elements = levelElements.slice(1, 6);
                wrapElements(document, level2Elements, "level2");
                wrapElements(document, [levelElements[7], levelElements[17], levelElements[21],
                levelElements[23], levelElements[25], levelElements[27]], "level2");

                const level2Element2 = document.querySelectorAll(".MsoNormal>b")[4];
                wrapElement(document, level2Element2, "level2");


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