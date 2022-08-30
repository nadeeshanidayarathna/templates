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
            await page.waitForSelector(".pub");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const rootTitle = document.querySelector(".tbltore tr:nth-of-type(2) > td:nth-of-type(2)");
                wrapElement(document, rootTitle, "level1");
                wrapElementDate(document, "issue-date",  "2009-11-03"+ "T00:00:00");
                

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector(".pub");
                wrapElement(document, contentElement, "ease-content");

                const level2Element = document.querySelectorAll(".tcenter > .tbold")[0];
                wrapElement(document, level2Element, "level2");
                    
                const level4Elements = document.querySelectorAll("ol#balpha>li");
                 for(const contentChild of level4Elements){
                    wrapElement(document, contentChild, "level4"); 
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