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
            await page.waitForSelector(".page-body");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelectorAll(".tbltore>tbody>tr>td>p")[1];
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2007-03-15" + "T00:00:00");
                // ################
                // # content:info #
                // ################
                const content = document.querySelectorAll(".page-body")[0];
                wrapElement(document, content, "ease-content");


                const level2Elements = document.querySelectorAll(".tbold");
                const regexL2 = /^([A-Z]\.\s)/i;
                for(const contentChild of level2Elements){
                    if(contentChild.textContent.match(regexL2)||contentChild.textContent.startsWith('Appendix')){
                          wrapElement(document, contentChild, "level2");
                     }
                 }
                 const level2Element2 = document.querySelectorAll("h3")[0];
                 wrapElement(document, level2Element2, "level2");
                          
                 
                const level3Elements = document.querySelectorAll(".tbold,strong");
                const regexL3 = /^\d\)\s/i;
                for(const contentChild of level3Elements){
                    if(contentChild.textContent.match(regexL3)){
                          wrapElement(document, contentChild, "level3");
                     }
                }


                const level4Elements = document.querySelectorAll(".tbold,strong");
                const regexL4 = /^([a-z]\)\s)/i;
                for(const contentChild of level4Elements){
                    if(contentChild.textContent.match(regexL4)){
                          wrapElement(document, contentChild, "level4");
                     }
                }



                return Promise.resolve();
            });
            // 4.Write
            await base.writePage(page, url, sp, path, true, true, true);
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