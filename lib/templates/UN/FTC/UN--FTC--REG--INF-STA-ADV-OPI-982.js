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
            await page.waitForSelector("body");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelector('h1');
                wrapElement(document, level1Element, "level1");
                const issueDatesText = document.querySelectorAll('.field__item p:last-of-type')[13].childNodes[0];
                const issueDates = issueDatesText.textContent.slice(6); 
                console.log(issueDatesText.textContent);
                const issueDate = (new Date(issueDates).getFullYear()) + "-" + ("0" + (new Date(issueDates).getMonth() + 1)).slice(-2) + "-" + ("0" + (new Date(issueDates).getDate())).slice(-2)
                wrapElementDate(document, "issue-date", issueDate + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('body');
                wrapElement(document, contentElement, "ease-content");

                const level2Element = document.querySelectorAll('.usa-layout-docs__main h2');
                wrapElements(document, level2Element, "level2", group = false );

                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll(".banner, .region.region-header, .group-breadcrumb, .usa-footer.usa-footer--big, .usa-header.usa-header--extended.grid-container, .usa-skipnav, .view-header, .views-field.views-field-title, .usa-sr-only"), function (node) { node.remove(); });
        
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