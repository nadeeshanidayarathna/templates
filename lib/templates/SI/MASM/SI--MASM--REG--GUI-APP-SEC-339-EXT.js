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

                const rootTitle = document.querySelector('.h1');
                wrapElement(document, rootTitle, "level1");
                wrapElementDate(document, "issue-date", "2004-02-27" + "T00:00:00");

                // ################
                // # content:info #
                // ################

                const content = document.querySelector("body");
                wrapElement(document, content, "ease-content");

                const level2Element = document.querySelectorAll("h2");
                wrapElements(document, level2Element, "level2");

                const level3Element = document.querySelectorAll("p");
                for (const elements of level3Element) {
                    if (elements.textContent.trim().match(/^\d\.\d\s/)) {
                        let titles = /^\d\.\d/.exec(elements.textContent.trim());
                        let texts = elements.innerHTML.replace(titles, "");
                        elements.outerHTML = elements.outerHTML.replace(elements.innerHTML, `<div class=\"level3\" title=\"level3\"> ${titles} </div><div> ${texts} </div>`);
                    }
                }

                const footNoteElement = document.querySelectorAll("div[id^='ftn']");
                wrapElements(document, footNoteElement, "footnote");

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