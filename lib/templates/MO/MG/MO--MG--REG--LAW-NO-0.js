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
            await page.waitForSelector(".page_textes > table tbody tbody > tr:nth-of-type(2) > td");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelector('.LVL_0');
                wrapElement(document, level1Element.childNodes[0], "level1");
                wrapElementDate(document, "issue-date", "2022-08-12" + "T00:00:00");
                wrapElementDate(document, "effective-date", "1945-01-25" + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('.page_textes > table tbody tbody > tr:nth-of-type(2) > td');
                wrapElement(document, contentElement, "ease-content");

                // removing unwanted content from ease-content
                
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