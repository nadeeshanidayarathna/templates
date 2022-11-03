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
            await page.waitForSelector("section > .row");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Elements = document.querySelectorAll('article > div > span');
                wrapElementLevel1(document, level1Elements[1].textContent + " " + level1Elements[2].textContent);
                level1Elements[1].remove();
                level1Elements[2].remove();
                wrapElementDate(document, "issue-date", "2022-05-27" + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('section > .row');
                wrapElement(document, contentElement, "ease-content");

                const level2Element = document.querySelector('article > div');
                let titleText = [];
                for (const elements of level2Element.childNodes) {
                    if (elements.textContent.trim().match(/^[A-Z]+:$/)) {
                        wrapElement(document, elements, "level2");
                    } else if (elements.textContent.trim().match(/^ART\W*\w*\s\d\W\.-*/)) {
                        let titles = /^ART\W*\w*\s\d\W\.-*/.exec(elements.textContent.trim());
                        titleText.push(titles[0]);
                    }
                }

                for (elements of titleText) {
                    level2Element.innerHTML = level2Element.innerHTML.replace(elements, "<div class=\"level3\" title=\"level3\">" + elements + "</div>");
                }

                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll(".m-t-4"), function (node) { node.remove(); });

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