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
                const level1Elements = document.querySelectorAll(".MsoNormal>b")[0];
                //level1Elements[0].textContent = level1Elements[0].textContent + " "
                wrapElement(document, level1Elements, "level1");
                wrapElementDate(document, "issue-date", "2020-03-27" + "T00:00:00");
                wrapElementDate(document, "effective-date", "2020-01-01" + "T00:00:00");
                // ################
                // # content:info # 
                // ################
                const content = document.querySelector("#MainContent_pnlHtmlControls");
                wrapElement(document, content, "ease-content");



                const level2And4Elements = document.querySelectorAll(".MsoNormal>b")
                wrapElements(document, [level2And4Elements[1], level2And4Elements[5]], "level2");


                const level3Element = document.querySelectorAll("h2>span")[7]
                const level3And4Element = document.querySelectorAll("h1")
                wrapElements(document, [level3Element, level3And4Element[3]], "level3", group = true);

                const level3Elements2 = document.querySelectorAll(".MsoBodyText")
                wrapElements(document, [level3And4Element[16], level3Elements2[0], level3And4Element[17]], "level3", group = true);
                wrapElements(document, [level3And4Element[18], level3Elements2[7], level3And4Element[19]], "level3", group = true);

                const level3Elements3 = document.querySelectorAll(".D2Aform>b")
                wrapElements(document, [level3Elements3[0], level3Elements3[120]], "level3");


                const level4Elements = Array.from(document.querySelectorAll("h1")).slice(4, 16);
                wrapElements(document, level4Elements, "level4");
                wrapElements(document, [level2And4Elements[74], level2And4Elements[23]], "level4");

                
                const forFootnoteElements = document.querySelectorAll(".MsoFootnoteText,#ftn3");
                wrapElements(document, forFootnoteElements, "footnote");


                //fixing ol items in the transform
                const olItems = document.querySelectorAll("ul>li");
                for (const contentChild of olItems) {
                    contentChild.outerHTML = "<div>&bull; " + contentChild.outerHTML + "</div>";
                }


                // removing unwanted content from ease-content    
                Array.prototype.forEach.call(document.querySelectorAll("img"), function (node) { node.remove(); });

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