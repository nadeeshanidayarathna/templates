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
            await page.waitForSelector("body");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelector('.h1');
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2022-12-06" + "T00:00:00");
                wrapElementDate(document, "effective-date", "2022-01-01" + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('body');
                wrapElement(document, contentElement, "ease-content");

                const elements = document.querySelectorAll('h1, h2, h3, h4, h5');
                for (const element of elements) {
                    if (element.tagName == 'H2' && element.textContent.trim().match(/^TÍTULO/)) {
                        let level2Element = [element, element.nextElementSibling];
                        wrapElements(document, level2Element, "level2", group = true);
                    } else if (element.tagName == 'H3' && element.textContent.trim().match(/^CAPÍTULO/)) {
                        let level3Element = [element, element.nextElementSibling];
                        wrapElements(document, level3Element, "level3", group = true);
                    } else if (element.tagName == 'H4' && element.textContent.trim().match(/^Seção/)) {
                        let level4Element = [element, element.nextElementSibling];
                        wrapElements(document, level4Element, "level4", group = true);
                    } else if (element.tagName == 'H5' && element.textContent.trim().match(/^Subseção/)) {
                        let level5Element = [element, element.nextElementSibling];
                        wrapElements(document, level5Element, "level5", group = true);
                    } else if (element.tagName == 'H1') {
                        wrapElement(document, element, "level2");
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