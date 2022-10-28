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
            await page.waitForSelector(".act-content");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############

                // TODO:
                var images = document.querySelectorAll("img");
                images.forEach(e => {
                    var contentType = e.src.replace(/(.*\.)((png|jpg|jpeg|gif|ls))$/, "$2");
                    var canvas = document.createElement("canvas");
                    canvas.width = e.width;
                    canvas.height = e.height;
                    var ctx = canvas.getContext("2d");
                    ctx.drawImage(e, 0, 0);
                    var dataURL = canvas.toDataURL("image/" + contentType);
                    e.src = dataURL.replace("image/png", "image/" + contentType);
                })
                const level1Element = document.querySelector(".content-title");
                wrapElement(document, level1Element, "level1");
        
               
               wrapElementDate(document, "issue-date", "2022-09-09" + "T00:00:00");
               wrapElementDate(document, "effective-date", "2022-09-12" + "T00:00:00");
                // ################
                // # content:info #
                // ################

                // TODO:
                const content = document.querySelectorAll(".act-content")[0];
                wrapElement(document, content, "ease-content");
               // Array.prototype.forEach.call(document.querySelectorAll("#MainContent_pnlHtmlControls > div > .WordSection2"), function (node) { node.remove(); });

             

                let i=0;
                const contents = document.querySelectorAll(".act-content > table > tbody > tr > td > p > i");
                for(const contentChild of contents){
                 if(i<2){
                    console.log("getting url:");
                             }
                    else if(i>2){
                           wrapElement(document, contentChild, "level2");
                    } 
                    i++;
                }
               
               
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