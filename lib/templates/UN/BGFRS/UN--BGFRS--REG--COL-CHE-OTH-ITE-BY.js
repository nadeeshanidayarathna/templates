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
            await page.waitForSelector(".metadata-content-area");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelector(".metadata-content-area h1");
                wrapElement(document, level1Element, "level1");
                const effectiveDateElement = document.querySelectorAll('#p-4')[0];
                let fullText = effectiveDateElement.textContent
                        let check = (fullText.indexOf(" ") + 1)
                        let part2 = fullText.substring(check, fullText.length);
                        const dateFormat = (new Date(part2).toLocaleDateString('fr-CA'));
                        //wrapElementDate(document, "effective-date", "2022-07-01" + "T00:00:00");
            
                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('.doc-content-area');
                wrapElement(document, contentElement, "ease-content");

                const level2Elements = document.querySelectorAll(".doc-content-area h1");
                wrapElements(document, level2Elements, "level2");

                const level3Elements = document.querySelectorAll('.doc-content-area h2');
                wrapElements(document, level3Elements, "level3");

                const level4Elements = document.querySelectorAll('.doc-content-area h3');
                wrapElements(document, level4Elements, "level4");

                const level5Elements = document.querySelectorAll('.doc-content-area h4');
                wrapElements(document, level5Elements, "level5");

                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll(".end-matter, .printed-page, .text"), function (node) { node.remove(); });
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