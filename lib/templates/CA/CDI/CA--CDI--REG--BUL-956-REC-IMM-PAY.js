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

                // TODO:
                const level1Element = document.querySelector(".add_maincontent_padding >h1");
                wrapElement(document, level1Element, "level1");
        
                wrapElementDate(document, "issue-date", "1995-06-01" + "T00:00:00");
              //  wrapElementDate(document, "effective-date", "2015-04-29" + "T00:00:00");
                // ################
                // # content:info #
                // ################

                // TODO:
                const content = document.querySelectorAll("body")[0];
                wrapElement(document, content, "ease-content");
           Array.prototype.forEach.call(document.querySelectorAll(".add_maincontent_padding >.half_width_column"), function (node) { node.remove(); });
           Array.prototype.forEach.call(document.querySelectorAll(".add_maincontent_padding >#cs_control_245422"), function (node) { node.remove(); });
           Array.prototype.forEach.call(document.querySelectorAll(".add_maincontent_padding >.cleaner"), function (node) { node.remove(); });
           Array.prototype.forEach.call(document.querySelectorAll(".add_maincontent_padding  .backToTop"), function (node) { node.remove(); });
           Array.prototype.forEach.call(document.querySelectorAll("header"), function (node) { node.remove(); });
           Array.prototype.forEach.call(document.querySelectorAll(".content_right_column"), function (node) { node.remove(); });
           Array.prototype.forEach.call(document.querySelectorAll("footer"), function (node) { node.remove(); });


              
        
            //    const level3Elements = document.querySelectorAll('h3');
            //    wrapElements(document, level3Elements, 'level3');


                // removing unwanted content from ease-content
             
               // Array.prototype.forEach.call(document.querySelectorAll(".detail_gn"), function (node) { node.remove(); });
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