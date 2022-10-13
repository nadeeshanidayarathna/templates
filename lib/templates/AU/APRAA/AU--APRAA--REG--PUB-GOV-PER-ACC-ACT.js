const { group } = require("yargs");
const base = require("../../../common/base");
const scraper = async function download(url, sp, path) {
    try {
        console.log("callings scraper url:" + url + " sp:" + sp + " path:" + path);
        const browser = await base.puppeteer().launch({
            headless: false,
            devtools: false,
            ignoreHTTPSErrors: true
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
                const level1Element = document.querySelectorAll(".ShortT")[0];
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2017-08-28" + "T00:00:00");
                // ################
                // # content:info # 
                // ################
                const content = document.querySelector("#MainContent_pnlHtmlControls");
                wrapElement(document, content, "ease-content");


                const level2Elements = document.querySelectorAll(".ActHead1")
                wrapElements(document, level2Elements, "level2");

                const level2Elements2 = document.querySelectorAll(".ENotesHeading1")
                wrapElements(document, level2Elements2, "level2");


                const level3Elements = document.querySelectorAll(".ActHead2")
                wrapElements(document, level3Elements, "level3");

                const level3Elements2 = document.querySelectorAll(".ENotesHeading2")
                wrapElements(document, level3Elements2, "level3");


                const level4Elements = document.querySelectorAll(".ActHead3")
                wrapElements(document, level4Elements, "level4");


                const level5Elements = document.querySelectorAll(".ActHead4")
                wrapElements(document, level5Elements, "level5");


                const level6Elements = document.querySelectorAll(".ActHead5")
                wrapElements(document, level6Elements, "level6");


                // removing unwanted content from ease-content    
                Array.prototype.forEach.call(document.querySelectorAll("img,.WordSection2"), function (node) { node.remove(); });


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