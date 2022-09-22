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
            await page.waitForSelector("#fulltext_content_area");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############

                // TODO:
                const level1Element = document.querySelector("#metadata_content_area>h1");
                wrapElement(document, level1Element, "level1");
        
                wrapElementDate(document, "issue-date", "2022-05-31" + "T00:00:00");
              //  wrapElementDate(document, "effective-date", "2015-04-29" + "T00:00:00");
                // ################
                // # content:info #
                // ################

                // TODO:
                const content = document.querySelectorAll("#fulltext_content_area")[0];
                wrapElement(document, content, "ease-content");
               Array.prototype.forEach.call(document.querySelectorAll("#fulltext_content_area > .footnotes > div > a"), function (node) { node.remove(); });
               Array.prototype.forEach.call(document.querySelectorAll("#fulltext_content_area > .signature-wrapper"), function (node) { node.remove(); });
               Array.prototype.forEach.call(document.querySelectorAll("#fulltext_content_area > .further-info-wrapper"), function (node) { node.remove(); });
               Array.prototype.forEach.call(document.querySelectorAll("#fulltext_content_area > .preamble-wrapper"), function (node) { node.remove(); });
               Array.prototype.forEach.call(document.querySelectorAll("#fulltext_content_area > .supplemental-info-wrapper"), function (node) { node.remove(); });
               Array.prototype.forEach.call(document.querySelectorAll("#fulltext_content_area >p> .printed-page-wrapper"), function (node) { node.remove(); });
               Array.prototype.forEach.call(document.querySelectorAll("#fulltext_content_area > .preamble-wrapper"), function (node) { node.remove(); });

                const level2Elements = document.querySelectorAll('#fulltext_content_area > h1');
               wrapElements(document, level2Elements, 'level2');

            //    const footnote = document.querySelectorAll('.footnotes');
            //    wrapElements(document, footnote, 'footnote');


  

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