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
            await page.waitForSelector(".tabContent");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                var level1Elements = Array.from(document.querySelectorAll(".title-doc-first")).slice(0,3);
                level1Text = level1Elements[0].textContent +" "+ level1Elements[1].textContent  +" "+ level1Elements[2].textContent;
                wrapElementLevel1(document, level1Text);
                Array.prototype.forEach.call(level1Elements, function (node) { node.remove(); });
                wrapElementDate(document, "issue-date", "2010-10-20" + "T00:00:00");
                // ################
                // # content:info #
                // ################
                const content = document.querySelectorAll(".tabContent")[0];
                wrapElement(document, content, "ease-content");


                const level2Elements = document.querySelectorAll(".title-article-norm");
                const level2SubElements = document.querySelectorAll(".stitle-article-norm");
                for (var i =0;i<level2Elements.length;i++) {
                    wrapElements(document, [level2Elements[i],level2SubElements[i]], "level2", group = true);
                }
                
                const level2Element = document.querySelectorAll(".title-annex-1");
                wrapElements(document, level2Element, "level2");


                // removing unwanted content from ease-content    
                Array.prototype.forEach.call(document.querySelectorAll(".arrow,.modref,.linkToTop"), function (node) { node.remove(); });


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