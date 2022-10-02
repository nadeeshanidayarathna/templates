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
            await page.waitForSelector(".WordSection1");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelector('.h1');
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2015-10-03" + "T00:00:00");
                wrapElementDate(document, "effective-date", "2016-02-03" + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('.WordSection1');
                wrapElement(document, contentElement, "ease-content");

                const elements = document.querySelectorAll('.h2, .h3, .h4, .Heading2Char');
                let nextLevel = 2;
                for (const element of elements) {
                    if (element.className == 'h2') {
                        wrapElement(document, element, "level2");
                        nextLevel = 3;
                    } else if (element.className == 'h3') {
                        wrapElement(document, element, "level3");
                        nextLevel = 4;
                    } else if (element.className == 'h4') {
                        wrapElement(document, element, "level4");
                        nextLevel = 5;
                    } else if (element.className == 'Heading2Char' && element.textContent.trim().match(/^\d/)) {
                        let article = [element.previousElementSibling, element];
                        wrapElements(document, article, "level" + nextLevel, group = true);
                    }
                }

                const level4Element = document.querySelectorAll('.SpellE');
                for (const elements of level4Element) {
                    if (elements.textContent.trim().match(/^Disposición/) && elements.nextElementSibling.tagName == 'B') {
                        let element = [elements, elements.nextElementSibling];
                        wrapElements(document, element, "level4", group = true);
                    }
                }

                const level5Element = document.querySelectorAll('b');
                for (const elements of level5Element) {
                    if (elements.textContent.trim().match(/^«/)) {
                        wrapElement(document, elements, "level5");
                    }
                }
                // wrapElement(document, level2Element, "level2");
                // wrapElement(document, level3Element, "level3");
                // wrapElement(document, level4Element, "level4");
                // wrapElement(document, level5Element, "level5");
                // wrapElement(document, level6Element, "level6");
                // wrapElement(document, level7Element, "level7");
                // wrapElement(document, level8Element, "level8");
                // wrapElement(document, level9Element, "level9");
                // wrapElement(document, footnoteElement, "footnote");

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