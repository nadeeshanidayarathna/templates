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
            await page.waitForSelector(".WordSection1");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############

                var rootTitle = document.querySelectorAll(".c15");
                let level1Element = [rootTitle[0], rootTitle[1]];
                wrapElements(document, level1Element, "level1", group = true);
                wrapElementDate(document, "issue-date", "2022-04-07T00:00:00");
                
                // ################
                // # content:info #
                // ################

                // TODO:
                const contentElement = document.querySelectorAll(".WordSection1")[0];
                wrapElement(document, contentElement, "ease-content");

                const level2Elements = document.querySelectorAll(".c161")[0];
                wrapElement(document, level2Elements, "level2");

                const level2Element = document.querySelectorAll(".c161")[2];
                wrapElement(document, level2Element, "level2");


                const level3Elements = document.querySelectorAll(".c161")[3];
                wrapElement(document, level3Elements, "level3");


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