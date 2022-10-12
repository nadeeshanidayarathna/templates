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
            await base.downloadPage(page, url, sp, path);

            // 2.Identify
            // 3.Wrap
            await page.waitForSelector("#MainContent_pnlHtmlControls");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelector('#MainContent_pnlHtmlControls .atitle');
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2016-12-22" + "T00:00:00");
                wrapElementDate(document, "effective-date", "2016-12-22" + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('#MainContent_pnlHtmlControls');
                wrapElement(document, contentElement, "ease-content");

                const level2Elements = document.querySelectorAll("#MainContent_pnlHtmlControls p[align='center']");
                wrapElements(document, level2Elements, "level2", group = true);

                const level2Element = document.querySelector('.aNotetoclassorder');
                wrapElement(document, level2Element, "level2");

                const level3Elements = document.querySelectorAll('#MainContent_pnlHtmlControls p');
                for (const elements of level3Elements) {
                    if (elements.nextElementSibling && elements.childNodes[0].tagName == 'B' && elements.childNodes[0].childNodes[0].tagName == 'SPAN') {
                        if (elements.nextElementSibling.nextElementSibling) {
                            if (elements.nextElementSibling.nextElementSibling.textContent.trim().match(/^\d\./)) {
                                wrapElement(document, elements, "level3");
                            }
                        }
                    }
                }

                const level3Element = document.querySelectorAll('.aNote1, .aTableof');
                wrapElements(document, level3Element, "level3");

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