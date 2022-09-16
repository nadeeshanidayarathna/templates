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
            await base.downloadPage(page, url, sp, path, null , encoding = 'utf16le');

            // 2.Identify
            // 3.Wrap
            await page.waitForSelector(".WordSection1");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############

                // TODO:
                const level1Element = document.querySelector("h6");
                wrapElement(document, level1Element, "level1");
                  
                wrapElementDate(document, "issue-date", "2022-07-08" + "T00:00:00");
                // ################
                // # content:info #
                // ################

                // TODO:
                const content = document.querySelector("body");
                wrapElement(document, content, "ease-content");

               const level2Element = document.querySelectorAll("h1");
               wrapElements(document, level2Element, "level2");

               const level3Element = document.querySelectorAll("h2");
               wrapElements(document, level3Element, "level3");

               const level3Elements = document.querySelectorAll("h3");
               wrapElements(document, level3Elements, "level3");

               const level4Elements = document.querySelectorAll("h4");
               wrapElements(document, level4Elements, "level4");

               const level4Elementz = document.querySelectorAll(".class5");
               wrapElements(document, level4Elementz, "level4");

               const level5Elements = document.querySelectorAll("h5");
               wrapElements(document, level5Elements, "level5");

               const footnoteElement = document.querySelectorAll(".footnotedescription");
               wrapElements(document, footnoteElement, "footnote");

               const footnoteElements = document.querySelectorAll(".MsoFootnoteText");
               wrapElements(document, footnoteElements, "footnote");


                return Promise.resolve();
            });
            // 4.Write
            await base.writePage(page, url, sp, path, true, false, false);
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