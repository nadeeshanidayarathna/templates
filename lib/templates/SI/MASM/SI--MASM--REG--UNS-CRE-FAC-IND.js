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
            await page.waitForSelector("body");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelector('.h1');
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2020-11-06" + "T00:00:00");
                wrapElementDate(document, "effective-date", "2020-11-06" + "T00:00:00");

                // ################
                // # content:info #
                // ################
                function getNextChar(char) {
                    return String.fromCharCode(char.charCodeAt(0) + 1);
                }
                
                const contentElement = document.querySelector('body');
                wrapElement(document, contentElement, "ease-content");

                const level2Element = document.querySelector('.h2');
                wrapElement(document, level2Element, "level2");

                const level3Element = document.querySelectorAll('h2, .h3');
                wrapElements(document, level3Element, "level3");

                const level4Element = document.querySelectorAll('.h4');
                wrapElements(document, level4Element, "level4");

                const alphaText = document.querySelectorAll('ol');
                for (const elements of alphaText) {
                    let alphas = 'a';
                    let alpha = String.fromCharCode(alphas.charCodeAt(0) + (elements.start - 1));
                    for (const element of elements.childNodes) {
                        if (element.tagName == "LI") {
                            let texts = element.innerHTML;
                            element.outerHTML = element.outerHTML.replace(element.innerHTML, "<span> (" + alpha + ") </span>" + texts);
                            alpha = getNextChar(alpha);
                        }
                    }
                }
                
                // removing unwanted content from ease-content
                
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