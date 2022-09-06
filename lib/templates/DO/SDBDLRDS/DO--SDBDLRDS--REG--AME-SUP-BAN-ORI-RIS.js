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
                const level1Element1 = document.querySelectorAll("h1")[0];
                const level1Element2 = document.querySelectorAll("h1")[1];
                wrapElements(document, [level1Element1,level1Element2] , "level1", group = true);

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('.WordSection1');
                wrapElement(document, contentElement, "ease-content");

                const level2Element = document.querySelector('h2');
                wrapElement(document, level2Element, "level2");
                
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