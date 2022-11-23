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
            await page.waitForSelector("#textTabContent");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelectorAll('#textTabContent .oj-doc-ti');
                // let level1Elements = [level1Element[0],level1Element[1],level1Element[2],level1Element[3]];
                wrapElements(document, level1Element, "level1", group = true);
                wrapElementDate(document, "issue-date", "2021-08-06" + "T00:00:00");
                wrapElementDate(document, "effective-date", "2021-12-07" + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('#textTabContent');
                wrapElement(document, contentElement, "ease-content");

                const level3Element = document.querySelectorAll('#textTabContent .oj-ti-art');
                wrapElements(document, level3Element, "level2");

                const footnoteElement = document.querySelectorAll('#textTabContent p.oj-note');
                wrapElements(document, footnoteElement, "footnote");

                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll(".linkToTop, .oj-hd-date, .oj-hd-lg, .oj-hd-ti, .oj-hd-oj"), function (node) { node.remove(); });

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