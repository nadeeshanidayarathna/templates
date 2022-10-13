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
            await page.waitForSelector("h1");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelector(".metadata-content-area h1");
                wrapElement(document, level1Element, "level1");
                const issueDate = document.querySelectorAll('.metadata_share_bar a')[1];
                const dateFormat = (new Date(issueDate.textContent).toLocaleDateString('fr-CA'));
                wrapElementDate(document, "issue-date", dateFormat + "T00:00:00");
            
                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('.doc-content-area');
                wrapElement(document, contentElement, "ease-content");

                const level2Element = document.querySelectorAll('.doc-content-area h1');
                wrapElements(document, level2Element, "level2");

                const level3Element = document.querySelectorAll('.doc-content-area h2');
                wrapElements(document, level3Element, "level3");

                const level4Element = document.querySelectorAll('.doc-content-area h3');
                wrapElements(document, level4Element, "level4");

                const level5Element = document.querySelectorAll('.doc-content-area h4');
                wrapElements(document, level5Element, "level5");
                
                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll(".fr-box-small, .end-matter, .text, .back"), function (node) { node.remove(); });
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