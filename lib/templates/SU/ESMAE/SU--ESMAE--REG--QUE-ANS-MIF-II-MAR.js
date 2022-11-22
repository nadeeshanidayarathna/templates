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
                const level1Element = document.querySelector('.h1');
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2022-09-23" + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('body');
                wrapElement(document, contentElement, "ease-content");

                const level3Element = document.querySelectorAll('h1, h2, h3, .h3');
                let nextLevel = 2;
                for (const elements of level3Element) {
                    if (elements.tagName == 'H1' || elements.tagName == 'H2') {
                        wrapElement(document, elements, "level2");
                        nextLevel = 3;
                    } else if (elements.classList.contains('h3')) {
                        wrapElement(document, elements, "level3");
                    } else if (elements.tagName == 'H3') {
                        if (elements.textContent.trim().match(/^\d/)) {
                            wrapElement(document, elements, "level3");
                            nextLevel = 4;
                        } else if (elements.textContent.trim().match(/]$/)) {
                            let titles = /^Question\s\d+[a-z]?/.exec(elements.textContent.trim());
                            let texts = elements.textContent.trim().replace(titles, "");
                            elements.outerHTML = elements.outerHTML.replace(elements.innerHTML, `<div class=\"level${nextLevel}\" title=\"${nextLevel}\"> ${titles}</div><div>${texts}</div>`);
                        } else {
                            wrapElement(document, elements, "level" + nextLevel);
                        }
                    }
                }

                const footnoteElement = document.querySelectorAll("div[id^='ftn']");
                wrapElements(document, footnoteElement, "footnote");

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