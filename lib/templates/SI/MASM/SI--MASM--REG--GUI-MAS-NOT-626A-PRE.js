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
            await base.downloadPage(page, url, sp, path, null, encoding = 'utf16le');

            // 2.Identify
            // 3.Wrap
            await page.waitForSelector("body");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const rootTitle = document.querySelector(".WordSection1 > h1");
                wrapElement(document, rootTitle, "level1");

                wrapElementDate(document, "issue-date", "2015-04-24" + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('body');
                wrapElement(document, contentElement, "ease-content");

                // level2 automatically captured

                // level3

                const level3Elements = document.querySelectorAll(".WordSection1 > .MsoNormal");
                for(const element of level3Elements){
                    if(element.textContent.match(/^\d{1,}.\d{1,}/)){
                        const level3ElementText = /^\d{1,}.\d{1,}/.exec(element.textContent);
                        element.outerHTML = element.outerHTML.replace(level3ElementText, "<div title=\"level3\" class=\"level3\">" + level3ElementText + "</div>")
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