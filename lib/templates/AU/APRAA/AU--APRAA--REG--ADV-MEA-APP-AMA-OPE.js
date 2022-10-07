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
            await page.waitForSelector("#MainContent_pnlHtmlControls");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############

                // TODO:
                const level1Element = document.querySelector(".WordSection1>p:nth-child(2)");
                wrapElement(document, level1Element, "level1");

                wrapElementDate(document, "issue-date", "2018-03-21" + "T00:00:00");
                wrapElementDate(document, "effective-date", "2018-04-01" + "T00:00:00");
                // ################
                // # content:info #
                // ################


                // TODO:
                const content = document.querySelectorAll("#MainContent_pnlHtmlControls")[0];
                wrapElement(document, content, "ease-content");
                Array.prototype.forEach.call(document.querySelectorAll("#MainContent_pnlHtmlControls > div > .WordSection1 > p img"), function (node) { node.remove(); });
                Array.prototype.forEach.call(document.querySelectorAll("#MainContent_pnlHtmlControls > div > .WordSection2 > h2 img"), function (node) { node.remove(); });
               // Array.prototype.forEach.call(document.querySelectorAll("#MainContent_pnlHtmlControls > div > .WordSection2 > h2 img"), function (node) { node.remove(); });

               const level21Elements = document.querySelectorAll(".AS");
               for (const level21Element of level21Elements) {
                   if (level21Element.textContent.match(/^Schedule/)) {
                       wrapElement(document, level21Element, "level2");
                   }  
               } 
               
               const level2Elements = document.querySelectorAll('.WordSection2 > p  b>span');
                wrapElements(document, level2Elements, 'level3');

                const level3Elements = document.querySelectorAll('.HeadingLvl1:nth-child(3)');
                wrapElements(document, level3Elements, 'level3');

                const level4Elements = document.querySelectorAll(".HeadingLvl2");
               for (const level4Element of level4Elements) {
                   if (level4Element.textContent.match(/^ARF.*/)) {
                       wrapElement(document, level4Element, "level6");
                   }  
                   else  {
                    wrapElement(document, level4Element, "level3");
                    } 
               } ;

                const level5Elements = document.querySelectorAll('.HeadingLvl3');
                wrapElements(document, level5Elements, 'level4');

                const level6Elements = document.querySelectorAll('.HeadingLvl4 b');
                wrapElements(document, level6Elements, 'level4');

               
                

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