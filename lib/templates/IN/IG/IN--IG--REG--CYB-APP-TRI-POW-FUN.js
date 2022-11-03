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
            await base.downloadPage(page, url, sp, path, null, 'utf16le');

            // 2.Identify
            // 3.Wrap
            await page.waitForSelector(".doc-content");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############

                const rootTitle = "Cyber Appellate Tribunal (Powers and Functions of the Chairperson) Rules, 2016.";
                wrapElementLevel1(document, rootTitle);
                wrapElementDate(document, "issue-date", "2016-05-02" + "T00:00:00");

                // ################
                // # content:info #
                // ################

                const content = document.querySelector(".doc-content");
                wrapElement(document, content, "ease-content");

                const level2Element = document.querySelectorAll(".cc8");
                wrapElements(document, level2Element, "level2");

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