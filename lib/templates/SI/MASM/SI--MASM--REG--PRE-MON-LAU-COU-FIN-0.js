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
                wrapElementDate(document, "issue-date", "2022-03-03" + "T00:00:00");
                wrapElementDate(document, "effective-date", "2022-03-01" + "T00:00:00");

                // ################
                // # content:info #
                // ################

                function getNextChar(char) {
                    return String.fromCharCode(char.charCodeAt(0) + 1);
                }

                const contentElement = document.querySelector('body');
                wrapElement(document, contentElement, "ease-content");

                const elements = document.querySelectorAll('.h2, h2, h3, p');
                let nextLevel = 2;
                for (const element of elements) {
                    if (element.classList.contains('h2')) {
                        wrapElement(document, element, "level2");
                        nextLevel = 3;
                    } else if (element.tagName == 'H2') {
                        wrapElement(document, element, "level3");
                        nextLevel = 4;
                    } else if (element.tagName == 'H3') {
                        wrapElement(document, element, "level4");
                        nextLevel = 5;
                    } else if (element.tagName == 'P' && element.textContent.trim().match(/^\d+\.\d+/)) {
                        let titles = /\d+\.\d+/.exec(element.textContent.trim());
                        let texts = element.innerHTML.replace(titles, "");                   
                        element.outerHTML = element.outerHTML.replace(element.innerHTML, `<div class=\"level${nextLevel}\" title=\"level${nextLevel}\"> ${titles} </div><div> ${texts} </div>`);
                    }
                }

                const footnoteElement = document.querySelectorAll("div[id^='ftn']");
                wrapElements(document, footnoteElement, "footnote");

                const alphaText = document.querySelectorAll('ol');
                for (const elements of alphaText) {
                    let alphas = 'a';
                    let alpha = String.fromCharCode(alphas.charCodeAt(0) + (elements.start - 1));
                    for (const element of elements.childNodes) {
                        if (element.tagName == "LI") {
                            let texts = element.innerHTML;
                            element.outerHTML = element.outerHTML.replace(element.innerHTML, "<span> (" + alpha + ") </span>" + texts);
                            alpha = getNextChar(alpha);
                        }
                    }
                }

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