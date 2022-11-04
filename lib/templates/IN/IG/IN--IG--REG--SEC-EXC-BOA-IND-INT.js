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
                const level1Element = document.querySelector('.c206');
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2008-05-26" + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('body');
                wrapElement(document, contentElement, "ease-content");

                const level2Element = document.querySelectorAll('h1');
                for (const elements of level2Element) {
                    if (elements.textContent.trim().match(/^CHAPTER|^SCHEDULE/)) {
                        wrapElement(document, elements, "level2");
                    }
                }

                const level2Elements = document.querySelector('.c141');
                wrapElement(document, level2Elements, "level2");

                const level3Element = document.querySelectorAll('h2');
                let i = 1;
                for (const elements of level3Element) {
                    if (elements.textContent.trim().match(/^\d+/)) {
                        wrapElement(document, elements, "level3");
                    } else {
                        let title = elements.innerHTML;
                        elements.outerHTML = elements.outerHTML.replace(title, "<div class=\"level3\" title=\"level3\"><span>" + i + ". </span>" + title + "</div>");
                        i++;
                    }
                }

                const footNoteElement = document.querySelectorAll('.ftnote > div');
                wrapElements(document, footNoteElement, "footnote");

                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll("span.c0"), function (node) { if (node.textContent.trim().match(/^\d+\.$/)) { node.remove(); } });

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