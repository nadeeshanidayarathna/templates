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
            await page.waitForSelector(".status-row");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############

                // TODO:
                const level1Element = document.querySelector(".slTitle");
                wrapElement(document, level1Element, "level1");
                  
                const issueDate = document.querySelectorAll('.status-row')[1];
                const dateFormat = (new Date(issueDate.textContent.match(/(?<=at\s)(.*)/m)[0]).toLocaleDateString('fr-CA'));
                wrapElementDate(document, "issue-date", dateFormat + "T00:00:00");
                // ################
                // # content:info #
                // ################

                // TODO:
                const content = document.querySelector("#legisContent");
                wrapElement(document, content, "ease-content");

               const level2Element = document.querySelectorAll(".prov1Hdr");
               wrapElements(document, level2Element, "level2");

               const level3Element = document.querySelectorAll("strong");
               wrapElements(document, level3Element, "level3");

                return Promise.resolve();
            });
            // 4.Write
            await base.writePage(page, url, sp, path, true, false, true);
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