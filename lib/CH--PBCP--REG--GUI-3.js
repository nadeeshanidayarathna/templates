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
                wrapElementDate(document, "issue-date", document.querySelector("#shijian").textContent.split(" ")[0] + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector(".portlet");
                wrapElement(document, contentElement, "ease-content");

                const level2Elements = document.querySelectorAll("h1[align='center']");
                wrapElements(document, level2Elements, "level2");

                const level3Elements = document.querySelectorAll("b");
                for (const level3Element of level3Elements) {
                    if (level3Element.parentNode.align != 'center') {
                        wrapElement(document, level3Element, "level3");
                    }
                }

                // removing unwanted content from ease-content
                document.querySelector(".hui12").remove();
                Array.prototype.forEach.call(document.querySelectorAll(".hui12[align='left']"), function (node) { node.remove(); });
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