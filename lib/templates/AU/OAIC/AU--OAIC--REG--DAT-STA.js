const { group } = require("yargs");
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
          

            await page.waitForSelector(".content");
            
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
             
                const rootTitle = "Data standards";
                wrapElementLevel1(document, rootTitle);             
                // wrapElementDate(document, "issue-date", "2015-08-01" + "T00:00:00"); 

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('.content');
                wrapElement(document, contentElement, "ease-content"); 
 

                const level2Elements = document.querySelectorAll(".content h1");
                for (const level2Element of level2Elements) {
                    if (level2Element.textContent.match(/^[\r\n\s]*\S/)) {
                        wrapElement(document, level2Element, "level2");
                    }  
                } 
        
                const level3Elements = document.querySelectorAll(".content h2");
                for (const level3Element of level3Elements) {
                    if (level3Element.textContent.match(/^[\r\n\s]*\S/)) {
                        wrapElement(document, level3Element, "level3");
                    }  
                } 

                const level4Elements = document.querySelectorAll(".content h3");
                for (const level4Element of level4Elements) {
                    if (level4Element.textContent.match(/^[\r\n\s]*\S/)) {
                        wrapElement(document, level4Element, "level4");
                    }  
                } 

                const level5Elements = document.querySelectorAll(".content h4");
                for (const level5Element of level5Elements) {
                    if (level5Element.textContent.match(/^[\r\n\s]*\S/)) {
                        wrapElement(document, level5Element, "level5");
                    }  
                }
        
                 

                // removing unwanted content from ease-content
                // Array.prototype.forEach.call(document.querySelectorAll(".legisHeader , .FCSelector, .wb-invisible"), function (node) { node.remove(); });
              
                return Promise.resolve();
            });
            // 4.Write
            await base.writePage(page, url, sp, path, true, true, false);
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