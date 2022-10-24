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
                const level1Elements = document.querySelectorAll(".MsoNormal>b");
                wrapElements(document, [level1Elements[0], level1Elements[1]], "level1", group = true);
                wrapElementDate(document, "issue-date", "2022-06-22" + "T00:00:00");
                wrapElementDate(document, "effective-date", "2022-07-01" + "T00:00:00");
                // ################
                // # content:info #
                // ################
                const content = document.querySelector("#MainContent_pnlHtmlControls");
                wrapElement(document, content, "ease-content");


                const level2Element = document.querySelectorAll("h1,h2");
                wrapElements(document, level2Element, "level2");


                const forFootnoteElements = document.querySelectorAll(".MsoFootnoteText");
                var prevoiuseFnID = ""
                for (contentChild of forFootnoteElements) {
                    if (contentChild.parentElement.id != prevoiuseFnID) {
                        wrapElement(document, contentChild.parentElement, "footnote");
                        prevoiuseFnID = contentChild.parentElement.id
                    }
                }


                // removing unwanted content from ease-content    
                Array.prototype.forEach.call(document.querySelectorAll("img,.MsoToc2,.MsoToc1"), function (node) { node.remove(); });
                Array.prototype.forEach.call([document.querySelectorAll(".Heading")[1]], function (node) { node.remove(); });


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