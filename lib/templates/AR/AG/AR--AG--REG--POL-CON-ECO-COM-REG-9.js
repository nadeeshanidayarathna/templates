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
                const rootTitle = "Pollution Control and Ecology Commission - Regulation 11 - Solid Waste Disposal Fees; Landfill Post-Closure Trust Fund; and Recycling Grants Program";
                wrapElementLevel1(document, rootTitle);
                wrapElementDate(document, "issue-date", "2013-01-25" + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('body');
                wrapElement(document, contentElement, "ease-content");

                const level2Elements = document.querySelectorAll("h2");
                wrapElements(document, level2Elements, "level2");

                const level3Elements = document.querySelectorAll("h3");
                wrapElements(document, level3Elements, "level3");

                const level4Elements = document.querySelectorAll("h4");
                wrapElements(document, level4Elements, "level4");

                const level3Element = document.querySelectorAll('.MsoNormal');
                for (const elements of level3Element) {
                    if (elements.textContent.trim().match(/^\([A-Z]\)/)) {
                        const levelNo = elements.textContent.trim().match(/^\([A-Z]\)|^\(\d\)/)
                        elements.outerHTML = elements.outerHTML.replace(levelNo[0], "<div title=\"level4\" class=\"level4\">" + levelNo[0] + "</div>");
                    }if (elements.textContent.trim().match(/^\(\d\)/)) {
                        const levelNo = elements.textContent.trim().match(/^\([A-Z]\)|^\(\d\)/)
                        elements.outerHTML = elements.outerHTML.replace(levelNo[0], "<div title=\"level5\" class=\"level5\">" + levelNo[0] + "</div>");
                    }
                     else if (elements.textContent.trim().match(/^\([a-z]\)|^\(\d\)/)) {
                        const levelNo = elements.textContent.trim().match(/^\([a-z]\)|^\(\d\)/)
                        elements.outerHTML = elements.outerHTML.replace(levelNo[0], "<div title=\"level6\" class=\"level6\">" + levelNo[0] + "</div>");
                    }
                }

                const level5Elements = document.querySelectorAll("h5");
                wrapElements(document, level5Elements, "level5");

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