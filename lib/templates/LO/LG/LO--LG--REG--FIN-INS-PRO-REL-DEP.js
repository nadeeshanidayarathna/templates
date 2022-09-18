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
            await base.downloadPage(page, url, sp, path, null ,'utf16le');

            // 2.Identify
            // 3.Wrap
            await page.waitForSelector(".WordSection1");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############

                // TODO:
                const level1Element = document.querySelectorAll(".MsoNormal span")[2];
                wrapElement(document, level1Element, "level1");
        
                wrapElementDate(document, "issue-date", "2022-06-20" + "T00:00:00");
                wrapElementDate(document, "effective-date", "2022-08-01" + "T00:00:00");
                // ################
                // # content:info #
                // ################

                // TODO:
                const content = document.querySelector(".WordSection1");
                wrapElement(document, content, "ease-content");

                return Promise.resolve();
            });
            // 4.Write
            await base.writePage(page, url, sp, path, true, true);
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