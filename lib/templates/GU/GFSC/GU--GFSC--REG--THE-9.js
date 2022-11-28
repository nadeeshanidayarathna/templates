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
                const level1Element = document.querySelector('h2');
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2002-01-01" + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('body');
                wrapElement(document, contentElement, "ease-content");

                const titleElements = document.querySelectorAll("h3, h4, .section1 > p");
                let nextLevel = 2;
                for (const elements of titleElements) {
                    if (elements.tagName == 'H3') {
                        if (elements.textContent.trim().match(/^PART/)) {
                            let element = [elements, elements.nextElementSibling];
                            wrapElements(document, element, "level2", group = true);
                            nextLevel = 3;
                        } else if (elements.textContent.trim().match(/SCHEDULE/)) {
                            wrapElement(document, elements, "level2");
                            nextLevel = 3;
                        }
                    } else if (elements.tagName == 'H4') {
                        wrapElement(document, elements, "level3");
                        nextLevel = 4;
                    } else if (elements.tagName == 'P') {
                        if (elements.textContent.trim().match(/^\d\d?[A-Z]?[A-Z]?\./)) {
                            wrapElement(document, elements.previousElementSibling, "level" + nextLevel);
                        }
                    }
                }

                const footnoteElement = document.querySelectorAll('.ftnote > div');
                wrapElements(document, footnoteElement, "footnote");

                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll("a[href^='#_book']"), function (node) { node.removeAttribute("href"); });

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