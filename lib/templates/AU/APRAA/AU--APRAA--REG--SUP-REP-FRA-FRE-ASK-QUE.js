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
            await page.waitForSelector("#block-content");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelector("h1");
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2017-09-20" + "T00:00:00");
                // ################
                // # content:info #
                // ################
                const content = document.querySelectorAll(".block-layout-builder")[0];
                wrapElement(document, content, "ease-content");
              
            
                const level2Element = document.querySelectorAll("h2");
                for(const contentChild of level2Element){
                   if(contentChild.localName == "h2"){
                       wrapElement(document, contentChild, "level2");
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