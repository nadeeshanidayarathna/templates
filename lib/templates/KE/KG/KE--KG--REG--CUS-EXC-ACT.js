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
            await page.waitForSelector(".act");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                // const level1Element = document.querySelector('.act-title');
                wrapElementLevel1(document, "Customs and Excise Act");
                wrapElementDate(document, "issue-date", "1978-09-25" + "T00:00:00");
                wrapElementDate(document, "effective-date", "1978-10-13" + "T00:00:00");
                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('.act');
                wrapElement(document, contentElement, "ease-content");

                const level2Elements = document.querySelectorAll('.hcontainer > p');
                for (const level2Element of level2Elements) {
                    if (level2Element.textContent.match('SCHEDULE')) {
                        wrapElement(document, level2Element, 'level2');
                    }
                }

                const level3Element = document.querySelectorAll('.heading-part');
                wrapElements(document, level3Element, "level3");

                const level4Elements = document.querySelectorAll('.num');
                for (const level4Element of level4Elements) {
                    if (/\d[A-Z]*\./.test(level4Element.textContent.trim())) {
                        wrapElement(document, level4Element, 'level4');
                    } else if (/159[A-Z]*\.?/.test(level4Element.textContent.trim())) {
                        wrapElement(document, level4Element, 'level4');
                    } else if (/^\d+/.test(level4Element.textContent.trim())) {
                        wrapElement(document, level4Element, 'level4');
                    }
                }

                const elements1 = document.querySelectorAll('tr')[1938];
                const level4title = /.*32.*33\./s.exec(elements1.textContent);
                const level4Text = elements1.textContent.replace(level4title, "");
                elements1.outerHTML = elements1.outerHTML.replace(elements1.innerHTML, "<div class=\"level4\" title=\"level4\">" + level4title + "</div><p>" + level4Text + "</p>");
                // console.log(level4title[1] + 'hello')
                // let level4title1 = /32.*33\./s.exec(level4texts1.outerHTML);
                // level4texts1.outerHTML = level4texts1.outerHTML.replace(level4title1, "<div class=\"level4\" title=\"level4\">" + level4title1 + "</div></div><div>");
                // console.log(level4texts1.outerHTML)
                const elements2 = document.querySelectorAll

                const level5Elements = document.querySelectorAll('.hcontainer > .content > p');
                for (const level5Element of level5Elements) {
                    if (level5Element.textContent.match(/^\(APPENDIX A\)/)) {
                        wrapElement(document, level5Element, 'level5');
                    }
                }
                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll(".act > table:first-of-type  img, .subleg, #preamble"), function (node) { node.remove(); });

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