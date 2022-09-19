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
                const level1Element = document.querySelector("h1");
                wrapElement(document, level1Element, "level1");
        
                wrapElementDate(document, "issue-date", "2022-07-13" + "T00:00:00");
                wrapElementDate(document, "effective-date", "2023-01-02" + "T00:00:00");
                // ################
                // # content:info #
                // ################

                // TODO:
                const content = document.querySelectorAll("body")[0];
                wrapElement(document, content, "ease-content");
               // Array.prototype.forEach.call(document.querySelectorAll("#MainContent_pnlHtmlControls > div > .WordSection2"), function (node) { node.remove(); });
               
               
               
               const level31Elements = document.querySelectorAll('h3');
               for (const level31Element of level31Elements) {
                   if (level31Element.textContent.match(/^Art\.\s\d+[º.]/)) {
                       const level31text = /^Art\.\s\d+[º.]/.exec(level31Element.textContent);
                       level31Element.outerHTML = level31Element.outerHTML.replace(level31text, "<div title=\"level2\" class=\"level2\">" + level31text + "</div>");
                   }
               }
                 const level2Elements = document.querySelectorAll('h2');
               wrapElements(document, level2Elements, 'level2');

               const level3Elements = document.querySelectorAll('p>span');
               for (const level3Element of level3Elements) {
                   if (level3Element.textContent.match(/^Art\.\s\d+[º.]/)) {
                       const level3text = /^Art\.\s\d+[º.]/.exec(level3Element.textContent);
                       level3Element.outerHTML = level3Element.outerHTML.replace(level3text, "<div title=\"level3\" class=\"level3\">" + level3text + "</div>");
                   }
               }


               const footnoteElement = document.querySelectorAll("div > div > .MsoFootnoteText");
               wrapElements(document, footnoteElement, "footnote");

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