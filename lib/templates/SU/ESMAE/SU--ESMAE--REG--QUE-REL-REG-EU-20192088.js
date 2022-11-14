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
            await base.downloadPage(page, url, sp, path, null, 'utf16le');

            // 2.Identify
            // 3.Wrap
            await page.waitForSelector("body");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                wrapElementLevel1(document, "Questions related to Regulation (EU) 2019/2088 of the European Parliament and of the Council of 27 November 2019 on sustainability‐related disclosures in the financial services sector (SFDR)");
                wrapElementDate(document, "issue-date", "2022-05-13" + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('body');
                wrapElement(document, contentElement, "ease-content");

                const level2Element = document.querySelectorAll('h1');
                wrapElements(document, level2Element, "level2");

                const level3Element = document.querySelectorAll('h2');
                for (const elements of level3Element) {
                    if (elements.textContent.trim().match(/^\d/)) {
                        wrapElement(document, elements, "level3");
                    }
                }

                const level4Element = document.querySelectorAll('h3');
                wrapElements(document, level4Element, "level4");

                const footnoteElement = document.querySelectorAll("div[id^='ftn']");
                wrapElements(document, footnoteElement, "footnote");

                // removing unwanted content from ease-content
                
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