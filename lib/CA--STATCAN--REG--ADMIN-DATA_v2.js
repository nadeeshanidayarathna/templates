const base = require("./common/base");

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
            await page.waitForSelector(".region-laurier-first");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const rootTitle = document.querySelectorAll(".region-laurier-first h1")[0];
                wrapElement(document, rootTitle, "level1");

                const issueDate = document.querySelectorAll("dd")[0];
                wrapElementDate(document, "issue-date", issueDate.textContent + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const content = document.querySelectorAll(".region-laurier-first")[0];
                wrapElement(document, content, "ease-content");

                const noticeElement = document.querySelectorAll("strong")[0];
                wrapElement(document, noticeElement, "level2");

                const h2s = document.querySelectorAll(".region-laurier-first section > h2");
                wrapElements(document, h2s, "level2");

                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll(".list-unstyled.mrgn-lft-md"), function (node) { node.remove(); });

                return Promise.resolve();
            });
            // 4.Write
            await base.writePage(page, url, sp, path, true, true);
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