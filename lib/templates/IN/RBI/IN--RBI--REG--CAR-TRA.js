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
            await page.waitForSelector("#annual");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelector("H2");
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2022-09-26" + "T00:00:00");
                // ################
                // # content:info #
                // ################
                const content = document.querySelector("#annual");
                wrapElement(document, content, "ease-content");

                const level2Element = document.querySelectorAll(".head");
                for(const child of level2Element){
                    if(child.textContent.match(/^\d./)){
                        wrapElement(document, child, "level2");
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