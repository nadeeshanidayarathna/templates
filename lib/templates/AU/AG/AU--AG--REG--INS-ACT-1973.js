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
                const issueDates = document.querySelector(".WordSection1 > p:nth-of-type(4) > span:nth-of-type(2)");
                const issueDate = (new Date(issueDates.textContent).getFullYear()) + "-" + ("0" + (new Date(issueDates.textContent).getMonth() + 1)).slice(-2) + "-" + ("0" + (new Date(issueDates.textContent).getDate())).slice(-2)
                wrapElementDate(document, "issue-date", issueDate + "T00:00:00");
                const effectiveDates = document.querySelector(".WordSection1 > p:nth-of-type(6) > span:nth-of-type(2)");
                const effectiveDate = (new Date(effectiveDates.textContent).getFullYear()) + "-" + ("0" + (new Date(effectiveDates.textContent).getMonth() + 1)).slice(-2) + "-" + ("0" + (new Date(effectiveDates.textContent).getDate())).slice(-2)
                wrapElementDate(document, "effective-date", effectiveDate + "T00:00:00");

                // ################
                // # content:info #
                // ################

                const contentElement = document.querySelector('#MainContent_pnlHtmlControls');
                wrapElement(document, contentElement, "ease-content");

                const level2Element = document.querySelectorAll('.LongT, .WordSection1 > p:nth-of-type(7) > b, .WordSection4 > .ActHead1, .ENotesHeading1');
                wrapElements(document, level2Element, "level2");

                let i = 0;
                const level3Element = document.querySelectorAll('.WordSection1 > p > b');
                for (const element of level3Element) {
                    if (i > 4) {
                        wrapElement(document, element, "level3");
                    }i++;
                }

                const level3Elements = document.querySelectorAll('.WordSection3 .ActHead2, .ENotesHeading2');
                wrapElements(document, level3Elements, "level3");

                const level4Elements = document.querySelectorAll('.WordSection3 .ActHead3');
                wrapElements(document, level4Elements, "level4");

                const level5Elements = document.querySelectorAll('.WordSection3 .ActHead4');
                wrapElements(document, level5Elements, "level5");

                const level6Elements = document.querySelectorAll('.WordSection3 .ActHead5');
                wrapElements(document, level6Elements, "level6");

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