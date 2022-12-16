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
            await page.waitForSelector("main.container");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelector('h1');
                wrapElement(document, level1Element, "level1");
                const issueDateElement = document.querySelector('time');
                wrapElementDate(document, "issue-date", issueDateElement.textContent + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('main.container');
                wrapElement(document, contentElement, "ease-content");
                const removers = document.querySelectorAll("dt");
                for (const remover of removers) {
                    if (remover.textContent.trim().match(/^Foot/)) {
                        remover.remove();
                    }
                }

                Array.prototype.forEach.call(document.querySelectorAll("main h2"), function (node) { if (node.nextElementSibling.tagName == 'UL') { node.remove(); } });

                const level2Element = document.querySelectorAll('main h2[id]');
                wrapElements(document, level2Element, "level2");
                
                const footnoteElement = document.querySelectorAll('dd');
                for (const elements of footnoteElement) {
                    for (const element of elements.childNodes) {
                        if (element.tagName == 'P' && element.className == 'fn-rtn') {
                            let href = element.childNodes[0].getAttribute('href');
                            let fnLink = /fn\d+/.exec(href);
                            element.childNodes[0].removeAttribute('href');
                            element.childNodes[0].setAttribute('id', fnLink);
                            console.log(element.childNodes[0].outerHTML);
                            let footNotes = [element, element.previousElementSibling];
                            wrapElements(document, footNotes, "footnote", group = true);
                        }
                    }
                }

                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll("main ul, .wb-inv"), function (node) { node.remove(); });

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