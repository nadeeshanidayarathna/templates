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
            await page.waitForSelector(".law");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelector(".iLAWS104CoverShortTitle");
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2022-05-03" + "T00:00:00");
                // ################
                // # content:info #
                // ################
                const content = document.querySelectorAll(".law")[0];
                wrapElement(document, content, "ease-content");


               const level2Element = document.querySelectorAll(".iLAWS300Article,.iLAWS600EndnotesTitle");
               for(const contentChild of level2Element){
                   if(contentChild.localName == "p"){
                       wrapElement(document, contentChild, "level2");
                   }
               }


               const forFootnoteElement = document.querySelector("#edn1");
               wrapElement(document, forFootnoteElement, "footnote");

               const forFootnoteElement2 = document.querySelector("#edn2");
               wrapElement(document, forFootnoteElement2, "footnote");

               const forFootnoteElement3 = document.querySelector("#edn3");
               wrapElement(document, forFootnoteElement3, "footnote");


                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll(".iLAWS101CrestLarge,.iLAWS120ShortTitleContents,.iLAWS115CrestSmall,.WordSection2"),
                function (node) {node.remove();});
      

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