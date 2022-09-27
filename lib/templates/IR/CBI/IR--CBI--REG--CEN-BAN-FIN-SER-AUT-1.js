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
            await page.waitForSelector("#act");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelector('.content-title');
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2004-07-23" + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('#act');
                wrapElement(document, contentElement, "ease-content");

                const alterTexts = document.querySelectorAll('#act tr > td');
                for (const elements of alterTexts) {
                    if (elements.textContent.trim().match(/^\d\.\s/)) {
                        for (const element of elements.childNodes) {
                            if (element.tagName == 'P') {
                                let alterText = /\d\.\s/.exec(element.textContent);
                                element.outerHTML = element.outerHTML.replace(alterText, "");
                            }
                        }
                    }
                }

                const level2Element = document.querySelectorAll('#act tr > td:nth-of-type(2) i');
                let i = 1;
                for (const elements of level2Element) {
                    let texts = elements.innerHTML;
                    elements.outerHTML = elements.outerHTML.replace(elements.innerHTML, "<div class=\"level2\" title=\"level2\">"+ i + ". " + texts + "</div>");
                    i++;
                }

                const level2element = document.querySelector('td > p > b');
                wrapElement(document, level2element, "level2");

                const level2Elements = document.querySelector("a[name='sched']");
                wrapElement(document, level2Elements.nextElementSibling, "level2");
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