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
            await page.waitForSelector("div.row > div.col-md-offset-2");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelectorAll('article > div > span:nth-of-type(1), article > div > span:nth-of-type(2)');
                wrapElementLevel1(document, level1Element[0].textContent + " " + level1Element[1].textContent + " " + level1Element[2].textContent);
                level1Element[0].remove(); level1Element[1].remove(); level1Element[2].remove();
                const dates = document.querySelector('.text-muted');
                wrapElementDate(document, "issue-date", dates.textContent + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('div.row > div.col-md-offset-2');
                wrapElement(document, contentElement, "ease-content");

                const level2Element = document.querySelector('article > div:last-of-type');
                let titleText = [];
                for (const elements of level2Element.childNodes) {
                    if (elements.textContent.trim().match(/^[A-Z]+\:$/)) {
                        wrapElement(document, elements, "level2");
                    } else if (elements.textContent.trim().match(/^TÍTULO\s[A-Z]+/)) {
                        wrapElement(document, elements, "level3");
                    } else if (elements.textContent.trim().match(/^ART.+\.\s?-/)) {
                        let titles = /^ART.+\.\s?-/.exec(elements.textContent.trim());
                        titleText.push(titles[0]);
                    } 
                }

                for (const elements of titleText) {
                    level2Element.innerHTML = level2Element.innerHTML.replace(elements, `<div class=\"level4\" title=\"level4\"> ${elements} </div>`);
                }

                const level2Elements = document.querySelector('article > div > div > div');
                for (const elements of level2Elements.childNodes) {
                    if (elements.textContent.trim().match(/^ANEXO/)) {
                        wrapElement(document, elements, "level2");
                    }
                }

                const textArr = document.querySelectorAll('article > div');
                for (const elements of textArr) {
                    elements.innerHTML = elements.innerHTML.replace(/<br>/g , "<p>");
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