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
            await page.waitForSelector(".main-col");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelector('h1.main-title-light');
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2022-04-30" + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('.main-col');
                wrapElement(document, contentElement, "ease-content");

                const level2Element = document.querySelectorAll('article.js-child .name-article');
                wrapElements(document, level2Element, "level2");

                const alterText = document.querySelector('div.summary-preface');
                alterText.outerHTML = alterText.outerHTML.replace(/<br>/g, "</p><p>");

                const stylingText = document.querySelectorAll('.nota');
                for (const elements of stylingText) {
                    let text = elements.innerHTML;
                    elements.outerHTML = elements.outerHTML.replace(elements.innerHTML, "<p>NOTA: </p>" + text);
                }
                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll(".links-init-version, .small-search-block, .loda, .tabs-secondary.tabs-main, .see-abrogated, .summary-box, button"), function (node) { node.remove(); });
                Array.prototype.forEach.call(document.getElementsByTagName("li"), function (node) { node.style.listStyleType = 'none'; });

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