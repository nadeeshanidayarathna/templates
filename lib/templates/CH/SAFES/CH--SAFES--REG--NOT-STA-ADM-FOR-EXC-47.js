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
            await page.waitForSelector(".detail_con");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############

                // TODO:
                const level1Element = document.querySelectorAll(".detail_tit")[0];
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2003-01-06" + "T00:00:00");
                // wrapElementDate(document, "effective-date", "2022-02-08" + "T00:00:00");
                // ################
                // # content:info #
                // ################

                // TODO:
                const content = document.querySelectorAll(".detail_con")[0];
                wrapElement(document, content, "ease-content");

                var parserRules = [
                    { pattern: /\s*([一二三四]、)(.*)/g, replacement: '<p class="number">$1</p><p>$2</p>' }
                  ];
                  
                document.querySelectorAll('p').forEach(function(tag) {
                    var inner = tag.innerHTML;
                    parserRules.forEach(function(rule) {
                      inner = inner.replace(rule.pattern, rule.replacement);
                    });
                    tag.innerHTML = inner;
                  });  
                const level2Element = document.querySelectorAll(".number");
                wrapElements(document, level2Element, "level2");

          
                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll(".list_mtit"), function (node) { node.remove(); });
                Array.prototype.forEach.call(document.querySelectorAll(".detail_gn"), function (node) { node.remove(); });
                // TODO:

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