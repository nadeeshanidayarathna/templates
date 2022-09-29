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
            await page.waitForSelector(".single-ta3n");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelector('.single-ta3n > .single_content:nth-of-type(4) > p');
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2008-05-07" + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('.single-ta3n');
                wrapElement(document, contentElement, "ease-content");

                const level2Element = document.querySelectorAll(".not_online p[align='center'] > b");
                for (const elements of level2Element) {
                    if (elements.textContent.trim().match(/^\(./)) {
                        wrapElement(document, elements, "level2");
                    }
                }

                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll(".single-ta3n > button, .custom-share"), function (node) { node.remove(); });

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