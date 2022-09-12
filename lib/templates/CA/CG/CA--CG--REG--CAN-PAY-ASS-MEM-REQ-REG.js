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
          

            await page.waitForSelector("main");
            
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
             
                const rootTitle = document.querySelector("main .intro header");
                wrapElement(document, rootTitle, "level1");              
                wrapElementDate(document, "issue-date", "2001-11-01" + "T00:00:00");
                wrapElementDate(document, "effective-date", "2001-11-07" + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('main');
                wrapElement(document, contentElement, "ease-content"); 

                const level2Elements = document.querySelectorAll("main section ~ section h2");
                wrapElements(document, level2Elements, "level2");
        
                const level3Elements = document.querySelectorAll("main section ~ section .MarginalNote");
                wrapElements(document, level3Elements, "level3");
 
        
                const forFootnoteElements = document.querySelectorAll("main p.Footnote");
                for(const footNote of forFootnoteElements){
                    wrapElement(document, footNote, "footnote"); 
                }

                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll(".legisHeader , .FCSelector, .wb-invisible"), function (node) { node.remove(); });
              
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