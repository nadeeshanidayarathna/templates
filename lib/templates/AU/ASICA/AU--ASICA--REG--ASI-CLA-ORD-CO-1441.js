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
                const level1Element = document.querySelector(".atitle");
                wrapElement(document, level1Element, "level1");

                wrapElementDate(document, "issue-date", "2014-02-10" + "T00:00:00");
                wrapElementDate(document, "effective-date", "2014-03-02" + "T00:00:00");
                // ################
                // # content:info #
                // ################

                // TODO:
                const content = document.querySelectorAll("#MainContent_pnlHtmlControls")[0];
                wrapElement(document, content, "ease-content");
            

                const level2Elements = document.querySelectorAll('p:nth-child(18)');
                wrapElements(document, level2Elements, 'level2');

                const level22Elements = document.querySelectorAll('p:nth-child(24)');
                wrapElements(document, level22Elements, 'level2');

                const level23Elements = document.querySelectorAll('p:nth-child(29)');
                wrapElements(document, level23Elements, 'level2');

                const level24Elements = document.querySelectorAll('p:nth-child(47)');
                wrapElements(document, level24Elements, 'level2');

                const level25Elements = document.querySelectorAll('.aNotetoclassorder');
                wrapElements(document, level25Elements, 'level2');

                const level3Elements = document.querySelectorAll('.aNote1');
                wrapElements(document, level3Elements, 'level3');

                const level4Elements = document.querySelectorAll('.aTableof');
                wrapElements(document, level4Elements, 'level4');


               
                

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