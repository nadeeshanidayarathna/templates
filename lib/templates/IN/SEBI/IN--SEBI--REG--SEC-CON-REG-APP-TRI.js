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
                const level1Element = document.querySelector('h1');
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2018-07-02" + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('body');
                wrapElement(document, contentElement, "ease-content");

                const level2Element = document.querySelector('h2');
                wrapElement(document, level2Element, "level2");

                const level3Element = document.querySelectorAll('h3');
                wrapElements(document, level3Element, "level3");

                const level4Element = document.querySelectorAll('h4');
                wrapElements(document, level4Element, "level4");

                const level5Element = document.querySelector('h5');
                wrapElement(document, level5Element, "level5");

                const alterText = document.querySelectorAll('.c20, .c4');
                for (const elements of alterText) {
                    let texts = elements.textContent.trim();
                    elements.outerHTML = elements.outerHTML.replace(elements.outerHTML, "<sup>" + texts + "</sup>");
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