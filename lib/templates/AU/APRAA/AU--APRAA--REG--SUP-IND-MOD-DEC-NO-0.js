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
            await page.waitForSelector("#MainContent_pnlHtmlControls");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############

                wrapElementLevel1(document, "SIS Regulations - Modification Declaration No. 3 of 2007");
                wrapElementDate(document, "issue-date", "2007-11-19" + "T00:00:00");

                // ################
                // # content:info #
                // ################

                const contentElement = document.querySelector('#MainContent_pnlHtmlControls');
                wrapElement(document, contentElement, "ease-content");

                const level2Element = document.querySelectorAll('p');
                let title1 = [level2Element[68],level2Element[69]];
                wrapElements(document, title1, "level2", group = true);

                let title2 = [level2Element[77],level2Element[78]];
                wrapElements(document, title2, "level2", group = true);

                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll(".Section1 > p:nth-of-type(7) img"), function (node) { node.remove(); });
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