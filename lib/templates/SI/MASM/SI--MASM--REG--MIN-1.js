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
                const level1Element = document.querySelector('h1');
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2022-06-24" + "T00:00:00");

                // ################
                // # content:info #
                // ################

                const contentElement = document.querySelector('body');
                wrapElement(document, contentElement, "ease-content");

                const elements = document.querySelectorAll('h2, h3, h4, h5, h6, p');
                let nextLevel = 2;
                for (const element of elements) {
                    if (element.tagName == 'H2') {
                        wrapElement(document, element, "level2");
                        nextLevel = 3;
                    } else if (element.tagName == 'H4' || element.tagName == 'H5' || element.tagName == 'H3' || element.tagName == 'H6') {
                        if (element.textContent.trim().match(/^\([A-H]\)/)) {
                            wrapElement(document, element, "level4");
                            nextLevel = 5;
                        } else if (element.textContent.trim().match(/^\([H-Z]+\)/)) {
                            wrapElement(document, element, "level5");
                            nextLevel = 6;
                        } else {
                            wrapElement(document, element, "level3");
                            nextLevel = 4;
                        }
                    } else if (element.tagName == 'P' && element.textContent.trim().match(/^\d+[A-Z]?\s/)) {
                        let titles = /^\d+[A-Z]?\s/.exec(element.textContent.trim());
                        let texts = element.innerHTML.replace(titles, "");                   
                        element.outerHTML = element.outerHTML.replace(element.innerHTML, `<div class=\"level${nextLevel}\" title=\"level${nextLevel}\"> ${titles} </div><div> ${texts} </div>`);
                    }
                }

                const footnoteElement = document.querySelectorAll(".ftnote > div");
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