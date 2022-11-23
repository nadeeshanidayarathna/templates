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
            await page.waitForSelector(".text-page-wrapper");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelector('.text-page-wrapper h1');
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2022-05-01" + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('.text-page-wrapper');
                wrapElement(document, contentElement, "ease-content");

                const level2Element = document.querySelectorAll('.text-page-wrapper h2');
                wrapElements(document, level2Element, "level2");

                const level3Element = document.querySelectorAll('.text-page-wrapper h3');
                wrapElements(document, level3Element, "level3");

                const bullets = document.querySelectorAll(".text-page-wrapper ul")
                for (const elements of bullets) {
                    for (const element of elements.childNodes) {
                        if (element.tagName == 'LI' && element.style.listStyleType != 'none') {
                            if (elements.classList.contains('arrow-list')) {
                                let texts = element.innerHTML;
                                element.outerHTML = element.outerHTML.replace(element.innerHTML, "<span>⮞ </span>" + texts);
                            } else {
                                let texts = element.innerHTML;
                                element.outerHTML = element.outerHTML.replace(element.innerHTML, "<span>• </span>" + texts);
                            }
                        }
                    }
                }

                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll(".text-page-wrapper nav, .print"), function (node) { node.remove(); });

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