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
            await page.waitForSelector(".doc-content");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############

                const level1Element = document.querySelector(".c511");
                wrapElement(document, level1Element, "level1");

                // ################
                // # content:info #
                // ################

                const contentElement = document.querySelectorAll('.doc-content')[0];
                wrapElement(document, contentElement, "ease-content");

                const docElements = document.querySelectorAll('p');
                for (const docElement of docElements) {
                    if ((docElement.outerText.charAt(1) == '.' || docElement.outerText.charAt(2) == '.') && docElement.childNodes[1] != undefined) {
                        if (docElement.childNodes[1].className == 'c8') {
                            let level3Element = [docElement.childNodes[0], docElement.childNodes[1]];
                            wrapElements(document, level3Element, "level3", group = true);
                        } else if (docElement.childNodes[0].outerText.startsWith('36.')) {
                            wrapElement(document, docElement.childNodes[0], "level3");
                        } else if (docElement.childNodes[0].outerText.startsWith('46.')) {
                            let level3Element = [docElement.childNodes[0], docElement.childNodes[1]];
                            wrapElements(document, level3Element, "level3", group = true);
                        }
                    } else if (docElement.childNodes[0] != undefined) {
                        if (docElement.childNodes[0].className == 'c8' && (docElement.outerText.startsWith('6') || docElement.outerText.startsWith('8') || docElement.outerText.startsWith('15'))) {
                            wrapElement(document, docElement.childNodes[0], "level3");
                        } else if (docElement.outerText.startsWith('FORM NO.6')) {
                            wrapElement(document, docElement.childNodes[0], "level3");
                        }
                    }
                }

                const level2Elements = document.querySelectorAll('.c8');
                let a = 0;
                for (const elements of level2Elements) {
                    if (elements.outerText.startsWith('CHAPTER') || elements.outerText.startsWith('ANNEXURE')) {
                        let level2Element = [elements, level2Elements[a + 1]];
                        wrapElements(document, level2Element, "level2", group = true);
                    } else if (elements.outerText.charAt(1) == "." || elements.outerText.charAt(2) == "." || elements.outerText.charAt(3) == ".") {
                        if (elements.outerText.charAt(0) != 'S') {
                            wrapElement(document, elements, "level3");
                        }
                    } else if (elements.outerText.startsWith('FORM NO')) {
                        wrapElement(document, elements, "level3");
                    } a++;
                }

                const heading6 = document.querySelectorAll('.h6');
                for (const childs of heading6) {
                    wrapElement(document, childs, "level3");
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