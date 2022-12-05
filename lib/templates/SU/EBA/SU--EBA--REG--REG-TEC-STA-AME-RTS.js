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
                wrapElementLevel1(document, "Regulatory Technical Standards amending RTS on CVA proxy spread");
                wrapElementDate(document, "issue-date", "2017-06-21" + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('body');
                wrapElement(document, contentElement, "ease-content");

                const level2Element = document.querySelectorAll('h2');
                wrapElements(document, level2Element, "level2");

                const level3Element = document.querySelectorAll('h3');
                wrapElements(document, level3Element, "level3");

                const level4Element = document.querySelectorAll('h4');
                wrapElements(document, level4Element, "level4");

                const level5Element = document.querySelectorAll('h5');
                wrapElements(document, level5Element, "level5");

                const footnoteElement = document.querySelectorAll("p[id^='h.']");
                for (const elements of footnoteElement) {
                    if (elements.textContent.trim().match(/^\[/)) {
                        wrapElement(document, elements, "footnote");
                    }
                }

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