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
                const issueDates = document.querySelectorAll('.LegDateDate')[0];
                const dateStr = issueDates.textContent.replaceAll("st", "").replaceAll("nd", "").replaceAll("rd", "").replaceAll("th", "");
                const issueDate = (new Date(dateStr).getFullYear()) + "-" + ("0" + (new Date(dateStr).getMonth() + 1)).slice(-2) + "-" + ("0" + (new Date(dateStr).getDate())).slice(-2)
                wrapElementDate(document, "issue-date", issueDate + "T00:00:00");
                const effectiveDates = document.querySelectorAll('.LegDateDate')[2];
                const effDateStr = effectiveDates.textContent.replaceAll("st", "").replaceAll("nd", "").replaceAll("rd", "").replaceAll("th", "");
                const effectiveDate = (new Date(effDateStr).getFullYear()) + "-" + ("0" + (new Date(effDateStr).getMonth() + 1)).slice(-2) + "-" + ("0" + (new Date(effDateStr).getDate())).slice(-2)
                wrapElementDate(document, "effective-date", effectiveDate + "T00:00:00");
                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('#viewLegSnippet');
                wrapElement(document, contentElement, "ease-content");

                const level2Element = document.querySelectorAll('#viewLegSnippet h2');
                wrapElements(document, level2Element, "level2");

                const level3Element = document.querySelectorAll('#viewLegSnippet h3');
                wrapElements(document, level3Element, "level3");

                const level4Element = document.querySelectorAll('#viewLegSnippet h4');
                wrapElements(document, level4Element, "level4");

                const footnoteElement = document.querySelectorAll('#viewLegSnippet .LegFootnote');
                wrapElements(document, footnoteElement, "footnote");

                const spaceAlter = document.querySelectorAll('.LegChapterNo, .LegScheduleNo, .LegPartNo');
                for (const elements of spaceAlter) {
                 let texts = elements.innerHTML;
                 elements.innerHTML = elements.innerHTML.replace(elements.innerHTML, texts + "<span> </span>");
                }
 
                const bulletAlter = document.querySelectorAll('.ULUnknown');
                for (const elements of bulletAlter) {
                    let texts = elements.innerHTML;
                    elements.outerHTML = elements.outerHTML.replace(elements.innerHTML, "<span> - </span>" + texts);
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