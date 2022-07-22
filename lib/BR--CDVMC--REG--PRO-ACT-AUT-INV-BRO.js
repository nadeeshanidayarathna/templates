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
            await page.waitForSelector(".c36");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############

                // TODO:
                const level1Element = document.querySelectorAll(".c13")[0];
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document,"issue-date", "2011-06-03" + "T00:00:00");
                wrapElementDate(document, "effective-date", "2012-01-01" + "T00:00:00");

                // ################
                // # content:info #
                // ################

                // TODO:
                const contentElement = document.querySelectorAll('.c36')[0];
                wrapElement(document, contentElement, "ease-content");

                const level2Elements = document.querySelectorAll('.c13 > span.c0');
                for (const level2Element of level2Elements) {
                    if (level2Element.textContent != "") {
                        wrapElement(document, level2Element, "level2");
                    }
                }

                const level3Elements = document.querySelectorAll('h3');
                for (const level3Element of level3Elements) {
                    wrapElement(document, level3Element, "level3");
                }

                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll("span.c1, span.c8"), function (node) { node.remove(); });

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