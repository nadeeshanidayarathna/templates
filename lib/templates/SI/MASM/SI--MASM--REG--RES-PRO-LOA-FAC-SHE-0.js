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
            await page.waitForSelector(".WordSection1");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelector('h1');
                wrapElement(document, level1Element, "level1");

                const issueDate = document.querySelector('.dateN');
                const dateFormat = (new Date(issueDate.textContent).toLocaleDateString('fr-CA'));
                wrapElementDate(document, "issue-date", dateFormat + "T00:00:00");

                const effectiveDate = document.querySelector('.dateE');
                const effectiveDateElement = (new Date(effectiveDate.textContent).toLocaleDateString('fr-CA'));
                wrapElementDate(document, "effective-date", effectiveDateElement + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('.WordSection1');
                wrapElement(document, contentElement, "ease-content");

                const level2Element = document.querySelectorAll('p b')[0];
                wrapElement(document, level2Element, "level2");

                const level3Element = document.querySelectorAll('h2');
                wrapElements(document, level3Element, "level3");

                const level4Element = document.querySelectorAll('.cc1');
                wrapElements(document, level4Element, "level4");
        
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