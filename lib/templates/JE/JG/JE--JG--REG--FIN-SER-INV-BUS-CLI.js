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
            await page.waitForSelector("#content");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelector(".iLAWS104CoverShortTitle");
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2022-05-17" + "T00:00:00");
                // ################
                // # content:info #
                // ################
                const content = document.querySelectorAll("#content")[0];
                wrapElement(document, content, "ease-content");


                const level2ElementHeading = document.querySelectorAll(".iLAWS200PartHeading");
                for(var i=0;i< level2ElementHeading.length;i++){
                    const level2ElementSubHeading = level2ElementHeading[i].nextElementSibling.innerHTML
                    level2ElementHeading[i].innerHTML = level2ElementHeading[i].innerHTML+'<p> </p>'+ level2ElementSubHeading
                    wrapElement(document, level2ElementHeading[i],"level2");
                }

                const level2Element2 = document.querySelector(".iLAWS600EndnotesTitle");
                wrapElement(document, level2Element2, "level2");
                

               var level3Elements = Array.from(document.querySelectorAll(".iLAWS300Article"));
               level3Elements =level3Elements.slice(0,level3Elements.length-1);
               for(const contentChild of level3Elements){
                   if(contentChild.localName == "p"){
                       wrapElement(document, contentChild, "level3");
                   }
               }


               const forFootnoteElements = document.querySelectorAll(".MsoEndnoteText");
               for(const footNote of forFootnoteElements){
                wrapElement(document, footNote, "footnote"); 
                }


               // removing unwanted content from ease-content
               Array.prototype.forEach.call(document.querySelectorAll(".iLAWS101CrestLarge,.iLAWS120ShortTitleContents,.iLAWS115CrestSmall,.WordSection2,.iLAWS210PartSubHeading,#ctl00_PlaceHolderMain_DisplayModePanel"),
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