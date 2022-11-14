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
            await base.downloadPage(page, url, sp, path, null, 'utf16le');

            // 2.Identify
            // 3.Wrap
            await page.waitForSelector("body");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelector('.h1');
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2022-05-25" + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('body');
                wrapElement(document, contentElement, "ease-content");

                const level2Element = document.querySelectorAll('h1');
                for (const elements of level2Element) {
                    let element = [elements, elements.nextElementSibling];
                    wrapElements(document, element, "level2", group = true);
                }

                const level3Element = document.querySelectorAll('div p b');
                for (const elements of level3Element) {
                    if (elements.textContent.trim().match(/^\d+\./)) {
                        let titles = /^\d+\./.exec(elements.textContent.trim());
                        let texts = elements.textContent.replace(titles, "");
                        elements.outerHTML = elements.outerHTML.replace(elements.innerHTML, "<div class=\"level3\" title=\"level3\">" + titles + "</div><div>" + texts + "</div>");
                    }
                }

                const level3Elements = document.querySelectorAll('.h3');
                wrapElements(document, level3Elements, "level3");

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