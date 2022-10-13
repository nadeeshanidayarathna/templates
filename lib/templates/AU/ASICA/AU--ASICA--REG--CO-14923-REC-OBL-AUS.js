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
                const level1Element = document.querySelectorAll(".atitle")[0];
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2016-10-28" + "T00:00:00");
                wrapElementDate(document, "effective-date", "2016-10-27" + "T00:00:00");
                // ################
                // # content:info #
                // ################
                const content = document.querySelector("#MainContent_pnlHtmlControls");
                wrapElement(document, content, "ease-content");


                const level2And3Element = document.querySelectorAll(".MsoNormal>b");
                level2And3Element[3].textContent = level2And3Element[3].textContent + " "
                wrapElements(document, [level2And3Element[3], level2And3Element[4]], "level2", group = true);
                wrapElements(document, [level2And3Element[5], level2And3Element[6], level2And3Element[8], level2And3Element[9]], "level3");


                const level2Element2 = document.querySelectorAll(".aNotetoclassorder");
                wrapElements(document, level2Element2, "level2");


                const level3Elements2 = document.querySelectorAll(".aNote1");
                wrapElements(document, level3Elements2, "level3");


                const level4Element = document.querySelectorAll(".aTableof");
                wrapElements(document, level4Element, "level4");


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