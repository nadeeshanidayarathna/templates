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
                const level1Element = document.querySelector('.h1');
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2016-06-08" + "T00:00:00");
                wrapElementDate(document, "effective-date", "2018-10-08" + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('body');
                wrapElement(document, contentElement, "ease-content");

                const level2Element = document.querySelectorAll('h1');
                wrapElements(document, level2Element, "level2");

                const level3Element = document.querySelectorAll('p > span');
                for (const elements of level3Element) {
                    if (elements.textContent.trim().match(/^\d\.\d/)) {
                        wrapElement(document, elements, 'level3');
                    }
                }

                const footnoteElement = document.querySelector('.ftnote');
                wrapElement(document, footnoteElement, 'footnote');
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