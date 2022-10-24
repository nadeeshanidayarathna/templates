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
            await page.waitForSelector(".px-0");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelectorAll(".Titel2")[0];
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2021-04-22" + "T00:00:00");
                wrapElementDate(document, "effective-date", "2021-04-30" + "T00:00:00");
                // ################
                // # content:info #
                // ################
                const content = document.querySelectorAll(".px-0")[0];
                wrapElement(document, content, "ease-content");


                const level2Elements = document.querySelectorAll(".Kapitel");
                const level2Elements2 = document.querySelectorAll(".KapitelOverskrift2");
                for (var i = 0; i < level2Elements.length; i++) {
                    wrapElements(document, [level2Elements[i], level2Elements2[i]], "level2", group = true);
                }


                const level3Element = document.querySelectorAll(".ParagrafGruppeOverskrift");
                wrapElements(document, level3Element, "level3");


                const level4Element = document.querySelectorAll(".ParagrafNr");
                wrapElements(document, level4Element, "level4");


                // removing unwanted content from ease-content    
                Array.prototype.forEach.call(document.querySelectorAll(".metadata-box-header"), function (node) { node.remove(); });


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