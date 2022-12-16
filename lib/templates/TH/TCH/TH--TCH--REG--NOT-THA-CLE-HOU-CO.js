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
            const delayDownload = {
                waitUntil: "networkidle0",
                timeout: 0
            }
            await base.downloadPage(page, url, sp, path, delayDownload);

            // 2.Identify
            // 3.Wrap
            await page.waitForSelector("body");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############

                // TODO:
                const level1Element = document.querySelectorAll(".card-header.border-content")[0];
                wrapElement(document, level1Element, "level1");
        
               
                 wrapElementDate(document, "issue-date", "2022-07-15" + "T00:00:00");
                 wrapElementDate(document, "effective-date", "2022-08-01" + "T00:00:00");
                // ################
                // # content:info #
                // ################

                // TODO:
                const content = document.querySelector(".card");
                wrapElement(document, content, "ease-content");

                const level2Element = document.querySelector(".text-yellow");
                wrapElement(document, level2Element, "level2");

               const level3Elements = document.querySelectorAll('p');
               for(const element of level3Elements){
                if(element.innerText.match(/^\d./) && element.innerHTML.includes("strong")){
                    wrapElement(document, element, "level3");
                }
               }
            
                // removing unwanted content from ease-content             
               Array.prototype.forEach.call(document.querySelectorAll(".btn-group"), function (node) { node.remove(); });
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