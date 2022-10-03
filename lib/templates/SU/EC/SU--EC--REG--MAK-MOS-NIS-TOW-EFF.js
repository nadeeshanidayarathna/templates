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
            await page.waitForSelector("#textTabContent");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############

                // TODO:
                const level1Element = document.querySelector("#textTabContent .Heading1:nth-child(3)");
                wrapElement(document, level1Element, "level1");
        
                wrapElementDate(document, "issue-date", "2017-10-04" + "T00:00:00");
              //  wrapElementDate(document, "effective-date", "2015-04-29" + "T00:00:00");
                // ################
                // # content:info #
                // ################

                // TODO:
                const content = document.querySelectorAll("#textTabContent")[0];
                wrapElement(document, content, "ease-content");
                Array.prototype.forEach.call(document.querySelectorAll("#textTabContent .content:nth-child(1)"), function (node) { node.remove(); });
                Array.prototype.forEach.call(document.querySelectorAll("#textTabContent .content:nth-child(2)"), function (node) { node.remove(); });
                Array.prototype.forEach.call(document.querySelectorAll("#textTabContent .content:nth-child(3)"), function (node) { node.remove(); });

 

                
                const level3Elements = document.querySelectorAll('div > div > div > div > div >  .Heading1:nth-child(3)');
               wrapElements(document, level3Elements, 'level2');
        
                const level2Elements = document.querySelectorAll("div >div>div>div >div >p>span");
                for (const level2Element of level2Elements) {
                    if (level2Element.textContent.match(/^\d+\..*/)) {
                        wrapElement(document, level2Element, "level3");
                    }  
                }


               const level5Elements = document.querySelectorAll('div>div >.MsoEndnoteText');
               wrapElements(document, level5Elements, 'footnote');
        


                // removing unwanted content from ease-content
             
               // Array.prototype.forEach.call(document.querySelectorAll(".detail_gn"), function (node) { node.remove(); });
                // TODO:

                return Promise.resolve();
            });
            // 4.Write
            await base.writePage(page, url, sp, path, true, true);
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