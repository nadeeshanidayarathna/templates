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
                
                const level1Element = "GUIDELINES ON THE REGULATION OF SHORT SELLING";
                wrapElementLevel1(document, level1Element);
                wrapElementDate(document, "issue-date", "2020-11-05" + "T00:00:00");
                wrapElementDate(document, "effective-date", "2019-09-24" + "T00:00:00");
                
                // ################
                // # content:info #
                // ################

                const content = document.querySelector("body");
                wrapElement(document, content, "ease-content");
                
                const level2Elements = document.querySelectorAll('h2');
                wrapElements(document, level2Elements, 'level2');

                const level3Elements = document.querySelectorAll('p > span');
                for(const element of level3Elements){
                    if(element.textContent.match(/^\d{1,2}[.]\d{1,2}/)){
                        const level3ElementText = /^\d{1,2}[.]\d{1,2}/.exec(element.textContent);
                        element.outerHTML = element.outerHTML.replace(level3ElementText, "<div title=\"level3\" class=\"level3\">" + level3ElementText + "</div>");
                    }
                }
         
                const footnoteElements = document.querySelectorAll('a[id*="ftnt"]');
                for(const element of footnoteElements){
                    if(element.parentElement.parentElement.tagName == "DIV"){
                        const footnoteElement = element.parentElement.parentElement;
                        wrapElement(document, footnoteElement, "footnote");
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