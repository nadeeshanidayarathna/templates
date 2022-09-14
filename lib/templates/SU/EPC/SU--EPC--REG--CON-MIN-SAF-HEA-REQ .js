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
            await page.waitForSelector(".tabContent");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############

                // TODO:
                const level1Element = document.querySelector(".tabContent > div > table > tbody > tr > td > p:nth-child(3)");
                wrapElement(document, level1Element, "level1");
        
                wrapElementDate(document, "issue-date", "1989-11-30" + "T00:00:00");
                // wrapElementDate(document, "effective-date", "2022-02-08" + "T00:00:00");
                // ################
                // # content:info #
                // ################

                // TODO:
                const content = document.querySelectorAll(".tabContent")[0];
                wrapElement(document, content, "ease-content");
                Array.prototype.forEach.call(document.querySelectorAll(".tabContent > div > p:nth-child(14)"), function (node) { node.remove(); });
                Array.prototype.forEach.call(document.querySelectorAll(".tabContent > div > p:nth-child(15)"), function (node) { node.remove(); });
                Array.prototype.forEach.call(document.querySelectorAll(".tabContent > div > p:nth-child(16)"), function (node) { node.remove(); });
                Array.prototype.forEach.call(document.querySelectorAll(".tabContent > div > p:nth-child(17)"), function (node) { node.remove(); });

            const level2Elements = document.querySelectorAll('.tabContent > div > .title-division-1');
               wrapElements(document, level2Elements, 'level2');

               const level22Elements = document.querySelectorAll('.tabContent > div > .title-annex-1');
               wrapElements(document, level22Elements, 'level2');

               const level3Elements = document.querySelectorAll('.tabContent > div > .title-article-norm');
               wrapElements(document, level3Elements, 'level3');

            //    const footnoteElement = document.querySelectorAll(".tabContent > div > .footnote");
            //    wrapElements(document, footnoteElement, "footnote");

               const level4Elements = document.querySelectorAll(".tabContent > div > p");
               for (const level4Element of level4Elements) {
                   if (level4Element.textContent.match(/^\(\s\d\s\).*/))
                    {
                       wrapElement(document, level4Element, "footnote");
                   }  
               }
  

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