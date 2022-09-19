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
            await page.waitForSelector("#wb-cont");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############

                const level1Element = document.querySelector('h1');
                wrapElement(document, level1Element, "level1");
                const issueDates = document.querySelector('#wb-cont > p:nth-of-type(2)');
                const issueDate = (new Date(issueDates.textContent).getFullYear()) + "-" + ("0" + (new Date(issueDates.textContent).getMonth() + 1)).slice(-2) + "-" + ("0" + (new Date(issueDates.textContent).getDate())).slice(-2)
                wrapElementDate(document, "issue-date", issueDate + "T00:00:00");

                // ################
                // # content:info #
                // ################

                function getNextChar(char) {
                    return String.fromCharCode(char.charCodeAt(0) + 1);
                }

                const contentElement = document.querySelector('#wb-cont');
                wrapElement(document, contentElement, "ease-content");

                const level2Element = document.querySelectorAll('#wb-cont > h2, #fn');
                for (const elements of level2Element) {
                    if (elements.id == "") {
                        elements.remove();
                    } else {
                        wrapElement(document, elements, "level2");
                    }
                }

                const level3Element = document.querySelectorAll('#wb-cont > h3');
                wrapElements(document, level3Element, "level3");

                const level4Element = document.querySelectorAll('#wb-cont > h4');
                wrapElements(document, level4Element, "level4");

                const level5Element = document.querySelectorAll('#wb-cont > h5');
                wrapElements(document, level5Element, "level5");

                const footnoteElement = document.querySelectorAll('.wb-fnote > dl > dd');
                wrapElements(document, footnoteElement, "footnote");

                const bulletText = document.querySelectorAll('#wb-cont ul > li');
                for (const elements of bulletText) {
                    let texts = elements.innerHTML;
                    elements.outerHTML = elements.outerHTML.replace(elements.innerHTML, "<span> • </span>" + texts);
                }

                const alphaText = document.querySelectorAll('#wb-cont ol.lst-lwr-alph');
                for (const elements of alphaText) {
                    let alpha = 'a';
                    for (const element of elements.childNodes) {
                        if (element.tagName == "LI") {
                            let texts = element.innerHTML;
                            element.outerHTML = element.outerHTML.replace(element.innerHTML, "<span>" + alpha + ". </span>" + texts);
                            alpha = getNextChar(alpha);
                        }
                    }
                }

                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll(".list-unstyled, .alert.alert-info, .row:not(.pagedetails)"), function (node) { node.remove(); });

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