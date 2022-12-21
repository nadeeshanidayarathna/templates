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
            await page.waitForSelector("#fgzw_right");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelectorAll("div[align='center'] > strong")[0];
                wrapElement(document, level1Element, "level1");
                const issueDates = document.querySelector('#tdat');
                const issueDateText = /\d+$/.exec(issueDates.textContent.trim());
                const issueDate = issueDateText[0].slice(0,4) + "-" + issueDateText[0].slice(4,6) + "-" + issueDateText[0].slice(6,8);
                wrapElementDate(document, "issue-date", issueDate + "T00:00:00");
                const effectiveDateText = /\d+$/.exec(issueDates.nextElementSibling.textContent.trim());
                const effectiveDate = effectiveDateText[0].slice(0,4) + "-" + effectiveDateText[0].slice(4,6) + "-" + effectiveDateText[0].slice(6,8);
                wrapElementDate(document, "effective-date", effectiveDate + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('#fgzw_right');
                wrapElement(document, contentElement, "ease-content");

                const level2Element = document.querySelectorAll("div[align='center'] > strong");
                for (const elements of level2Element) {
                    if (elements.textContent.trim().match(/^第\W章/)) {
                        wrapElement(document, elements, "level2");
                    }
                }

                const level3Element = document.querySelectorAll("b");
                for (const elements of level3Element) {
                    if (elements.textContent.trim().match(/^第\W+条/)) {
                        wrapElement(document, elements, "level3");
                    }
                }

                const level3Elements = document.querySelector(".zhengwen");
                let title = [];
                for (const elements of level3Elements.childNodes) {
                    if (elements.textContent.trim().match(/^第\W+条/) && elements.nodeType == 3) {
                        let titles = /^第\W+条/.exec(elements.textContent.trim());
                        level3Elements.innerHTML = level3Elements.innerHTML.replace(titles, "<div class=\"level3\" title=\"level3\">" + titles + "</div>");
                    }
                }

                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll(".xlpx2_right0"), function (node) { node.remove(); });
                return Promise.resolve();
            });
            // 4.Write
            await base.writePage(page, url, sp, path, true, true, true);
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