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
            await page.waitForSelector(".bluetextcontent");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############

                // TODO:
                const level1Element = document.querySelector(".bluetextcontent > tbody > tr > td > div > table > tbody > tr >  .noticeshead");
                wrapElement(document, level1Element, "level1");
        
               wrapElementDate(document, "issue-date", "2022-08-12" + "T00:00:00");
                // wrapElementDate(document, "effective-date", "2022-02-08" + "T00:00:00");
                // ################
                // # content:info #
                // ################

                // TODO:
                const content = document.querySelectorAll(".bluetextcontent")[0];
                wrapElement(document, content, "ease-content");
               // Array.prototype.forEach.call(document.querySelectorAll("#MainConent_pnlHtmlControls > div > .WordSection2"), function (node) { node.remove(); });

               const level2Element = document.querySelector(".bluetextcontent > tbody > tr > td > div > table > tbody > tr:nth-child(6) > td > table > tbody > tr:nth-child(9)");
               wrapElement(document, level2Element, "level2");
                // removing unwanted content from ease-content
             
             Array.prototype.forEach.call(document.querySelectorAll(".bluetextcontent > tbody > tr > td > div > table > tbody > tr:nth-child(3)"), function (node) { node.remove(); });
             Array.prototype.forEach.call(document.querySelectorAll(".bluetextcontent > tbody > tr > td > div > table > tbody > tr > .footerbox"), function (node) { node.remove(); });
             Array.prototype.forEach.call(document.querySelectorAll(".bluetextcontent > tbody > tr:first-of-type"), function (node) { node.remove(); });
                // TODO:

                return Promise.resolve();
            });
            // 4.Write
            await base.writePage(page, url, sp, path, true, true);
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