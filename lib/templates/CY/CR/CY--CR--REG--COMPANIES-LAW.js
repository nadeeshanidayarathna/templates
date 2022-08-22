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
            await base.downloadPage(page, url, sp, path, null, 'utf16le');
            // 2.Identify
            // 3.Wrap
            await page.waitForSelector(".appendix-text");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                // TODO:
                const level1Element = document.querySelectorAll("h1")[0];
                wrapElement(document, level1Element, "level1");
              
                // ################
                // # content:info #
                // ################
                // TODO
                const content = document.querySelectorAll(".main-content")[0];
                wrapElement(document, content, "ease-content");
              

                 const level2Element = document.querySelectorAll(".preamble-header,.full-division-header,.full-appendices-title");
                 for(const contentChild of level2Element){
                     if(contentChild.localName == "div"){
                         wrapElement(document, contentChild, "level2");
                     }
                 }

                 const level3Element = document.querySelectorAll(".division");
                 for(const contentChild of level3Element){
                     if(contentChild.localName == "div"){
                         wrapElement(document, contentChild, "level3");
                     }
                 }

                 const level4Element = document.querySelectorAll(".full-sub-division,.appendix-enum,.footnote-title1");
                 for(const contentChild of level4Element){
                     if(contentChild.localName == "div"){
                         wrapElement(document, contentChild, "level4");
                     }
                 }

                 const level5Element = document.querySelectorAll(".full-section-header");
                 for(const contentChild of level5Element){
                     if(contentChild.localName == "div"){
                         wrapElement(document, contentChild, "level5");
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