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
                const level1Element = document.querySelector('h6');
                wrapElement(document, level1Element, "level1");
                const issueDate = document.querySelector('.dateN');
                const dateFormat = (new Date(issueDate.textContent).toLocaleDateString('fr-CA'));
                wrapElementDate(document, "issue-date", dateFormat + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('body');
                wrapElement(document, contentElement, "ease-content");

                const level2Element = document.querySelectorAll('h1');
                wrapElements(document, level2Element, "level2");

                const level3Element = document.querySelectorAll('p');
                for (const elements of level3Element) {
                    if (elements.textContent.trim().match(/^\d\d.|^\d./)) {
                        const levelNo = elements.textContent.trim().match(/^\d\d.|^\d./)
                        console.log("level number : "+levelNo[0])
                        elements.outerHTML = elements.outerHTML.replace(levelNo[0], "<div title=\"level3\" class=\"level3\">" + levelNo[0] + "</div>");
                    }
                }

                const ElementN = document.querySelectorAll('.footnotedescription');
                wrapElements(document, ElementN, "footnote");
                
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