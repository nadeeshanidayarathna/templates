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
            await page.waitForSelector("#textTabContent");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############

                const rootTitle = document.querySelectorAll('.oj-doc-ti');
                wrapElementLevel1(document, rootTitle[0].textContent + " " + rootTitle[1].textContent);

                wrapElementDate(document, "issue-date", "2022-03-10" + "T00:00:00");
               wrapElementDate(document, "effective-date", "2014-03-19" + "T00:00:00");

                // ################
                // # content:info #
                // ################

                const content = document.querySelector("#textTabContent");
                wrapElement(document, content, "ease-content");

                const level3Element = document.querySelectorAll('.oj-ti-art');
                wrapElements(document, level3Element, "level3");

                Array.prototype.forEach.call(document.querySelectorAll(".linkToTop, .oj-hd-date, .oj-hd-lg, .oj-hd-ti, .oj-hd-oj"), function (node) { node.remove(); });


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