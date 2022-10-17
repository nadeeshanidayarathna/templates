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
                wrapElementDate(document, "issue-date", "2011-02-07" + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('body');
                wrapElement(document, contentElement, "ease-content");

                function getNextChar(char) {
                    return String.fromCharCode(char.charCodeAt(0) + 1);
                }

                const level2Element = document.querySelector('.h2');
                wrapElement(document, level2Element, "level2");

                const footnoteElement = document.querySelectorAll('.ftnote > div');
                wrapElements(document, footnoteElement, "footnote");

                const alphaText = document.querySelectorAll('ol.lst-kix_list_4-1, .lst-kix_list_8-1, .lst-kix_list_10-1');
                for (const elements of alphaText) {
                    let alpha = 'a';
                    for (const element of elements.childNodes) {
                        if (element.tagName == 'LI') {
                            let texts = element.innerHTML;
                            element.outerHTML = element.outerHTML.replace(element.innerHTML, "<span>("+ alpha +") </span>" + texts);
                            alpha = getNextChar(alpha);
                        }
                    }
                }

                const numText = document.querySelectorAll('.lst-kix_list_2-0, .lst-kix_list_4-0, .lst-kix_list_10-0');
                for (const elements of numText) {
                    let num = elements.start;
                    for (const element of elements.childNodes) {
                        if (element.tagName == 'LI') {
                            let texts = element.innerHTML;
                            element.outerHTML = element.outerHTML.replace(element.innerHTML, "<span>" + num + "  </span>" + texts);
                            num++;
                        }
                    }
                }

                // removing unwanted content from ease-content
                
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