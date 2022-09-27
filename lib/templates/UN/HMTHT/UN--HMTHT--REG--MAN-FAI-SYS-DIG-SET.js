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
        
                wrapElementDate(document, "issue-date", "2022-05-31" + "T00:00:00");
              //  wrapElementDate(document, "effective-date", "2015-04-29" + "T00:00:00");
                // ################
                // # content:info #
                // ################

                // TODO:
                const content = document.querySelectorAll("body")[0];
                wrapElement(document, content, "ease-content");
               // Array.prototype.forEach.call(document.querySelectorAll("#MainContent_pnlHtmlControls > div > .WordSection2"), function (node) { node.remove(); });


  
               const level21Elements = document.querySelectorAll('h2');
               wrapElements(document, level21Elements, 'level2');

               const level3Elements = document.querySelectorAll('p>span');
               for (const level3Element of level3Elements) {
                   if (level3Element.textContent.match(/^\d+\.\d+/)) {
                       const level3text = /^\d+\.\d+/.exec(level3Element.textContent);
                       level3Element.outerHTML = level3Element.outerHTML.replace(level3text, "<div title=\"level3\" class=\"level3\">" + level3text + "</div>");
                   }
               }

               const level5Elements = document.querySelectorAll('.foot>div');
               wrapElements(document, level5Elements, 'footnote');
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