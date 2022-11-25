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
            await page.waitForSelector(".occgov-section__content:not(.occgov-section__content--topics)");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelector('h1');
                wrapElement(document, level1Element, "level1");
                const issueDates = document.querySelector('.date');
                const issueDate = (new Date(issueDates.textContent).getFullYear()) + "-" + ("0" + (new Date(issueDates.textContent).getMonth() + 1)).slice(-2) + "-" + ("0" + (new Date(issueDates.textContent).getDate())).slice(-2)
                wrapElementDate(document, "issue-date", issueDate + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('.occgov-section__content:not(.occgov-section__content--topics)');
                wrapElement(document, contentElement, "ease-content");

                const level2Element = document.querySelectorAll('.occgov-issuance-content h3');
                wrapElements(document, level2Element, "level2");

                const level3Element = document.querySelectorAll('.occgov-issuance-content strong');
                wrapElements(document, level3Element, "level3");

                const alterFootnote = document.querySelector('div.footnote');
                alterFootnote.setAttribute("class", "");

                const footnoteElement = document.querySelectorAll('.occgov-issuance-content p');
                for (const elements of footnoteElement) {
                    if (elements.childNodes[0].id) {
                        if (elements.childNodes[0].id.match(/^footer/) && elements.nextElementSibling) {
                            if (elements.nextElementSibling.childNodes[0].id) {
                                wrapElement(document, elements, "footnote");
                            } else {
                                let element = [elements, elements.nextElementSibling];
                                wrapElements(document, element, "footnote", group = true);
                            }
                        } else {
                            wrapElement(document, elements, "footnote");
                        }
                    }
                }

                const bulletText = document.querySelectorAll('.occgov-issuance-content ul > li');
                for (const elements of bulletText) {
                    let texts = elements.innerHTML;
                    elements.outerHTML = elements.outerHTML.replace(elements.innerHTML, "<span> ■ </span>" + texts);
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