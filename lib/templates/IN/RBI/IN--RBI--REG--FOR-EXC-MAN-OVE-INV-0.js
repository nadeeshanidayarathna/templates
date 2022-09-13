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
            await page.waitForSelector(".tablecontent2");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelector('.tablebg tr:nth-of-type(2) b');
                wrapElement(document, level1Element, "level1");

                const issueDateText = document.querySelector("p[align='RIGHT']").textContent;
                const issueDate = (new Date(issueDateText).getFullYear()) + "-" + ("0" + (new Date(issueDateText).getMonth() + 1)).slice(-2) + "-" + ("0" + (new Date(issueDateText).getDate())).slice(-2)
                wrapElementDate(document, "issue-date", issueDate + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('.tablecontent2');
                wrapElement(document, contentElement, "ease-content");

                const level2Element = document.querySelectorAll('p > .head');
                wrapElements(document, level2Element, "level2");
                
                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelector(".tablebg tr:first-of-type .tableheader"), function (node) { node.remove(); });

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