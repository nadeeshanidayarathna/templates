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
            await base.downloadPage(page, url, sp, path, null, 'utf16le');

            // 2.Identify
            // 3.Wrap
            await page.waitForSelector(".doc-content");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const rootTitle = document.querySelectorAll("h1 > span")[0];
                wrapElement(document, rootTitle, "level1");

                wrapElementDate(document, "issue-date", "2020-06-19" + "T00:00:00");
                wrapElementDate(document, "effective-date", "2020-01-01" + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('.doc-content');
                wrapElement(document, contentElement, "ease-content");

                const level2Elements = document.querySelectorAll("h2");
                wrapElements(document, level2Elements, "level2");

                const level3Elements = document.querySelectorAll("h3");
                wrapElements(document, level3Elements, "level3");

                const level4ElementsType1 = document.querySelectorAll("h4");
                wrapElements(document, level4ElementsType1, "level4");

                const level5Elements = document.querySelectorAll("p");
                for(const element of level5Elements){
                    if(element.textContent.match(/^\d{1,}.\d{1,}/)){
                        const level5ElementText = /^\d{1,}.\d{1,}/.exec(element.textContent);
                        element.outerHTML = element.outerHTML.replace(level5ElementText, "<div title=\"level5\" class=\"level5\">" + level5ElementText + "</div>");
                    }
                    else if(element.childElementCount > 1 && element.children[0].textContent.match(/\w/) && element.children[1].textContent.match(/^\d{1,}.\d{1,}/)){
                        const level5ElementText = /^\d{1,}.\d{1,}/.exec(element.children[1].textContent);
                        const letter = element.children[0].textContent.trim() + " ";
                        element.children[0].remove();
                        element.outerHTML = element.outerHTML.replace(level5ElementText, "<div title=\"level5\" class=\"level5\">" + letter + level5ElementText + "</div>");
                    }
                }
                
                const footnoteRefs = document.querySelectorAll('div > p > a[id*="ftn"]');
                for(const element of footnoteRefs){
                    const footnoteElement = element.parentElement.parentElement;
                    wrapElement(document, footnoteElement, "footnote");
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