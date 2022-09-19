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
            await page.waitForSelector("table:nth-child(2)");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const text = document.querySelector(" h1");
                wrapElement(document, text.childNodes[2], "level1");

                const issuDates = document.querySelectorAll("p");
                for (const element of issuDates) {
                    if (element.textContent.charAt(5) == ":" && element.textContent.startsWith("Dated")) {
                        const issueDate = element.textContent.slice(6);
                        const dateFormat = (new Date(issueDate).toLocaleDateString('fr-CA'));
                        wrapElementDate(document, "issue-date", dateFormat + "T00:00:00");
                    } else if (element.textContent.startsWith("Effective")) {
                        const effectiveDate = element.textContent.slice(element.children[0]);
                        const dateFormat1 = (new Date(effectiveDate).toLocaleDateString('fr-CA'));
                        wrapElementDate(document, "effective-date", dateFormat1 + "T00:00:00");
                    }
                }
                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector("table:nth-child(2)");
                wrapElement(document, contentElement, "ease-content");

                const level2Element = document.querySelectorAll('h2');
                for (const element of level2Element) {
                    if (element.textContent.match(/^(?=[LXVI])(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})\.\s[A-Z]/)) {
                        wrapElement(document, element, "level2");
                    } else if (element.textContent.match(/^[A-H]/) && element.textContent.match(/[.]{1}/)) {
                        wrapElement(document, element, "level3");
                    }
                }

                const level3Element = document.querySelectorAll("h3");
                for (const element of level3Element) {
                    if (element.textContent.match(/[.]{1}/)) {
                        wrapElement(document, element, "level3");
                    } else {
                        wrapElement(document, element, "level4");
                    }
                }
                const level5Element = document.querySelectorAll("h4");
                wrapElements(document, level5Element, "level5");

                const pTags = document.querySelectorAll("p");
                var footNote = [];
                var previousFootnoteFound = false;
                for (const pTag of pTags) {
                    if (pTag.childNodes[0].tagName == "SUP") {
                        if (previousFootnoteFound) {
                            wrapElements(document, footNote, 'footnote', group = true);
                            // resetting data for the next footnote element
                            footNote = [];
                            previousFootnoteFound = false;
                        }
                        footNote.push(pTag);
                        previousFootnoteFound = true;
                    } else {
                        if (previousFootnoteFound) {
                            // collecting the 2,3,4 elements if exists to the same previous footnote
                            if (pTag.textContent.trim() != "") {
                                footNote.push(pTag);
                            } else {
                                wrapElements(document, footNote, 'footnote', group = true);
                            }
                        }
                    }
                }

                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.getElementsByTagName("h6"), function (node) { node.remove(); });
                Array.prototype.forEach.call(document.querySelectorAll("td.footer"), function (node) { node.remove(); });
                Array.prototype.forEach.call(document.querySelectorAll("td[valign='top']"), function (node) { node.remove(); });

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
};
module.exports = scraper;