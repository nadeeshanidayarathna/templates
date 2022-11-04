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

                wrapElementLevel1(document, "Nasdaq Futures, Inc. Rulebook - Reference Guides & Alerts - NFX Combination & Implied Orders Technical Reference Document");
                wrapElementDate(document, "issue-date", "2017-07-10" + "T00:00:00");
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

                const level5Element = document.querySelectorAll('h5');                
                for (const elements of level5Element) {
                    if (elements.textContent.trim() != "") {
                        wrapElement(document, elements, "level5");
                    }
                }

                const level6Element = document.querySelectorAll('h6, .c260');                
                for (const elements of level6Element) {
                    if (elements.textContent.trim() != "") {
                        wrapElement(document, elements, "level6");
                    }
                }

                const level7Element = document.querySelectorAll('p');                
                for (const elements of level7Element) {
                    if (elements.textContent.trim().match(/^\d\.\d\.\d\.\d\.\d\.\d\s/)) {
                        wrapElement(document, elements, "level7");
                    }
                }


                const footnoteElement = document.querySelector('#ftn1');
                wrapElement(document, footnoteElement, "footnote")

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