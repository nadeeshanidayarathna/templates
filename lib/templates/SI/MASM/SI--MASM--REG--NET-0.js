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
            await page.waitForSelector(".doc-content");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const rootTitle = document.querySelector("h6");
                wrapElement(document, rootTitle, "level1");

                const issueDate = document.querySelector('.dateN');
                const dateFormat = (new Date(issueDate.textContent).toLocaleDateString('fr-CA'));
                wrapElementDate(document, "issue-date", dateFormat + "T00:00:00");

                const effectiveDate = document.querySelector('.dateE');
                const dateFormatE = (new Date(effectiveDate.textContent).toLocaleDateString('fr-CA'));
                wrapElementDate(document, "effective-date", dateFormatE + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('.doc-content');
                wrapElement(document, contentElement, "ease-content");

                const level2Element = document.querySelectorAll("h3");
                wrapElements(document, level2Element, "level2");

                const level3Element = document.querySelectorAll(".cc5");
                wrapElements(document, level3Element, "level3");

                const footnoteElements = document.querySelectorAll(".c622");
                wrapElements(document, footnoteElements, "footnote");

                const footnoteElement = document.querySelectorAll(".c633");
                wrapElements(document, footnoteElement, "footnote", group=true);
        
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