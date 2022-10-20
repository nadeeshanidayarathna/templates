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
            await page.waitForSelector('#block-content > article > div');
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                                                
                const rootTitle = document.querySelector(".page__title h1");
                wrapElement(document, rootTitle, "level1");

                const issueDateElement = document.querySelector(".page__meta-toolbar span");
                const issueDate = /\d{1,}\s{1,}\w.*\s{1,}\d{1,}/.exec(issueDateElement.textContent)
                const dateFormat = (new Date(issueDate).toLocaleDateString('fr-CA'));
                wrapElementDate(document, "issue-date", dateFormat + "T00:00:00");

                // ################
                // # content:info #
                // ################

                const contentElement = document.querySelector('#block-content > article > div > section > article');
                wrapElement(document, contentElement, "ease-content");

                const footnoteTitle = document.querySelector("#footnote");
                wrapElement(document, footnoteTitle, "level2");

                // Remove unwanted elements
                Array.prototype.forEach.call(document.querySelectorAll(".page__meta-toolbar, figure, .text--primary, .field"), function (node) { node.remove(); });
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