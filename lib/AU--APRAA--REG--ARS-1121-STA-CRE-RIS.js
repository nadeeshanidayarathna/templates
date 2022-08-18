const { group } = require("yargs");
const base = require("./common/base");

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
            await page.waitForSelector(".right");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const rootTitle = "ARS 112.1 Standardised Credit Risk – On-balance Sheet Assets (applies to both Level 1 & Level 2 forms)";
                wrapElementLevel1(document, rootTitle);

                const DateElements = document.querySelectorAll('p');
                for (const DateElement of DateElements) {
                    if (DateElement.textContent.trim().startsWith('Dated:')) {
                        let fullText = DateElement.textContent;
                        let check = (fullText.indexOf(":") + 1)
                        let part2 = fullText.substring(check, fullText.length);
                        const dateFormat = (new Date(part2).toLocaleDateString('fr-CA'));
                        wrapElementDate(document, "issue-date", dateFormat + "T00:00:00");
                    }
                }

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector(".right");
                wrapElement(document, contentElement, "ease-content");

                const level2Elements = document.querySelectorAll('b>span');
                for (const level2Element of level2Elements) {
                    if (level2Element.textContent.trim().startsWith('Schedule')) {
                        wrapElement(document, level2Element, "level2");
                    }
                }
                const footnoteElement = document.querySelectorAll('.MsoFootnoteText');
                wrapElements(document, footnoteElement, "footnote", group = false);

                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll("span>img"), function (node) { node.remove(); });
                Array.prototype.forEach.call(document.querySelectorAll("h2>img"), function (node) { node.remove(); });

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