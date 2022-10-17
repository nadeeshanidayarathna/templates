const { group } = require("yargs");
const base = require("../../../common/base");
const scraper = async function download(url, sp, path) {
    try {
        console.log("callings scraper url:" + url + " sp:" + sp + " path:" + path);
        const browser = await base.puppeteer().launch({
            headless: false,
            devtools: false,
        });
        {
            // 1.Download
            console.log("getting url:" + url);
            const page = await browser.newPage();
            await base.downloadPage(page, url, sp, path);
            // 2.Identify
            // 3.Wrap
            await page.waitForSelector(".WordSection1");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelectorAll(".shorttitle")[0];
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2021-12-31" + "T00:00:00");
                wrapElementDate(document, "effective-date", "2021-12-31" + "T00:00:00");
                // ################
                // # content:info #
                // ################
                const content = document.querySelectorAll(".WordSection1")[0];
                wrapElement(document, content, "ease-content");


                const level2Element = document.querySelectorAll("h2");
                for (contentChild of level2Element) {
                    contentChild.textContent = contentChild.textContent.toUpperCase();
                    wrapElement(document, contentChild, "level2");
                }

                const level3Element = document.querySelectorAll("h3");
                for (contentChild of level3Element) {
                    contentChild.textContent = contentChild.textContent.toUpperCase();
                    wrapElement(document, contentChild, "level3");
                }


                const hiddenContents = document.querySelectorAll(".footnoteLeft,.leg-history-inner");
                for (contentChild of hiddenContents) {
                    contentChild.removeAttribute("style")

                }

                // removing unwanted content from ease-content    
                Array.prototype.forEach.call(document.querySelectorAll(".tocExpandable,.MsoNormal>a,.MsoNormalTable"), function (node) { node.remove(); });


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