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
            await page.waitForSelector("#MainContent_pnlHtmlControls");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                var images = document.querySelectorAll("img");
                images.forEach(e => {
                    e.src = e.src;
                })
                const level1Element = document.querySelectorAll('b span')[0];
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2022-05-05" + "T00:00:00");
                wrapElementDate(document, "effective-date", "2022-04-06" + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('#MainContent_pnlHtmlControls');
                wrapElement(document, contentElement, "ease-content");

                const level2Element = document.querySelectorAll('.MIRHeading1Chapter');
                wrapElements(document, level2Element, "level2");

                const level2ElementN = document.querySelectorAll('.MIRHeading1');
                wrapElements(document, level2ElementN, "level2");

                const level3Element = document.querySelectorAll('.MIRHeading2Part');
                wrapElements(document, level3Element, "level3");

                const level3ElementN = document.querySelectorAll('h2');
                wrapElements(document, level3ElementN, "level3");

                const level4Element = document.querySelectorAll('.MIRHeading3Rule, .MIRHeading3');
                wrapElements(document, level4Element, "level4");

                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll(".MsoToc2, .MsoToc1, .Heading1nonumber, .WordSection1 img"), function (node) { node.remove(); });

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