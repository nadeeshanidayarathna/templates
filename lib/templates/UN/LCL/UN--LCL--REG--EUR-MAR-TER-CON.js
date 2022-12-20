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
            await base.downloadPage(page, url, sp, path, null,  'utf16le');

            // 2.Identify
            // 3.Wrap
            await page.waitForSelector(".WordSection1");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelector('h1');
                wrapElement(document, level1Element, "level1");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('.WordSection1');
                wrapElement(document, contentElement, "ease-content");

                const level2Element = document.querySelectorAll('h2');
                wrapElements(document, level2Element, "level2");

                const level3Elements = document.querySelectorAll('h3');
                wrapElements(document, level3Elements, "level3");

                const level4Elements = document.querySelectorAll('h4');
                wrapElements(document, level4Elements, "level4");

                
                
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