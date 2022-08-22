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
            await page.waitForSelector(".util-padding-top-40");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############

                // TODO:
                
                const elementContent = document.querySelectorAll(".util-padding-top-40 strong")[0];
                wrapElement(document, elementContent, "level1");
                wrapElementDate(document, "issue-date", "2001-01-20" + "T00:00:00");
                wrapElementDate(document, "effective-date", "2001-01-20" + "T00:00:00");
                // ################
                // # content:info #
                // ################

                // TODO
                const content = document.querySelectorAll(".util-padding-top-40")[0];
                wrapElement(document, content, "ease-content");
            
       

                const level2Element1 = document.querySelectorAll("h1")[0];
                 wrapElement(document, level2Element1, "level2");

                var i=0;
                 const level2Element = document.querySelectorAll(".util-padding-top-40>div>div>div>strong");
                 for(const contentChild of level2Element){
                     if(contentChild.localName == "strong" && i<=5){
                            wrapElement(document, contentChild, "level2");
                            i++
                     } 
                 }

                //  const contents = document.querySelectorAll("h2");
                //  for(const contentChild of contents){
                //      if(contentChild.localName == "h2"){
                //          wrapElement(document, contentChild, "level3");
                //      } 
                //  }
                 
                //  const contents1 = document.querySelectorAll("h3");
                //  for(const contentChild of contents1){
                //      if(contentChild.localName == "h3"){
                //          wrapElement(document, contentChild, "level3");
                //      } 
                //  }

            
                // wrapElement(document, level3Element, "level3");
                // wrapElement(document, level4Element, "level4");
                // wrapElement(document, level5Element, "level5");
                // wrapElement(document, level6Element, "level6");
                // wrapElement(document, level7Element, "level7");
                // wrapElement(document, level8Element, "level8");
                // wrapElement(document, level9Element, "level9");
                // wrapElement(document, footnoteElement, "footnote");

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