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
            await page.waitForSelector(".page-banner .col9 h1");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelector(".page-banner .col9 h1");
                wrapElement(document, level1Element, "level1");
                const effectiveDateElement = document.querySelector('.published-date');
                let fullText = effectiveDateElement.textContent
                        let check = (fullText.indexOf("on") + 1)
                        let part2 = fullText.substring(check, fullText.length);
                        wrapElementDate(document, "issue-date", (new Date(part2).toLocaleDateString('fr-CA')) + "T00:00:00");
            
                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('#output');
                wrapElement(document, contentElement, "ease-content");

                const level2Elements = document.querySelectorAll(".content-block h2");
                wrapElements(document, level2Elements, "level2");

                const level3Elements = document.querySelectorAll('.content-block h3');
                wrapElements(document, level3Elements, "level3");

                const level4Elements = document.querySelectorAll('.content-block h4');
                wrapElements(document, level4Elements, "level4");

                var asciiCode = 1;
                const olItems = document.querySelectorAll(".footnotes-container > ol")[0];
                for (const contentChild of olItems.childNodes) {
                        contentChild.innerHTML ="<div title=\"footnote\" class=\"footnote\">" + asciiCode + ". " + contentChild.innerHTML + "</div>";
                        asciiCode++;
                }

                const bulletText = document.querySelectorAll('ul > li');
                for (const elements of bulletText) {
                    let texts = elements.innerHTML;
                    elements.outerHTML = elements.outerHTML.replace(elements.innerHTML, "<span> • </span>" + texts);
                }

                var asciiCode = 1;
                const olItems1 = document.querySelectorAll(".section-heading ol")[0];
                for (const contentChild of olItems1.childNodes) {

                    let texts = contentChild.innerHTML;
                    contentChild.outerHTML = contentChild.outerHTML.replace(contentChild.innerHTML, "<span>" +asciiCode+ ". "+ "</span>" + texts);
                    asciiCode++;
                }

                var asciiCode = 1;
                const olItems2 = document.querySelectorAll(".section-heading ol")[1];
                for (const contentChild of olItems2.childNodes) {

                    let texts = contentChild.innerHTML;
                    contentChild.outerHTML = contentChild.outerHTML.replace(contentChild.innerHTML, "<span>" +asciiCode+ ". "+ "</span>" + texts);
                    asciiCode++;
                }

                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll(".modal__content, .visually-hidden"), function (node) { node.remove(); });
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