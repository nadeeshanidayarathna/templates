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
            await page.waitForSelector(".act-content");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelectorAll('.act-content > table > tbody > tr')[4];
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "1953-03-24" + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('.act-content');
                wrapElement(document, contentElement, "ease-content");

                const level2Elements = document.querySelectorAll('.act-content > table > tbody > tr > td:nth-of-type(2) > p');
                wrapElements(document, level2Elements, "level2", group = false);

                // removing unwanted content from ease-content
                let i = 0;
                Array.prototype.forEach.call(document.querySelectorAll("img"),function (node) {node.remove();});
                Array.prototype.forEach.call(document.querySelectorAll(".act-content > table > tbody > tr"),function (node) {if ((i < 8 && i != 2) || (i > 9 && i < 15)) {node.remove();}  i++;});
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