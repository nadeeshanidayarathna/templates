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
            await page.waitForSelector(".portlet");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelector("h2");
                wrapElement(document, level1Element, "level1");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector(".portlet");
                wrapElement(document, contentElement, "ease-content");

                const level1Elements = document.querySelectorAll("h2[align='center']");
                wrapElements(document, level1Elements, "level2");

                const level3Elements = document.querySelectorAll("b");
                wrapElements(document, level3Elements, "level3");

                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll(".huiUnderline"), function (node) { node.remove(); });

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