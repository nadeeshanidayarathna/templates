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
            await page.waitForSelector(".field--name-body");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelector('h1 > span');
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2003-04-16" + "T00:00:00");
                
                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector(".field--name-body");
                wrapElement(document, contentElement, "ease-content");

                const level2Elements = document.querySelectorAll("h2");  
                wrapElements(document, level2Elements, "level2");
                    
                const level3Elements = document.querySelectorAll("h3");
                wrapElements(document, level3Elements, "level3");
                
                const footnoteElements = document.querySelectorAll("p");
                const regex2 = /(^\d\.)/;
                for(const contentChild of footnoteElements){
                    if(contentChild.textContent.match(regex2)){
                        wrapElement(document, contentChild, "footnote");
                    }
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