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
            await page.waitForSelector(".text-con");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelector("#hlLawName");
                wrapElement(document, level1Element, "level1");
                const issueDate = document.querySelector("#trLNNDate>td");
                wrapElementDate(document, "issue-date", issueDate.textContent + "T00:00:00");
                // ################
                // # content:info #
                // ################
                const content = document.querySelectorAll(".text-con")[0];
                wrapElement(document, content, "ease-content");


               const level2Elements = document.querySelectorAll(".char-2 ");
               wrapElements(document, level2Elements, "level2");


               const level3Elements = document.querySelectorAll(".col-no ");
               wrapElements(document, level3Elements, "level3");
               
               // removing unwanted content from ease-content
               Array.prototype.forEach.call(document.querySelectorAll("#LawMenu,.label-eng"), function (node) { node.remove(); });
                

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