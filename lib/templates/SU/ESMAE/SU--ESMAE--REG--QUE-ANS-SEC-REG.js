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
            await base.downloadPage(page, url, sp, path, null, 'utf16le');

            // 2.Identify
            // 3.Wrap
            await page.waitForSelector(".WordSection1");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############

                const rootTitle = document.querySelector("h6");
                wrapElement(document, rootTitle, "level1");

                wrapElementDate(document, "issue-date", "2021-11-19" + "T00:00:00");

                // ################
                // # content:info #
                // ################

                const content = document.querySelector("body");
                wrapElement(document, content, "ease-content");

                const level2Element = document.querySelectorAll("h1");
                wrapElements(document, level2Element, "level2");
                
                const level3Element = document.querySelectorAll("h2");
                wrapElements(document, level3Element, "level3");

                const footNoteElement = document.querySelectorAll("div[id^='ftn']");
                wrapElements(document, footNoteElement, "footnote");

                Array.prototype.forEach.call(document.querySelectorAll("img"), function (node) { 
                    if(node.src.match(/^data/)){

                    } else {
                        node.remove(); 
                    }
                    
                }
                );

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