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

                const rootTitle = document.querySelector(".WordSection1 > h1 > span");
                wrapElement(document, rootTitle, "level1");

                wrapElementDate(document, "issue-date", "2021-10-08" + "T00:00:00");
                wrapElementDate(document, "effective-date", "2021-10-08" + "T00:00:00");

                // ################
                // # content:info #
                // ################

                const content = document.querySelector("body");
                wrapElement(document, content, "ease-content");

                // Level3
                const level3Elements = document.querySelectorAll("h2");
                for(const level3Element of level3Elements){
                    if(level3Element.textContent.match(/\d{1,}/)){
                        wrapElement(document, level3Element, "level3");
                    }
                }
                                
                Array.prototype.forEach.call(document.querySelectorAll(".WordSection1 img"), function (node) { node.remove(); });
                return Promise.resolve();
            });
            // 4.Write
            await base.writePage(page, url, sp, path, true, true,true);
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