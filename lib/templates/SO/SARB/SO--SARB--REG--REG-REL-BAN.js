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
            await page.waitForSelector(".doc-content");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############

                // TODO:
                const level1Element = document.querySelectorAll(".title")[0];
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2006-03-17" + "T00:00:00");
                // ################
                // # content:info #
                // ################

                // TODO
                const content = document.querySelectorAll(".doc-content")[0];
                wrapElement(document, content, "ease-content");
                const level12Element = document.querySelectorAll(".sub")[0];
                 wrapElement(document, level12Element, "level2");

                 const level2Element = document.querySelectorAll("h1");
                 for(const contentChild of level2Element){
                     if(contentChild.localName == "h1"){
                         wrapElement(document, contentChild, "level3");
                     } 
                 }
                 const contents = document.querySelectorAll("h2");
                 for(const contentChild of contents){
                     if(contentChild.localName == "h2"){
                         wrapElement(document, contentChild, "level4");
                     } 
                 }
                 
                 const contents1 = document.querySelectorAll("h3");
                 for(const contentChild of contents1){
                     if(contentChild.localName == "h3"){
                         wrapElement(document, contentChild, "level5");
                     } 
                 }


                // removing unwanted content from ease-content
                // TODO:

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