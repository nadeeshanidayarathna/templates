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
            await page.waitForSelector("#content");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelector('#content h1');
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2021-02-18" + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('#content');
                wrapElement(document, contentElement, "ease-content");

                const elements = document.querySelector('#content #parent-fieldname-text');
                let i = 0;
                for (const element of elements.childNodes) {
                    if (element.tagName == 'H3') {
                        wrapElement(document, element, "level2");
                        i = 1;
                    } else if (i > 0) {
                        if (element.className == 'callout') {
                            wrapElement(document, element, "level3");
                        } else if (element.textContent.trim().match(/^\d\.\d/) && element.tagName == 'P') {
                            wrapElement(document, element, "level4");
                        }
                    } else {
                        element.remove();
                    }
                }

                const level4Element = document.querySelectorAll('#content #parent-fieldname-text .WACEditing p');
                for (const element of level4Element) {
                    if (element.textContent.trim().match(/^\d\.\d/)) {
                        wrapElement(document, element, "level4");
                    }
                }

                const bulletText = document.querySelectorAll('#content #parent-fieldname-text li');
                for (const elements of bulletText) {
                    if (elements.childNodes[1]) {
                        if (elements.childNodes[1].tagName == 'P') {
                            let texts = elements.childNodes[1].innerHTML;
                            elements.childNodes[1].outerHTML = elements.childNodes[1].outerHTML.replace(elements.childNodes[1].innerHTML, "<span> • </span>" + texts);
                        } else {
                            let texts = elements.innerHTML;
                            elements.outerHTML = elements.outerHTML.replace(elements.innerHTML, "<span> • </span>" + texts);
                        }
                    } else {
                        let texts = elements.innerHTML;
                        elements.outerHTML = elements.outerHTML.replace(elements.innerHTML, "<span> • </span>" + texts);
                    }
                }

                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll("#content #parent-fieldname-text .anchor-link"), function (node) { if (node.textContent.trim().match(/^Voltar/)) { node.remove(); } });
                Array.prototype.forEach.call(document.querySelectorAll("#content .social-links"), function (node) { node.remove(); });
                Array.prototype.forEach.call(document.querySelectorAll("a"), function (node) { if (node.textContent.trim() == "") { node.removeAttribute("href");} });

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