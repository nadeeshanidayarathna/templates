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
            await page.waitForSelector("#act");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelector('.content-title');
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2004-12-17" + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('#act');
                wrapElement(document, contentElement, "ease-content");

                const alterTexts = document.querySelectorAll('#act tr > td');
                for (const elements of alterTexts) {
                    if (elements.textContent.trim().match(/^\d\.\s/)) {
                        for (const element of elements.childNodes) {
                            if (element.tagName == 'P') {
                                let alterText = /\d\.\s/.exec(element.textContent);
                                element.outerHTML = element.outerHTML.replace(alterText, "");
                            }
                        }
                    } else if (elements.textContent.trim().match(/^\d{2}\.\s/)) {
                        for (const element of elements.childNodes) {
                            if (element.tagName == 'P') {
                                let alterText = /\d{2}\.\s/.exec(element.textContent);
                                element.outerHTML = element.outerHTML.replace(alterText, "");
                            }
                        }
                    }
                }

                const level2Element = document.querySelectorAll("#act td:nth-of-type(3)");
                for (const elements of level2Element) {
                    if (elements.textContent.trim().match(/^PART/)) {
                        wrapElement(document, elements, "level2");
                    } else if (elements.textContent.trim().match(/^[A-Z]+\s[A-Z]+\./)) {
                        wrapElement(document, elements, "level2");
                    }
                }

                const level3Element = document.querySelectorAll('#act tr > td:nth-of-type(2) i');
                let i = 1;
                for (const elements of level3Element) {
                    let texts = elements.innerHTML;
                    elements.outerHTML = elements.outerHTML.replace(elements.innerHTML, "<div class=\"level3\" title=\"level3\">"+ i + ". " + texts + "</div>");
                    i++;
                }

                const scheduleElement = document.querySelectorAll("a[name^='sched']");
                for (const elements of scheduleElement) {
                    wrapElement(document, elements.nextElementSibling, "level2");
                }

                // wrapElement(document, level2Element, "level2");
                // wrapElement(document, level3Element, "level3");
                // wrapElement(document, level4Element, "level4");
                // wrapElement(document, level5Element, "level5");
                // wrapElement(document, level6Element, "level6");
                // wrapElement(document, level7Element, "level7");
                // wrapElement(document, level8Element, "level8");
                // wrapElement(document, level9Element, "level9");
                // wrapElement(document, footnoteElement, "footnote");

                // removing unwanted content from ease-content
                
                return Promise.resolve();
            });
            // 4.Write
            await base.writePage(page, url, sp, path, true, true, true);
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