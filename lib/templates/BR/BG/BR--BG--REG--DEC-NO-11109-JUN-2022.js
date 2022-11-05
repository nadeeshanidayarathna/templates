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
                const level1Element = document.querySelector('blockquote > p');
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2022-06-29" + "T00:00:00");
                wrapElementDate(document, "effective-date", "2022-06-29" + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('body');
                wrapElement(document, contentElement, "ease-content");

                const level2Element = document.querySelectorAll('.Textbody  > b, .MsoTitle');
                for (const elements of level2Element) {
                    if (elements.textContent.trim().match(/^DECRETA/) || elements.className == 'MsoTitle') {
                        wrapElement(document, elements, "level2");
                    }
                }

                const level3Element = document.querySelectorAll(".MsoNormal[align='center']");
                for (const elements of level3Element) {
                    if (elements.textContent.trim().match(/^ACORDO/)) {
                        let element2 = [elements, elements.nextElementSibling];
                        wrapElements(document, element2, "level2", group = true);
                    } else if (elements.textContent.trim().match(/^Artigo/)) {
                        let element3 = [elements, elements.nextElementSibling];
                        wrapElements(document, element3, "level3", group = true);
                    }
                }

                const level4Element = document.querySelectorAll(".MsoBodyText[align='center']");
                for (const elements of level4Element) {
                    if (elements.textContent.trim().match(/^\d+\./)) {
                        wrapElement(document, elements, "level3");
                    }
                }

                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll("img"), function (node) { node.remove(); });

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