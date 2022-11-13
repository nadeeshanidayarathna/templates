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
            await base.downloadPage(page, url, sp, path);

            // 2.Identify
            // 3.Wrap
            await page.waitForSelector("body");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                wrapElementLevel1(document, "GUIDELINES TO MAS NOTICE 626A ON PREVENTION OF MONEY LAUNDERING AND COUNTERING THE FINANCING OF TERRORISM");
                wrapElementDate(document, "issue-date", "2015-04-24" + "T00:00:00");
                wrapElementDate(document, "effective-date", "1899-12-31" + "T00:00:00");
                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('body');
                wrapElement(document, contentElement, "ease-content");

                const elements = document.querySelectorAll('h1, h2, h3, p');
                let nextLevel = 2;
                for (const element of elements) {
                    if (element.tagName == 'H1') {
                        wrapElement(document, element, "level2");
                        nextLevel = 3;
                    } else if (element.tagName == 'H2') {
                        wrapElement(document, element, "level3");
                        nextLevel = 4;
                    } else if (element.tagName == 'H3') {
                        wrapElement(document, element, "level4");
                        nextLevel = 5;
                    } else if (element.textContent.trim().match(/^\d+\.\d+[A-Z]?/)) {
                        let titles = /^\d+\.\d+[A-Z]?/.exec(element.textContent.trim());
                        let texts = element.textContent.trim().replace(titles, "");
                        element.outerHTML = element.outerHTML.replace(element.innerHTML, `<div class="level${nextLevel}" title="level${nextLevel}"> ${titles} </div> <div> ${texts} </div>`);
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