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
            const delayDownload = {
                waitUntil: "networkidle2",
                timeout: 0
            }
            await base.downloadPage(page, url, sp, path, delayDownload);

            // 2.Identify
            // 3.Wrap
            await page.waitForSelector(".middle_content");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelector('#tdLawName');
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2022-01-03" + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('.middle_content');
                wrapElement(document, contentElement, "ease-content");

                const level2Element = document.querySelectorAll('#zhengwen > li > a');
                wrapElements(document, level2Element, "level2");

                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll(".page-header, #buttonsTr, .list_icon1"), function (node) { node.remove(); });

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