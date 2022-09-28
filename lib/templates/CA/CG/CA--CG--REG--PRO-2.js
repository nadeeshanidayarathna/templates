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
            await page.waitForSelector("main");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelectorAll('.Title-of-Act, .ChapterNumber');
                wrapElements(document, level1Element, "level1", group = true);
                wrapElementDate(document, "issue-date", "2022-09-15" + "T00:00:00");
                // wrapElementDate(document, effectiveDateElement, "effective-date", effectiveDateElement.textContent + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('main');
                wrapElement(document, contentElement, "ease-content");

                const level2Element = document.querySelectorAll('.Part , h2.scheduleLabel');
                wrapElements(document, level2Element, "level2");

                const level3Element = document.querySelectorAll('.caption');
                for (const elements of level3Element) {
                    let element = [elements, elements.nextElementSibling];
                    wrapElements(document, element, "level3", group = true);
                }

                const level4Element = document.querySelectorAll('a.sectionLabel > span.sectionLabel');
                wrapElements(document, level4Element, "level4");

                const footText = document.querySelectorAll('.wb-invisible');
                for (const elements of footText) {
                    elements.outerHTML = elements.outerHTML.replace(elements.innerHTML, " ");
                }

                const footnoteElement = document.querySelectorAll('div.Footnote');
                wrapElements(document, footnoteElement, "footnote");

                const markers = document.querySelectorAll('div.HistoricalNote > ul');
                for (const markerUL of markers) {
                    let i = 0;
                    for (const marker of markerUL.childNodes) {
                        if (i == (markerUL.childNodes.length - 1)) {
                            let texts = marker.innerHTML;
                            marker.outerHTML = marker.outerHTML.replace(marker.outerHTML, "<span>" + texts + "<span>. </span></span>");
                        } else {
                            let texts = marker.innerHTML;
                            marker.outerHTML = marker.outerHTML.replace(marker.outerHTML, "<span>" + texts + "<span>; </span></span>");
                        }i++;
                    }
                }

                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll(".legisHeader, .FCSelector, #right-panel, div.PITLink"), function (node) { node.remove(); });
                Array.prototype.forEach.call(document.getElementsByTagName("li, ul, ol"), function (node) { node.style.listStyleType = 'none'; });

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