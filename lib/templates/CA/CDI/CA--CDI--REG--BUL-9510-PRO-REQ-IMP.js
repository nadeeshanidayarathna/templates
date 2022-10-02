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
            await page.waitForSelector(".content_left_column .add_maincontent_padding");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                wrapElementLevel1(document, "Bulletin 95-10: Procedures and Requirements for Implementation of California Insurance Code Section 10507.5 (SB 188, 1995) Governing Life Insurance Company Obligations Regarding Contract-holder Owned Assets.");
                wrapElementDate(document, "issue-date", "1995-11-01" + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('.content_left_column .add_maincontent_padding');
                wrapElement(document, contentElement, "ease-content");

                function getNextChar(char) {
                    return String.fromCharCode(char.charCodeAt(0) + 1);
                }

                const level2Element = document.querySelectorAll('.content_left_column .add_maincontent_padding h3');
                let i = 0;
                for (const elements of level2Element) {
                    if (i != (level2Element.length - 1)) {
                        let texts = elements.innerHTML;
                        elements.outerHTML = elements.outerHTML.replace(elements.innerHTML, "<div class=\"level2\" title=\"level2\">" + (i + 1) + ". " + texts + "</div>");
                    } else {
                        wrapElement(document, elements, "level2");
                    } i++;
                }

                const alphaText = document.querySelectorAll("ol[type='a']");
                for (const elements of alphaText) {
                    let alpha = 'a';
                    for (const element of elements.childNodes) {
                        if (element.tagName == "LI" && element.style.listStyle != 'none') {
                            let texts = element.innerHTML;
                            element.outerHTML = element.outerHTML.replace(element.innerHTML, "<span>" + alpha + ". </span>" + texts);
                            alpha = getNextChar(alpha);
                        } else if (element.tagName == "LI" && element.style.listStyle == 'none') {
                            alpha = getNextChar(alpha);
                        }
                    }
                }

                const numeric = document.querySelector('li > ol:not([type])');
                let n = 1;
                for (const element of numeric.childNodes) {
                    if (element.tagName == 'LI') {
                        let texts = element.innerHTML;
                        element.outerHTML = element.outerHTML.replace(element.innerHTML, "<span>" + n + ". </span>" + texts);
                        n++;
                    }
                }
                // wrapElement(document, level3Element, "level3");
                // wrapElement(document, level4Element, "level4");
                // wrapElement(document, level5Element, "level5");
                // wrapElement(document, level6Element, "level6");
                // wrapElement(document, level7Element, "level7");
                // wrapElement(document, level8Element, "level8");
                // wrapElement(document, level9Element, "level9");
                // wrapElement(document, footnoteElement, "footnote");

                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll(".half_width_column, #cs_control_245422, a[href='#top'], a[href='#Top']"), function (node) { node.remove(); });

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