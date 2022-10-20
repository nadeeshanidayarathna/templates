const { group, wrap } = require("yargs");
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
                const rootTitle = "MAS NOTICE 825A";
                wrapElementLevel1(document, rootTitle);

                wrapElementDate(document, "issue-date", "2017-12-12" + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('body');
                wrapElement(document, contentElement, "ease-content");

                const level2Elements = document.querySelectorAll("h1");
                for(const level2Element of level2Elements){
                    if(level2Element.textContent.startsWith("RESIDENTIAL PROPERTY") || level2Element.textContent.startsWith("Form")){
                        wrapElement(document, level2Element, "level2");
                    }
                }
                
                const level3Elements = document.querySelectorAll("h2");
                for(const level3Element of level3Elements){
                    wrapElement(document, level3Element, "level3");
                }

                const footnoteElements = document.querySelectorAll(".MsoEndnoteText");
                for(const footnoteElement of footnoteElements){
                    wrapElement(document, footnoteElement, "footnote");
                }
        
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