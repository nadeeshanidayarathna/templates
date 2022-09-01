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
            await page.waitForSelector("#MainContent_pnlHtmlControls");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelector('.ShortT');
                wrapElement(document, level1Element, "level1");
                const issueDates = document.querySelector(".WordSection1 > p:nth-of-type(4) > span");
                const issueDate = (new Date(issueDates.textContent).getFullYear()) + "-" + ("0" + (new Date(issueDates.textContent).getMonth() + 1)).slice(-2) + "-" + ("0" + (new Date(issueDates.textContent).getDate())).slice(-2)
                wrapElementDate(document, "issue-date", issueDate + "T00:00:00");
                const effectiveDates = document.querySelector(".WordSection1 > p:nth-of-type(6) > span");
                const effectiveDate = (new Date(effectiveDates.textContent).getFullYear()) + "-" + ("0" + (new Date(effectiveDates.textContent).getMonth() + 1)).slice(-2) + "-" + ("0" + (new Date(effectiveDates.textContent).getDate())).slice(-2)
                wrapElementDate(document, "effective-date", effectiveDate + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('#MainContent_pnlHtmlControls');
                wrapElement(document, contentElement, "ease-content");

                const level2Element = document.querySelectorAll('.WordSection1 > p:nth-of-type(8) > b > span, .LongT');
                wrapElements(document, level2Element, "level2");

                let i = 0;
                const level3Elements = document.querySelectorAll('.WordSection1 > p > b, .WordSection4 > .ENotesHeading1, .WordSection3 > .ActHead5');
                for (const level3Element of level3Elements) {
                    if (i > 6) {
                        wrapElement(document, level3Element, "level3"); console.log(level3Element.textContent)
                    }i++;
                }

                const level4Elements = document.querySelectorAll('.WordSection4 > .ENotesHeading2');
                wrapElements(document, level4Elements, "level4");

                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll(".WordSection1 img, .WordSection2"), function (node) { node.remove(); });

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