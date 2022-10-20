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
            await base.downloadPage(page, url, sp, path);

            // 2.Identify
            // 3.Wrap
            await page.waitForSelector(".doc-content");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const rootTitle = "NOTICE ON REPORTING OF SUSPICIOUS ACTIVITIES & INCIDENTS OF FRAUD";
                wrapElementLevel1(document, rootTitle);

                wrapElementDate(document, "issue-date", "2013-05-28" + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('.doc-content');
                wrapElement(document, contentElement, "ease-content");

                const level2Element = document.querySelector(".c11");
                wrapElement(document, level2Element, "level2");

                const level3Elements = document.querySelectorAll(".c14");
                for(const level3Element of level3Elements){
                    if(level3Element.textContent.match(/Introduction/) || level3Element.textContent.match(/^Report\son\sSuspicious\sActivities/)){
                        wrapElement(document, level3Element, "level3");
                    }
                }

                const level3ElementType2 = document.querySelector(".c39");
                wrapElement(document, level3ElementType2, "level3");
        
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