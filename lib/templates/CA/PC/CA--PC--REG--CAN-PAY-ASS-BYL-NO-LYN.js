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
            await page.waitForSelector(".col-md-9");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############

                // TODO:
                const level1Element = document.querySelectorAll(".Title-of-Act")[0];
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2022-06-01" + "T00:00:00"); 
                // ################
                // # content:info #
                // ################

                // TODO:
                const content = document.querySelectorAll(".col-md-9")[0];
                wrapElement(document, content, "ease-content");

                $(".col-md-9 > div > div > section > h2 .HLabel1 ").after('<span class="spanClass"> </span>');


                Array.prototype.forEach.call(document.querySelectorAll(".legisHeader"), function (node) { node.remove(); });
                Array.prototype.forEach.call(document.querySelectorAll(".FCSelector"), function (node) { node.remove(); });
                Array.prototype.forEach.call(document.querySelectorAll(".col-md-9 > div > div > section > dl > dt"), function (node) { node.remove(); });
                Array.prototype.forEach.call(document.querySelectorAll(".col-md-9 > div > div > section > .MarginalNote > span"), function (node) { node.remove(); });
                Array.prototype.forEach.call(document.querySelectorAll(".wb-invisible"), function (node) { node.remove(); });

  
                 const level2Elements1 = document.querySelectorAll(".col-md-9 > div > div > section > h2");
                wrapElements(document, level2Elements1, "level2");
 
                const level2Elements4 = document.querySelectorAll(".col-md-9 > div > div > section > h3");
                wrapElements(document, level2Elements4, "level3");

                const level2Elements3 = document.querySelectorAll(".col-md-9 > div > div > section > .MarginalNote");
                wrapElements(document, level2Elements3, "level4");

                const forFootnoteElements = document.querySelectorAll("p.Footnote");
                for(const footNote of forFootnoteElements){
                    wrapElement(document, footNote, "footnote"); 
                }
 
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