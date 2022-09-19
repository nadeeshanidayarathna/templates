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
        
                wrapElementDate(document, "issue-date", "1996-09-13" + "T00:00:00");
                wrapElementDate(document, "effective-date", "1996-09-13" + "T00:00:00");
                // ################
                // # content:info #
                // ################

                // TODO:
                const content = document.querySelectorAll("body")[0];
                wrapElement(document, content, "ease-content");
               // Array.prototype.forEach.call(document.querySelectorAll("#MainContent_pnlHtmlControls > div > .WordSection2"), function (node) { node.remove(); });

                 const level2Elements = document.querySelectorAll('h2');
               wrapElements(document, level2Elements, 'level2');


              

               const level3Elements = document.querySelectorAll('p');
               for (const level3Element of level3Elements) {
                   if (level3Element.textContent.match(/^\d+\.\d.\s/)) {
                       const level3text = /^\d+\.\d.\s/.exec(level3Element.textContent);
                       level3Element.outerHTML = level3Element.outerHTML.replace(level3text, "<div title=\"level3\" class=\"level3\">" + level3text + "</div>");
                   }
               }

    

               const level5Elements = document.querySelectorAll('p');
               for (const level5Element of level5Elements) {
                   if (level5Element.textContent.match(/^\d+\.\d\.\d\s/)) {
                       const level5text = /^\d+\.\d\.\d\s/.exec(level5Element.textContent);
                       level5Element.outerHTML = level5Element.outerHTML.replace(level5text, "<div title=\"level5\" class=\"level5\">" + level5text + "</div>");
                   }
               }

            //    const level3Elements = document.querySelectorAll('h3');
            //    wrapElements(document, level3Elements, 'level3');

   
            //    const level4Elements = document.querySelectorAll('p>span>span');
            //    wrapElements(document, level4Elements, 'level4');
          
  

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