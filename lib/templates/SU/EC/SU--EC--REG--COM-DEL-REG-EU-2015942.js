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
            await page.waitForSelector(".tabContent");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelectorAll('.tabContent .doc-ti');
                let level1Elements = [level1Element[0], level1Element[1], level1Element[2]];
                wrapElements(document, level1Elements, "level1", group = true);
                wrapElementDate(document, "issue-date", "2015-03-04" + "T00:00:00");
                wrapElementDate(document, "effective-date", "2015-06-29" + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('.tabContent');
                wrapElement(document, contentElement, "ease-content");

                const level2Elements = document.querySelectorAll('.tabContent .doc-ti');
                wrapElement(document, level2Elements[4], "level2");
                wrapElement(document, level2Elements[5], "level3");

                const level2Element = document.querySelectorAll('.ti-art');
                for (const element of level2Element) {
                    let titles = [element, element.nextElementSibling];
                    wrapElements(document, titles, "level2", group = true);
                }

                const level3Element = document.querySelectorAll('.ti-grseq-1');
                for (const element of level3Element) {
                    if (element.textContent.trim().match(/^PART/)) {
                        wrapElement(document, element, "level4");
                    } else if (element.textContent.trim().match(/^Section/)) {
                        wrapElement(document, element, "level5");
                    }
                }

                const footnoteElement = document.querySelectorAll('p.note');
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