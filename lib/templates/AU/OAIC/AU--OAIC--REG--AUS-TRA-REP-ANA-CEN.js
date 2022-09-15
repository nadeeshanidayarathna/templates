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
            await page.waitForSelector("#MainContent_RadPageHTML");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelectorAll("p.MsoNormal")[3];
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2019-10-04" + "T00:00:00");
                wrapElementDate(document, "effective-date", "2019-10-05" + "T00:00:00");
                // ################ 
                // # content:info #
                // ################
                const content = document.querySelector("#MainContent_RadPageHTML");
                wrapElement(document, content, "ease-content");


                const allPTags = document.querySelectorAll("p");
                const regex1 = /^\d\.\s/i;
                const regex2 = /^\d\s/i;
                for (const contentChild of allPTags) {
                    if (contentChild.textContent.match(regex1)||contentChild.textContent.match(regex2)) {             
                        wrapElement(document, contentChild, "level2");   
                    }
                }

                const forFootnoteElements = document.querySelectorAll(".MsoFootnoteText");
                wrapElements(document, forFootnoteElements, "footnote");
               

                // removing unwanted content from ease-content    
                Array.prototype.forEach.call(document.querySelectorAll(".MsoNormal>a>img"), function (node) { node.remove(); });
                
                
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