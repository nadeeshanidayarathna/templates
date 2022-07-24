const base = require("./common/base");

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

                // TODO:
                const rootTitle = document.querySelectorAll('.ShortT')[0];
                wrapElement(document, rootTitle, "level1");
                wrapElementDate(document, "issue-date", "2022-07-04" + "T00:00:00");
                wrapElementDate(document, "effective-date", "2022-07-01" + "T00:00:00");

                // ################
                // # content:info #
                // ################

                let nextLevel = 2;
                const contentElement = document.querySelectorAll('#MainContent_pnlHtmlControls')[0];
                wrapElement(document, contentElement, "ease-content");

                const elements = document.querySelectorAll('.WordSection3');
                for (const element of elements[0].childNodes) {
                    if (element.className == 'ActHead2') {
                        wrapElement(document, element, "level2");
                        nextLevel = 3;
                    } else if (element.className == 'ActHead3') {
                        wrapElement(document, element, "level3");
                        nextLevel = 4;
                    } else if (element.className == 'ActHead4') {
                        wrapElement(document, element, "level4");
                        nextLevel = 5;
                    } else if (element.className == 'ActHead5') {
                        wrapElement(document, element, "level"+nextLevel);
                    }
                }

                const level2Elements2 = document.querySelectorAll('.ActHead1')[0];
                wrapElement(document, level2Elements2, "level2");
                                
                const level3Elements = document.querySelectorAll('.ENotesHeading2');
                for (const level3Element of level3Elements) {
                    wrapElement(document, level3Element, "level3");
                }

                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll(".WordSection1 > .MsoNormal > span > img, .WordSection2"), function (node) { node.remove(); });

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