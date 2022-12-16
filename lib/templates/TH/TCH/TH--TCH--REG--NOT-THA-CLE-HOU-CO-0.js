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
            await page.waitForSelector("div.card");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Elements = document.querySelectorAll("div.card  p.MsoNormal > strong");
                let level1Element = [];
                for (const elements of level1Elements) {
                    if (elements.textContent.trim() != "") {
                        level1Element.push(elements);
                        // console.log(elements.textContent)
                    }
                }
                wrapElements(document, level1Element, "level1", group = true);
                wrapElementDate(document, "issue-date", "2022-07-15" + "T00:00:00");
                wrapElementDate(document, "effective-date", "2022-08-01" + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('div.card');
                wrapElement(document, contentElement, "ease-content");
                

                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll(".card div.btn-group"), function (node) { node.remove(); });
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