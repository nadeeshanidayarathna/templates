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
            await page.waitForSelector(".detail_con");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############

                const level1Element = document.querySelectorAll('.detail_tit')[0];
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "1999-10-18" + "T00:00:00");

                // ################
                // # content:info #
                // ################

                const contentElement = document.querySelectorAll('.detail_con')[0];
                wrapElement(document, contentElement, "ease-content");

                const level2elements = document.querySelectorAll('p');
                wrapElement(document, level2elements[0], "level2");

                const level2Elements = document.querySelectorAll('font');
                for (const level2Element of level2Elements) {
                    if (level2Element.textContent.trim().startsWith('附件：')) {
                        wrapElement(document, level2Element, "level2");
                    }
                }
                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.getElementsByTagName("li"), function (node) { node.style.listStyleType = 'none'; });
                Array.prototype.forEach.call(document.querySelectorAll(".detail_gn, .list_mtit"), function (node) { node.remove(); });

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