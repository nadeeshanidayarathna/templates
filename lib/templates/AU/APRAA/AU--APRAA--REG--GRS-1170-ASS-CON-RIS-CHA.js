const { group } = require("yargs");
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
            await base.downloadPage(page, url, sp, path, null, encoding = 'utf16le');

            // 2.Identify
            // 3.Wrap
            await page.waitForSelector("body");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelectorAll('h1')[0];
                wrapElement(document, level1Element, "level1", group=true);
                wrapElementDate(document, "issue-date", "2012-12-20" + "T00:00:00");
                
                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('.WordSection1');
                wrapElement(document, contentElement, "ease-content");

                const level2Element = document.querySelectorAll("h1")[1];  
                wrapElement(document, level2Element, "level2");

                const level3Elements = document.querySelectorAll("h2");
                wrapElements(document, level3Elements, "level3");

                const level4Elements = document.querySelectorAll("h3");
                wrapElements(document, level4Elements, "level4");
                
                const level5Elements = document.querySelectorAll("h4");
                wrapElements(document, level5Elements, "level5");

                const level6Elements = document.querySelectorAll("h5");
                wrapElements(document, level6Elements, "level6");

                const regex1 = /(^[\r\n\s]*(\(\d+\)))/; 
                const elements = document.querySelectorAll(".WordSection1 > p");
                for (const contentChild of elements) {
                    if (contentChild.textContent.match(regex1)) {
                        wrapElement(document, contentChild, "level7");
                    } 
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