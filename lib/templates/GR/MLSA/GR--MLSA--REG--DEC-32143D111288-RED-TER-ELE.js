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
            await base.downloadPage(page, url, sp, path, null, 'latin1');

            // 2.Identify
            // 3.Wrap
            await page.waitForSelector("body");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############

                const rootTitle = document.querySelectorAll("h1");
                wrapElements(document, rootTitle, "level1", group = true);
                wrapElementDate(document, "issue-date", "2018-06-11T00:00:00");
                wrapElementDate(document, "effective-date", "2018-06-22T00:00:00");

                // ################
                // # content:info #
                // ################

                const content = document.querySelectorAll("body")[0];
                wrapElement(document, content, "ease-content");

                const contentL2 = document.querySelectorAll("h2")[0];
                wrapElement(document, contentL2, "level2");

                const contentL3 = document.querySelectorAll("h2")[1];
                wrapElement(document, contentL3, "level3");

                const contentL4 = document.querySelectorAll(".MsoNormal")[10];
                wrapElement(document, contentL4, "level4");

                const contentL5 = document.querySelectorAll("h6");
                wrapElements(document, contentL5, "level5", group = false);

                const contentL6 = document.querySelectorAll("h7");
                wrapElements(document, contentL6, "level6", group = false);

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