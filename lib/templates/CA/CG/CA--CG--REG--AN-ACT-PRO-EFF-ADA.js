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
            await page.waitForSelector(".wb-txthl");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############

                // TODO:
             const level1Element = document.querySelector(".Title-of-Act");
                wrapElement(document , level1Element , "level1");
        
                wrapElementDate(document, "issue-date", "2022-09-15" + "T00:00:00");
              //  wrapElementDate(document, "effective-date", "2015-04-29" + "T00:00:00");
                // ################
                // # content:info #
                // ################

                // TODO:
                const content = document.querySelectorAll(".wb-txthl")[0];
                wrapElement(document, content, "ease-content");

        

                 const level2Elements = document.querySelectorAll('h1:not(.Title-of-Act)');
                wrapElements(document, level2Elements, 'level2');
  
               
                const level23Elements = document.querySelectorAll('.WordSection4 > h1:last-of-type');
                wrapElements(document, level23Elements, 'level2');

                
               

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