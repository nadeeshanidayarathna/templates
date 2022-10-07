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

                // TODO:
                const level1Element = document.querySelector("#MainContent_pnlHtmlControls>div >.WordSection1>p:nth-child(2)");
                wrapElement(document, level1Element, "level1");

                wrapElementDate(document, "issue-date", "2021-09-16" + "T00:00:00");
                wrapElementDate(document, "effective-date", "2022-01-01" + "T00:00:00");
                // ################
                // # content:info #
                // ################

                // TODO:
                const content = document.querySelectorAll("#MainContent_pnlHtmlControls")[0];
                wrapElement(document, content, "ease-content");
                Array.prototype.forEach.call(document.querySelectorAll("#MainContent_pnlHtmlControls>div > div >p img"), function (node) { node.remove(); });
                Array.prototype.forEach.call(document.querySelectorAll(".PSTOCHead"), function (node) { node.remove(); });
                Array.prototype.forEach.call(document.querySelectorAll(".MsoToc1"), function (node) { node.remove(); });

                const level2Elements = document.querySelectorAll("p>b");
                for (const level2Element of level2Elements) {
                    if (level2Element.textContent.match(/^Schedule/)) {
                        wrapElement(document, level2Element, "level2");
                    }  
                }
                
                const level21Elements = document.querySelectorAll('.PSBodyHead1');
                wrapElements(document, level21Elements, 'level3');

                const level22Elements = document.querySelectorAll('.PSAttachTitle');
                wrapElements(document, level22Elements, 'level3');


                const level3Elements = document.querySelectorAll('#MainContent_pnlHtmlControls>div >div:last-of-type > div ');
                wrapElements(document, level3Elements, 'footnote');



                // removing unwanted content from ease-content

                // Array.prototype.forEach.call(document.querySelectorAll(".detail_gn"), function (node) { node.remove(); });
                // TODO:

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