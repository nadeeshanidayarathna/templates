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
                const level1Element = document.querySelectorAll(".tbltore>tbody>tr>td")[5];
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2007-04-16" + "T00:00:00");
                // ################
                // # content:info #
                // ################
                const content = document.querySelectorAll(".page-body")[0];
                wrapElement(document, content, "ease-content");


                const levels = document.querySelectorAll(".tbold");
                const regexL2 = /^([A-Z]\.\s)/i;
                const regexL3 = /^\d\)\s/i;
                const regexL4 = /^([a-z]\)\s)/i;
                for(const contentChild of levels){
                    if(contentChild.textContent.match(regexL2)){
                        wrapElement(document, contentChild, "level2");
                     } else if(contentChild.textContent.match(regexL3)){
                        wrapElement(document, contentChild, "level3");
                     } else if(contentChild.textContent.match(regexL4)){
                        wrapElement(document, contentChild, "level4");
                     }
                 }
                 const level2Element2 = document.querySelectorAll(".tboldred")[0];
                 wrapElement(document, level2Element2, "level2");



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