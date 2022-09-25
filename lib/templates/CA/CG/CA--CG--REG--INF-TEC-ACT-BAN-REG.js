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
                const level1Element = document.querySelector('.Title-of-Act');
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2022-09-15" + "T00:00:00");
                wrapElementDate(document, "effective-date", "2022-09-15" + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('main');
                wrapElement(document, contentElement, "ease-content");

                const level2Element = document.querySelectorAll('h2.Part');
                wrapElements(document, level2Element, "level2");

                const level3Element = document.querySelectorAll('.MarginalNote');
                wrapElements(document, level3Element, "level3");

                const elements = document.querySelectorAll('.wb-invisible');
                for (const element of elements) {
                    element.outerHTML = element.outerHTML.replace(element.innerHTML, "");
                }

                const footnoteElement = document.querySelectorAll('div.Footnote');
                wrapElements(document, footnoteElement, "footnote");

                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll(".legisHeader, .FCSelector, #right-panel, div.PITLink"), function (node) { node.remove(); });

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