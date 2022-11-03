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
            await page.waitForSelector(".col-md-9");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############

                   // TODO:
                   const level1Element = document.querySelectorAll(".Title-of-Act")[0];
                   wrapElement(document, level1Element, "level1");
                   wrapElementDate(document, "issue-date", "2022-09-28" + "T00:00:00");
                   // wrapElementDate(document, "effective-date", "2022-02-08" + "T00:00:00");
                   // ################
                   // # content:info #
                   // ################
   
                   // TODO:
                   const content = document.querySelectorAll(".col-md-9")[0];
                   wrapElement(document, content, "ease-content");
                   Array.prototype.forEach.call(document.querySelectorAll(".wb-invisible"), function (node) { node.remove(); });
                   Array.prototype.forEach.call(document.querySelectorAll(".mfp-hide.modal-dialog.modal-content.overlay-def"),function (node){node.remove();});
                   Array.prototype.forEach.call(document.querySelectorAll(".legisHeader"), function (node) { node.remove(); });
                   Array.prototype.forEach.call(document.querySelectorAll(".FCSelector"), function (node) { node.remove(); });
                   Array.prototype.forEach.call(document.querySelectorAll(".col-md-9 > div > div > section > div > ul > li > section "), function (node) { node.remove(); });
                   Array.prototype.forEach.call(document.querySelectorAll(".col-md-9 > div > div > section > dl > dt"), function (node) { node.remove(); });
                   Array.prototype.forEach.call(document.querySelectorAll(".col-md-9 > div > div > section > .MarginalNote > span"), function (node) { node.remove(); });
                   Array.prototype.forEach.call(document.querySelectorAll(".col-md-9 > div > div > section > ul > li > .MarginalNote > span "), function (node) { node.remove(); });
                   Array.prototype.forEach.call(document.querySelectorAll(".col-md-9 > div > div > section > div > a"), function (node) { node.remove(); });
   
                    const level2Elements1 = document.querySelectorAll(".col-md-9 > div > div > section > .Part");
                    for(var i of level2Elements1){
                       
                        i.children[0].textContent=i.children[0].textContent+ " ";
                   }
                   wrapElements(document, level2Elements1, "level2");
   
                   const level2Elements2 = document.querySelectorAll(".col-md-9 > section > div > h2");
                   
                   
                   wrapElements(document, level2Elements2, "level2");
                   
                   const level2Elements2sch = document.querySelectorAll(".scheduleLabel>span:nth-of-type(1)");
                wrapElements(document, level2Elements2sch, "level2");
                   const level2Elements3 = document.querySelectorAll(".col-md-9 > div > div > section > h3");

                   for(var i of level2Elements3){
                  
                    i.children[0].textContent=i.children[0].textContent+ " ";
               }
                //    level2Elements3.forEach(element => {
                   
                //     if(element.textContent.match(/^[\r\n\s]*DIVISION\s+\d+\w+.*/)){
                //         console.log(element.textContent);
                //       wrapElement(document,element,"level3");
                //     }
                // });
                  wrapElements(document, level2Elements3, "level3");
   
                   const level2Elements4 = document.querySelectorAll(".col-md-9 > div > div > section > .MarginalNote");
                   wrapElements(document, level2Elements4, "level4");
   
                   const level2Elements5 = document.querySelectorAll(".col-md-9 > div > div > section > ul > li > .MarginalNote");
                   wrapElements(document, level2Elements5, "level5");
   
                // // TODO:
                // const level1Element = document.querySelectorAll(".Title-of-Act")[0];
                // wrapElement(document, level1Element, "level1");
                // wrapElementDate(document, "issue-date", "2022-09-28" + "T00:00:00");
                // // wrapElementDate(document, "effective-date", "2022-02-08" + "T00:00:00");
                // // ################
                // // # content:info #
                // // ################

                // // TODO:
                // const content = document.querySelectorAll(".col-md-9")[0];
                // wrapElement(document, content, "ease-content");
                // Array.prototype.forEach.call(document.querySelectorAll(".legisHeader"), function (node) { node.remove(); });
                // Array.prototype.forEach.call(document.querySelectorAll(".FCSelector"), function (node) { node.remove(); });
                // Array.prototype.forEach.call(document.querySelectorAll("#wb-auto-1>  section > div > ul > li > section "), function (node) { node.remove(); });
                // Array.prototype.forEach.call(document.querySelectorAll("#wb-auto-1 > section > dl > dt"), function (node) { node.remove(); });
                // Array.prototype.forEach.call(document.querySelectorAll("#wb-auto-1> section > .MarginalNote > span"), function (node) { node.remove(); });
                // Array.prototype.forEach.call(document.querySelectorAll("#wb-auto-1 > section > ul > li > .MarginalNote > span "), function (node) { node.remove(); });
                // Array.prototype.forEach.call(document.querySelectorAll("#wb-auto-1 > section > div > a"), function (node) { node.remove(); });

                //  const level2Elements1 = document.querySelectorAll("#wb-auto-1> section > .Part");
                // wrapElements(document, level2Elements1, "level2");

                // const level2Elements2 = document.querySelectorAll(".scheduleLabel>span:nth-of-type(1)");
                // wrapElements(document, level2Elements2, "level2");

                // const level2elements3=document.querySelectorAll(".ScheduleRP >.scheduleTitleText,section >.ScheduleNIF>.scheduleTitleText");
                // wrapElements(document,level2elements3,"level2");
                
                // const level2Elements4 = document.querySelectorAll("#wb-auto-1 .Subheading");
                //    level2Elements4.forEach(element => {
                //     if(element?.textContent?.match(/^[\r\n\s]*DIVISION\s+\d\w+.*/)){
                //       wrapElement(document,element,"level3");
                //     }
                // });
                // //wrapElements(document, level2Elements3, "level3");

                // const level2Elements5 = document.querySelectorAll("#wb-auto-1>section > .MarginalNote");
                // wrapElements(document, level2Elements5, "level4");

                // // const level2Elements6 = document.querySelectorAll("#wb-auto-1>section > ul > li > .MarginalNote");
                // // wrapElements(document, level2Elements6, "level5");



                // // const level2Elements1 = document.querySelectorAll("h1");
                // // wrapElements(document, level2Elements1, "level2");

          
                // // removing unwanted content from ease-content
                

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