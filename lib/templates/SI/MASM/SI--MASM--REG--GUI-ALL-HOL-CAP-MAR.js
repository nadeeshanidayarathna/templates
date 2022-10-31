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
                
                const level1Element = "GUIDELINES TO ALL HOLDERS OF A CAPITAL MARKETS SERVICES LICENCE FOR REAL ESTATE INVESTMENT TRUST MANAGEMENT";
                wrapElementLevel1(document, level1Element);
                wrapElementDate(document, "issue-date", "2021-12-20" + "T00:00:00");
                wrapElementDate(document, "effective-date", "2021-12-20" + "T00:00:00");
                
                // ################
                // # content:info #
                // ################

                const content = document.querySelector("body");
                wrapElement(document, content, "ease-content");
                
                const level2Elements = document.querySelectorAll('h2');
                wrapElements(document, level2Elements, 'level2');

                const level3Elements = document.querySelectorAll('p > span');
                for(const element of level3Elements){
                    if(element.textContent.match(/^5.2/)){
                        const level3ElementText = "5.2";
                        element.outerHTML = element.outerHTML.replace(level3ElementText, "<div title=\"level3\" class=\"level3\">" + level3ElementText + "</div>");
                        break;
                    }
                    else if(element.textContent.match(/^\d{1,2}[.]\d{1,2}\s{1,}/)){
                        const level3ElementText = /^\d{1,2}[.]\d{1,2}/.exec(element.textContent);
                        element.outerHTML = element.outerHTML.replace(level3ElementText, "<div title=\"level3\" class=\"level3\">" + level3ElementText + "</div>");
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