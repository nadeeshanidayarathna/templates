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
            await page.waitForSelector("body");
            await page.evaluate(function process() {

                // #############
                // # root:info #
                // #############

                const rootTitle = document.querySelectorAll("h1")[0];
                wrapElement(document, rootTitle, "level1");

                wrapElementDate(document, "issue-date", "2021-09-17" + "T00:00:00");
                wrapElementDate(document, "effective-date", "2021-10-09" + "T00:00:00");

                // ################
                // # content:info #
                // ################

                const contentElement = document.querySelector('body');
                wrapElement(document, contentElement, "ease-content");

                const level2Elements = document.querySelectorAll("h2");
                wrapElements(document, level2Elements, "level2");

                // Level3 auto-captured
                // Level4 auto-captured

                // level5
                var count = 0;
                const level5Elements = document.querySelectorAll("p > span");
                for(const element of level5Elements){
                    if(element.textContent.match(/^\d{1,}[A-Z]/) && count < 84){
                        count++;
                        const elementText = /^\d{1,}[A-Z]/.exec(element.textContent);
                        const level5ElementText = /^\d{1,}[A-Z]/.exec(element.textContent);
                        if(count <= 13 || (count >= 71 && count <=84)){
                            element.outerHTML = element.outerHTML.replace(elementText, "<div title=\"level3\" class=\"level3\">" + level5ElementText + "</div>");
                        }
                        else if((count >= 14 && count <= 26) || (count >=38 && count <= 44) || (count >= 56 && count <= 70)){
                            element.outerHTML = element.outerHTML.replace(elementText, "<div title=\"level4\" class=\"level4\">" + level5ElementText + "</div>");
                        }
                        else{
                            element.outerHTML = element.outerHTML.replace(elementText, "<div title=\"level5\" class=\"level5\">" + level5ElementText + "</div>");
                        }
                        
                    }
                    else if(element.textContent.match(/^\d{1,}./) && count < 84){
                        count++;
                        const elementText = /^\d{1,}./.exec(element.textContent);
                        const level5ElementText = /^\d{1,}/.exec(element.textContent);
                        if(count <= 13 || (count >= 71 && count <=84)){
                            element.outerHTML = element.outerHTML.replace(elementText, "<div title=\"level3\" class=\"level3\">" + level5ElementText + "</div>");
                        }
                        else if((count >= 14 && count <= 26) || (count >=38 && count <= 44) || (count >= 56 && count <= 70)){
                            element.outerHTML = element.outerHTML.replace(elementText, "<div title=\"level4\" class=\"level4\">" + level5ElementText + "</div>");
                        }
                        else{
                            element.outerHTML = element.outerHTML.replace(elementText, "<div title=\"level5\" class=\"level5\">" + level5ElementText + "</div>");
                        }
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