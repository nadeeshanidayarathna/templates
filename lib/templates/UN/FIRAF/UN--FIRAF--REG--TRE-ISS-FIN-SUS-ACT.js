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
            await page.waitForSelector("main");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelector('main h1')
                wrapElement(document, level1Element, "level1");
                const dates = document.querySelectorAll("div.content .clearfix > p > b")[2];
                const issueDates = /[A-Z][a-z]+\s\d+,\s\d{4}/.exec(dates.childNodes[3].textContent.trim());
                const effectiveDates = /[A-Z][a-z]+\s\d+,\s\d{4}/.exec(dates.childNodes[0].textContent.trim());
                const issueDate = (new Date(issueDates).getFullYear()) + "-" + ("0" + (new Date(issueDates).getMonth() + 1)).slice(-2) + "-" + ("0" + (new Date(issueDates).getDate())).slice(-2)
                wrapElementDate(document, "issue-date", issueDate + "T00:00:00");
                const effectiveDate = (new Date(effectiveDates).getFullYear()) + "-" + ("0" + (new Date(effectiveDates).getMonth() + 1)).slice(-2) + "-" + ("0" + (new Date(effectiveDates).getDate())).slice(-2)
                wrapElementDate(document, "effective-date", effectiveDate + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('main');
                wrapElement(document, contentElement, "ease-content");

                const level2Element = document.querySelectorAll("div.content .clearfix > p > b");
                let i = 0;
                for (const elements of level2Element) {
                    if ((i > 2 && i < 6) || i == 14) {
                        wrapElement(document, elements, "level2");
                    } else if (i > 5 && i < 14) {
                        wrapElement(document, elements, "level3");
                    }
                    i++;
                }

                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll("#tab-links, #comments"), function (node) { node.remove(); });

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