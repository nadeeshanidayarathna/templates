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
                const level1Element = document.querySelectorAll("td>p")[1];
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2012-03-29" + "T00:00:00");
                // ################
                // # content:info #
                // ################

                
                const content = document.querySelectorAll(".pub")[0];
                wrapElement(document, content, "ease-content");
              
                 const level2Element = document.querySelectorAll("h4");
                 for(const contentChild of level2Element){
                     if(contentChild.localName == "h4"){
                         wrapElement(document, contentChild, "level2");
                     }
                 }

                 const footnoteElement = document.querySelectorAll("p");
                 wrapElement(document, footnoteElement[21], "footnote");


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