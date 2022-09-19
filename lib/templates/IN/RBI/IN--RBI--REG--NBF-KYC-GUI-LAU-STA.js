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
            await page.waitForSelector(".tablecontent2");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############

                // TODO:
                const level1Element = document.querySelector(".tablecontent2 > td > #divPadding > font:first-of-type > b:first-of-type");
                wrapElement(document, level1Element, "level1");
        
                wrapElementDate(document, "issue-date", "2005-02-21" + "T00:00:00");
                // wrapElementDate(document, "effective-date", "2022-02-08" + "T00:00:00");
                // ################
                // # content:info #
                // ################

                // TODO:
                const content = document.querySelectorAll(".tablecontent2")[0];
                wrapElement(document, content, "ease-content");
               // Array.prototype.forEach.call(document.querySelectorAll("#MainContent_pnlHtmlControls > div > .WordSection2"), function (node) { node.remove(); });

               const level2Elements = document.querySelectorAll('.tablecontent2 > td > #divPadding > b');
               for (const level2Element of level2Elements) {
                   if (level2Element.textContent.match(/Annex-II/)) {
                       const level2text = /Annex-II/.exec(level2Element.textContent);
                       level2Element.outerHTML = level2Element.outerHTML.replace(level2text, "<div title=\"level2\" class=\"level2\">" + level2text + "</div>");
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