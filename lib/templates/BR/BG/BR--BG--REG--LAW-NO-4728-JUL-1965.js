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
            await page.waitForSelector("body");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelectorAll('p > a small, body > table tr > td:nth-of-type(2) > p')
                wrapElementLevel1(document, level1Element[0].textContent + " " + level1Element[1].textContent);
                wrapElementDate(document, "issue-date", "1965-07-14" + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('body');
                wrapElement(document, contentElement, "ease-content");

                const level2Element = document.querySelectorAll("p[align='center']");
                let i = 0;
                for (const elements of level2Element) {
                    if (elements.textContent.trim().match(/^Se.+[A-Z]$|^SE.+[A-Z]$/)) {
                        let element = [elements, level2Element[i+1]];
                        wrapElements(document, element, "level2", group =true);
                    }i++;
                }

                const level2Elements = document.querySelector("blockquote > p[align='center'] > font > b");
                wrapElement(document, level2Elements, "level2");

                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll("img"), function (node) { node.remove(); });

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