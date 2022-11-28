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
                // #############2
                const level1Element = document.querySelector('.ShortTP1');
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2019-04-10" + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('#MainContent_pnlHtmlControls');
                wrapElement(document, contentElement, "ease-content");

                const level2Element = document.querySelectorAll(".ActHead6, .ActHead2, .ActHead7, .ActHead3, .ActHead5, .ItemHead");
                let nextLevel = 2;
                let schedule = 0;
                for (const elements of level2Element) {
                    if (elements.className == 'ActHead6') {
                        if (elements.textContent.trim().match(/^Schedule\s2/)) {
                            schedule = 1;
                        }
                        wrapElement(document, elements, "level2");
                        nextLevel = 3;
                    } else if (elements.className == 'ItemHead') {
                        if (schedule == 1) {
                            wrapElement(document, elements, "level4");
                            nextLevel = 5;
                        } else {
                            wrapElement(document, elements, "level3");
                            nextLevel = 4;
                        }
                    } else if (elements.className == 'ActHead7') {
                        wrapElement(document, elements, "level3");
                        nextLevel = 4;
                    } else if (elements.className == 'ActHead3') {
                        if (schedule == 1) {
                            wrapElement(document, elements, "level6");
                            nextLevel = 7;
                        } else {
                            wrapElement(document, elements, "level5");
                            nextLevel = 6;
                        }
                    } else if (elements.className == 'ActHead2') {
                        wrapElement(document, elements, "level" + nextLevel);
                        nextLevel++;
                    } else if (elements.className == 'ActHead5') {
                        wrapElement(document, elements, "level" + nextLevel);
                    }
                }

                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll(".WordSection2, .WordSection1, img"), function (node) { node.remove(); });

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