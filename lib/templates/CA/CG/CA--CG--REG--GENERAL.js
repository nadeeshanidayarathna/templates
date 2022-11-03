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
            await page.waitForSelector("#left");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelector('.regtitle-e');
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2022-02-16" + "T00:00:00");
                wrapElementDate(document, "effective-date", "2021-01-01" + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('#left');
                wrapElement(document, contentElement, "ease-content");

                const level2Element = document.querySelectorAll('#left h3.heading1-e, .schedule-e, #left .section-e > b');
                let nextLevel = 2;
                for (const elements of level2Element) {
                    if (elements.classList.contains('heading1-e') || elements.classList.contains('schedule-e')) {
                        wrapElement(document, elements, "level2");
                        nextLevel = 3;
                    } else {
                        wrapElement(document, elements, "level" + nextLevel);
                    }
                }

                const alterText = document.querySelector('.leg-history-inner');
                const hiddenText = document.querySelector('.leg-history');
                hiddenText.outerHTML = hiddenText.outerHTML.replace(hiddenText.innerHTML, alterText.innerHTML);
                

                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll(".toc-e.tocExpandable"), function (node) { node.nextElementSibling.remove(); node.remove(); });

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