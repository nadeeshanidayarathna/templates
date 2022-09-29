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
            await page.waitForSelector(".app_inner_pages_container");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                
                Array.prototype.forEach.call(document.querySelectorAll(".app_inner_pages_container>div>div >h3:first-of-type"), function (node) { node.remove(); });
                 Array.prototype.forEach.call(document.querySelectorAll(".app_inner_pages_container>div>div >div>h1"), function (node) { node.remove(); });
                 Array.prototype.forEach.call(document.querySelectorAll(".app_inner_pages_container>.system_terms_tools"), function (node) { node.remove(); });
                 Array.prototype.forEach.call(document.querySelectorAll(".app_inner_pages_container .article_btns"), function (node) { node.remove(); });
               
                // TODO:
                const elementContent = document.querySelectorAll("h1")[0];
                wrapElement(document, elementContent, "level1");
                wrapElementDate(document, "issue-date", "2017-10-25" + "T00:00:00");
                // wrapElementDate(document, "effective-date", "2012-05-30" + "T00:00:00");
                // ################
                // # content:info #
                // ################

                // TODO
                const content = document.querySelectorAll(".app_inner_pages_container")[0];
                wrapElement(document, content, "ease-content");
             
        
            let j=0;
            const contents2 = document.querySelectorAll(".app_inner_pages_container>div>div>h4");
            for(const contentChild of contents2){
                if(contentChild.localName == "h4:first-of-type"){
                    continue;
                }
                else if(contentChild.localName == "h4" && j>0){
                    wrapElement(document, contentChild, "level2");
             } 
             j++;
            }

            let i=0;
               const contents = document.querySelectorAll(".app_inner_pages_container>div>div>h3");
               for(const contentChild of contents){
                if(contentChild.localName == "h3:first-of-type"){
                               continue;
                            }
                   else if(contentChild.localName == "h3"&& i>0){
                          wrapElement(document, contentChild, "level2");
                   } 
                   i++;
               }
              
           
                const contents1 = document.querySelectorAll(".app_inner_pages_container>div>div>.article_item >h3");
                for(const contentChild of contents1){
                    if(contentChild.localName == "h3"){
                           wrapElement(document, contentChild, "level3");
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