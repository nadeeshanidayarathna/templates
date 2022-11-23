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
            await page.waitForSelector("#textTabContent");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelectorAll('#textTabContent .doc-ti');
                let level1Elements = [level1Element[0],level1Element[1],level1Element[2],level1Element[3]];
                wrapElements(document, level1Elements, "level1", group = true);
                wrapElementDate(document, "issue-date", "2016-02-16" + "T00:00:00");
                wrapElementDate(document, "effective-date", "2016-06-10" + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('#textTabContent');
                wrapElement(document, contentElement, "ease-content");

                const level2Element = document.querySelectorAll('#textTabContent .doc-ti')[4];
                wrapElement(document, level2Element, "level2");

                const elements = document.querySelectorAll('.ti-section-1, .ti-art');
                let nextLevel = 2;
                for (const element of elements) {
                    if (element.textContent.trim().match(/^C/)) {
                        let titles = [element, element.nextElementSibling];
                        wrapElements(document, titles, "level2", group = true);
                        nextLevel = 3;
                    } else if (element.textContent.trim().match(/^S/)) {
                        let titles = [element, element.nextElementSibling];
                        wrapElements(document, titles, "level3", group = true); 
                        nextLevel = 4;
                    } else if (element.textContent.trim().match(/^A/)) {
                        let titles = [element, element.nextElementSibling];
                        wrapElements(document, titles, "level" + nextLevel, group = true);
                    }
                }

                const footnoteElement = document.querySelectorAll('#textTabContent p.note');
                wrapElements(document, footnoteElement, "footnote");

                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll(".linkToTop, .hd-date, .hd-lg, .hd-ti, .hd-oj"), function (node) { node.remove(); });

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