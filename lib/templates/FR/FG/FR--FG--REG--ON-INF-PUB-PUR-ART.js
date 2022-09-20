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
            await page.waitForSelector("body");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############

                // TODO:
                const level1Element = document.querySelector(".main-col > .head-code-page  > h1");
                wrapElement(document, level1Element, "level1");
        
                wrapElementDate(document, "issue-date", "2006-03-10" + "T00:00:00");
              //  wrapElementDate(document, "effective-date", "2023-01-02" + "T00:00:00");
                // ################
                // # content:info #
                // ################

                // TODO:
                const content = document.querySelectorAll("body")[0];
                wrapElement(document, content, "ease-content");

                var note = document.querySelector(".nota").insertAdjacentHTML("beforebegin","<p>NOTA:</p>")
                
                Array.prototype.forEach.call(document.querySelectorAll(".main-col > .head-code-page > .small-search-block"), function (node) { node.remove(); });
                Array.prototype.forEach.call(document.querySelectorAll(".main-col > .head-code-page > .loda"), function (node) { node.remove(); });
               Array.prototype.forEach.call(document.querySelectorAll("header"), function (node) { node.remove(); });
               Array.prototype.forEach.call(document.querySelectorAll("body article> div > .tabs-secondary"), function (node) { node.remove(); });

               
             
                 const level2Elements = document.querySelectorAll('.main-col > .page-content > ul > li > article > div > div > .name-article');
               wrapElements(document, level2Elements, 'level2');

             


            //    const footnoteElement = document.querySelectorAll("div > div > .MsoFootnoteText");
            //    wrapElements(document, footnoteElement, "footnote");

                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll("footer"), function (node) { node.remove(); });
               Array.prototype.forEach.call(document.querySelectorAll("#modal-timeline"), function (node) { node.remove(); });
               Array.prototype.forEach.call(document.querySelectorAll("#idCookiesModal"), function (node) { node.remove(); });
              Array.prototype.forEach.call(document.querySelectorAll(".links-init-version"), function (node) { node.remove(); });
              Array.prototype.forEach.call(document.querySelectorAll(".options-list"), function (node) { node.remove(); });
              Array.prototype.forEach.call(document.querySelectorAll(".back-top"), function (node) { node.remove(); });
               
             
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