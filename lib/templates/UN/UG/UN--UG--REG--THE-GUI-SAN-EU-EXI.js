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
            await page.waitForSelector("#viewLegSnippet");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############

                const level1Element = document.querySelector('.LegTitle');
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2019-07-18" + "T00:00:00");
                wrapElementDate(document, "effective-date", "2019-07-19" + "T00:00:00");

                // ################
                // # content:info #
                // ################

                const contentElement = document.querySelector('#viewLegSnippet');
                wrapElement(document, contentElement, "ease-content");

                const level2Element = document.querySelectorAll('#viewLegSnippet h2');                
                wrapElements(document, level2Element, "level2");

                const level3Element = document.querySelectorAll('#viewLegSnippet h3');                
                for (const elements of level3Element) {
                    if (elements.textContent.trim() != "") {
                        wrapElement(document, elements, "level3");
                    }
                }

                const footnoteElement = document.querySelectorAll('#viewLegSnippet .LegCommentaryItem');
                for (const elements of footnoteElement) {
                    if (elements.textContent.trim().match(/^F/)) {
                        wrapElement(document, elements, "footnote");
                    }
                }

                const alterText = document.querySelectorAll('.LegCommentaryType, .LegPartNo, .LegScheduleNo');
                for (const elements of alterText) {
                    elements.outerHTML = elements.outerHTML.replace(elements.outerHTML, elements.outerHTML + "<span> </span>");
                }


                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll("p.crest, .LegExtentRestriction"), function (node) { node.remove(); });

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