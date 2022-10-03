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
            await page.waitForSelector(".single-ta3n");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############

                // TODO:
                const level1Element = document.querySelector(".single-ta3n div >div >.judgment_text>p:nth-child(2)");
                wrapElement(document, level1Element, "level1");
        
                wrapElementDate(document, "issue-date", "2006-09-17" + "T00:00:00");
               // wrapElementDate(document, "effective-date", "2020-03-04" + "T00:00:00");
                // ################
                // # content:info #
                // ################

                // TODO:
                const content = document.querySelectorAll(".single-ta3n")[0];
                wrapElement(document, content, "ease-content");
            Array.prototype.forEach.call(document.querySelectorAll(".single-ta3n>.custom-share"), function (node) { node.remove(); });
            Array.prototype.forEach.call(document.querySelectorAll(".single-ta3n>button"), function (node) { node.remove(); });
            Array.prototype.forEach.call(document.querySelectorAll(".single-ta3n table"), function (node) { node.remove(); });

                const level3lements = document.querySelectorAll("div >div >div>p>b");
                for (const level3Element of level3lements) {
                    if (level3Element.textContent.match(/المادة/)) {
                        wrapElement(document, level3Element, "level2");
                    }  
                }

                const level2lements = document.querySelectorAll("div >div >div>p>b");
                for (const level2Element of level2lements) {
                    if (level2Element.textContent.match(/الفصل/)) {
                        wrapElement(document, level2Element, "level2");
                    }  
                }

                const level4lements = document.querySelectorAll("div >div >div>p>b");
                for (const level4Element of level4lements) {
                    if (level4Element.textContent.match(/مادة +[٢٨٣٩١٣٤٧٦٥٧]/)) {
                        wrapElement(document, level4Element, "level3");
                    }  
                }

              

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