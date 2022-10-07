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
                const level1Element = document.querySelectorAll(".Title-of-Act")[0];
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2022-06-01" + "T00:00:00");
                // ################
                // # content:info #
                // ################
                const content = document.querySelectorAll(".container>.row")[4];
                wrapElement(document, content, "ease-content");


                const level2Elements = document.querySelectorAll("h2>.HTitleText1");
                wrapElements(document, level2Elements, "level2");


                const level3Elements = document.querySelectorAll("h3>.HTitleText2");
                wrapElements(document, level3Elements, "level3");


                var level4Elements = document.querySelectorAll(".MarginalNote");
                wrapElements(document, level4Elements, "level4");


                const forFootnoteElements = document.querySelectorAll("div.Footnote>p.Footnote");
                wrapElements(document, forFootnoteElements, "footnote");


                // removing unwanted content from ease-content    
                Array.prototype.forEach.call(document.querySelectorAll(".legisHeader,.FCSelector,.wb-invisible,nav,.PITLink,.mfp-hide"), function (node) { node.remove(); });


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