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
            await page.waitForSelector("#act");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelector('h1.content-title');
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "1995-02-01" + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('#act');
                wrapElement(document, contentElement, "ease-content");

                const level2Elements = document.querySelectorAll('#act > table > tbody > tr');
                for (const level2Element of level2Elements) {
                    if (level2Element.textContent.trim().match(/^SCHEDULE/)) {
                        let elements = [level2Element, level2Element.nextElementSibling];
                        wrapElements(document, elements, "level2", group = true);
                    } else if (level2Element.textContent.trim().match(/^EXPLANATORY/)) {
                        wrapElement(document, level2Element, "level2");
                    }
                }

                // removing unwanted content from ease-content
                
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