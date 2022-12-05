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
            await page.waitForSelector("#document1 .tabContent");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Elements = document.querySelectorAll('.doc-ti');
                let level1Element = [level1Elements[0], level1Elements[1], level1Elements[2], level1Elements[3], level1Elements[4]];
                wrapElements(document, level1Element, "level1", group = true);
                // wrapElementLevel1(document, level1Elements[0].textContent + " " + level1Elements[1].textContent + " " + level1Elements[2].textContent + " " + level1Elements[3].textContent + " " + level1Elements[4].textContent);
                wrapElementDate(document, "issue-date", "2006-12-12" + "T00:00:00");
                wrapElementDate(document, "effective-date", "2007-12-12" + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('#document1 .tabContent');
                wrapElement(document, contentElement, "ease-content");

                const level2Element = document.querySelectorAll('.doc-ti');
                for (const element of level2Element) {
                    if (element.textContent.trim().match(/^ANNEX/)) {
                        wrapElement(document, element, "level2");
                    }
                }

                const level2Elements = document.querySelectorAll('.ti-art');
                wrapElements(document, level2Elements, "level2");

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