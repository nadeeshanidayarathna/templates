const { group } = require("yargs");
const base = require("./common/base");

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
            await base.downloadPage(page, url, sp, path, null , encoding = 'utf16le');

            // 2.Identify
            // 3.Wrap
            await page.waitForSelector("body");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############

                const level1Element = document.querySelectorAll('h1')[0];
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2022-06-24" + "T00:00:00");

                // ################
                // # content:info #
                // ################

                const contentElement = document.querySelectorAll('body')[0];
                wrapElement(document, contentElement, "ease-content");

                const level2Element = document.querySelectorAll('h1')[2];
                wrapElement(document, level2Element, "level2");

                const partElement = document.querySelectorAll('.part')[0];
                wrapElement(document, partElement, "level2");

                const h2Element = document.querySelectorAll('h2');
                wrapElements(document, h2Element, "level2", group=false);

                const level3Elements = document.querySelectorAll('h3');
                for (const level3Element of level3Elements) {
                    if (level3Element.outerText.trim() != "") {
                        wrapElement(document, level3Element, "level3");
                    }
                }

                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll(".WordSection2, .WordSection3"), function (node) { node.remove(); });

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