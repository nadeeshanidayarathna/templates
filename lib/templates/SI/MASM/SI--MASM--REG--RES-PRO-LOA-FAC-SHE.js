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
            await base.downloadPage(page, url, sp, path, null, 'utf16le');

            // 2.Identify
            // 3.Wrap
            await page.waitForSelector("body");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############

                const level1Element = "RESIDENTIAL PROPERTY LOANS – FACT SHEET";
                wrapElementLevel1(document, level1Element);
                wrapElementDate(document, "issue-date", "2017-12-12" + "T00:00:00");
                
                // ################
                // # content:info #
                // ################

                const content = document.querySelector("body");
                wrapElement(document, content, "ease-content");
                
                // level2 auto-captured

                const level3ElementsType2 = document.querySelectorAll("h3");
                wrapElements(document, level3ElementsType2, "level3");

                const footnoteElements = document.querySelectorAll('a[id*="ftnt"]');
                for(const element of footnoteElements){
                    if(element.parentElement.parentElement.tagName == "DIV"){
                        const footnoteElement = element.parentElement.parentElement;
                        wrapElement(document, footnoteElement, "footnote");
                    }
                }

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