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
            await page.waitForSelector(".act");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelector('.act-title');
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "1978-10-13" + "T00:00:00");
                wrapElementDate(document, "effective-date", "1978-09-25" + "T00:00:00");
                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('.act');
                wrapElement(document, contentElement, "ease-content");

                const level2Element = document.querySelectorAll('.heading-part');
                wrapElements(document, level2Element, "level2");

                const level3Elements = document.querySelectorAll('.num');
                for (const level3Element of level3Elements) {
                    if (/\d[A-Z]*\./.test(level3Element.textContent.trim())) {
                        wrapElement(document, level3Element, 'level3');
                    }
                }

                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll(".act > table:first-of-type  img, .subleg, #preamble"), function (node) { node.remove(); });

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