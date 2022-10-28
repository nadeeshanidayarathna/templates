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
            await page.waitForSelector("#wb-main");
            await page.evaluate(function process() {
                   // removing unwanted content from ease-content
                   Array.prototype.forEach.call(document.querySelectorAll("section h2, section dt, .wb-invisible"), function (node) { node.remove(); });

                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelector('#wb-cont');
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2022-10-21" + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('#wb-main');
                wrapElement(document, contentElement, "ease-content");

                const level2Element = document.querySelectorAll("h2");
                wrapElements(document, level2Element, "level2");

                const level3Element = document.querySelectorAll("h3");
                wrapElements(document, level3Element, "level3");

                const level4Element = document.querySelectorAll("h4");
                wrapElements(document, level4Element, "level4");

                const liItems = document.querySelectorAll("li");
                for (const contentChild of liItems) {
                        contentChild.innerHTML ="<div>" +"•" + contentChild.innerHTML + "</div>";
                }


                const footnoteElement = document.querySelectorAll('section dd');
                for (const elements of footnoteElement) {
                    for (const element of elements.childNodes) {
                        if (element.tagName == 'P' && element.className == 'footnote-return') {
                            let href = element.childNodes[1].getAttribute('href');
                            let fnLink = /fnb\d/.exec(href); 
                            element.childNodes[1].removeAttribute('href');
                            element.childNodes[1].setAttribute('id', fnLink);
                            let footNotes = [element, element.previousElementSibling];
                            wrapElements(document, footNotes, "footnote", group = true);
                        }
                    }
                }


                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll("section h2"), function (node) { node.remove(); });

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