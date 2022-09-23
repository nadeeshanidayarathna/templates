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
                wrapElementDate(document, "issue-date", "1999-05-25" + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('body');
                wrapElement(document, contentElement, "ease-content");

                const level2Element = document.querySelectorAll('.h2, .h3, h4');
                let nextLevel = 2;
                for (const elements of level2Element) {
                    if (elements.classList.contains('h2')) {
                        wrapElement(document, elements, "level2");
                        nextLevel = 3;
                    } else if (elements.classList.contains('h3')) {
                        wrapElement(document, elements, "level3");
                        nextLevel = 4;
                    } else if (elements.tagName == 'H4') {
                        wrapElement(document, elements, "level" + nextLevel);
                    }
                }

                const numbering = document.querySelectorAll('ol.number');
                for (const elements of numbering) {
                    let a = 1;
                    for (const element of elements.childNodes) {
                        if (element.tagName == 'LI') {
                            let texts = element.innerHTML;
                            element.outerHTML = element.outerHTML.replace(element.innerHTML, "<span> " + a + ". </span>" + texts);
                            a++;
                        }
                    }
                }

                const footnoteElement = document.querySelectorAll('.fnote > div');
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