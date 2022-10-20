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
            await page.waitForSelector('.pre div[role="region"]');
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelector('.pre div[role="region"] h2');
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2022-05-26" + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('.pre div[role="region"]');
                wrapElement(document, contentElement, "ease-content");

                const titleElements = document.querySelectorAll('.pre div[role="region"] p > strong');
                for(const element of titleElements){
                    if(element.textContent.startsWith("附件")){
                        wrapElement(document, element, "level2");
                    }
                    else if(element.textContent.match(/^[一|二|三|四|五|六]/)){
                        wrapElement(document, element, "level3");
                    }
                }

                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll(".huiUnderline"), function (node) { node.remove(); });
       
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