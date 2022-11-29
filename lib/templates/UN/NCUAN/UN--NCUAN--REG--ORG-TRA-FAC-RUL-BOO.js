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
            await base.downloadPage(page, url, sp, path, null , encoding = 'utf16le');

            // 2.Identify
            // 3.Wrap
            await page.waitForSelector(".doc-content");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############


                const rootTitle = document.querySelector(".c291");
                wrapElement(document, rootTitle, "level1");

                // ################
                // # content:info #
                // ################

                const content = document.querySelector("body");
                wrapElement(document, content, "ease-content");

                const level3Element = document.querySelectorAll(".c10");
                for(const child of level3Element){
                    if(child.textContent.match(/^\d. /) || child.textContent.match(/^SCHEDULE /)){
                        wrapElement(document, child, "level2");
                    } else if(child.textContent.match(/^\d.\d /) || child.textContent.match(/^\d.\d\d/) ){
                        wrapElement(document, child, "level3");
                    }
                }

                const footnoteElement = document.querySelector(".ftnote");
                wrapElement(document, footnoteElement, "footnote");
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