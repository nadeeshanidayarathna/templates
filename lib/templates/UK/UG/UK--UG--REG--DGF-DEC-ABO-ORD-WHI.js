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
            await base.downloadPage(page, url, sp, path,delayDownload);

            // 2.Identify
            // 3.Wrap
            await page.waitForSelector(".rvts0");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelector('.rvts0>.rvps6>.rvts23');
                wrapElement(document, level1Element, "level1");
     
                const issueDateElement = document.querySelector(".rvps7>.rvts9");
                const issueDate =  issueDateElement.textContent.slice(0, 10);
                var newdate = issueDate.split(".").reverse().join(".");
                 wrapElementDate(document, "issue-date",newdate + "T00:00:00");
                
                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('.rvts0');
                wrapElement(document, contentElement, "ease-content");
                  
                const level2Element = document.querySelectorAll('.rvps6');
                  for (let i = 1; i < level2Element.length; i++) {
                    wrapElement(document, level2Element[i], "level2");
                  }

                const level3Elements = document.querySelectorAll(".rvts0 > .rvps7");
                wrapElements(document, level3Elements, "level3");
            
                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll("img"), function (node) { node.remove(); });
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