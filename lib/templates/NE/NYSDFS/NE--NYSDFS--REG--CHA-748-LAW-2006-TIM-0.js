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
            await page.waitForSelector(".page-body");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelectorAll("td>p")[1];
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2007-01-31" + "T00:00:00");
                // ################
                // # content:info #
                // ################
                const content = document.querySelectorAll(".page-body")[0];
                wrapElement(document, content, "ease-content");


               const level2Element = Array.from(document.querySelectorAll(".tcenter"));
               const level3Element = level2Element.splice(2, 1);//remove level3 element and keep it for level 3
               level2Element.splice(3, 1);//remove unwanted element
               wrapElements(document, level2Element, "level2");


               const level3Elements = document.querySelectorAll(".underb");
               wrapElements(document, level3Elements, "level3");
               wrapElements(document, level3Element, "level3");//uses the previousely kept level 3 element

               
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