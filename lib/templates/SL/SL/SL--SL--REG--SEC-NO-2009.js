const base = require("./common/base");
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
            await page.waitForSelector(".doc-content");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                // TODO:
                const level1Element = document.querySelector(".c25");
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2009-09-25" + "T00:00:00");
                wrapElementDate(document, "effective-date", "2011-08-01" + "T00:00:00");
                // ################
                // # content:info #
                // ################
                // TODO
                const content = document.querySelectorAll(".doc-content")[0];
                wrapElement(document, content, "ease-content");

                 const level2Element = document.querySelectorAll(".c10");
                 for(const contentChild of level2Element){
                     if(contentChild.localName == "span"){
                         wrapElement(document, contentChild, "level2");
                     }
                 }

                 const level3Element = document.querySelectorAll(".c6");
                 for(const contentChild of level3Element){
                     if(contentChild.localName == "span"){
                         wrapElement(document, contentChild, "level3");
                     }
                 }

                 const level4Element = document.querySelectorAll(".c7,.c20");
                 for(const contentChild of level4Element){
                     if(contentChild.localName == "span"){
                         wrapElement(document, contentChild, "level4");
                     }
                 }

                 
                 const level5Element = document.querySelectorAll(".c2,.c5");
                 for(const contentChild of level5Element){
                     if(contentChild.localName == "span"){
                         wrapElement(document, contentChild, "level5");
                     }
                 }

                 const level6Element = document.querySelectorAll(".c3,.c8");
                 for(const contentChild of level6Element){
                     if(contentChild.localName == "span"){
                         wrapElement(document, contentChild, "level6");
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