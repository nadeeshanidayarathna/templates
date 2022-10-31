const { group } = require("yargs");
const base = require("../../../common/base");
const scraper = async function download(url, sp, path) {
    try {
        console.log("callings scraper url:" + url + " sp:" + sp + " path:" + path);
        const browser = await base.puppeteer().launch({
            headless: false,
            devtools: false,
            ignoreHTTPSErrors: true
        });
        {
            // 1.Download
            console.log("getting url:" + url);
            const page = await browser.newPage();
            await base.downloadPage(page, url, sp, path);
            // 2.Identify
            // 3.Wrap
            await page.waitForSelector("#full");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Elements = document.querySelectorAll("h2")[0];
                wrapElement(document, level1Elements, "level1");
                wrapElementDate(document, "issue-date", "2009-11-05" + "T00:00:00");
                wrapElementDate(document, "effective-date", "2011-01-01" + "T00:00:00");
                // ################
                // # content:info #
                // ################
                const content = document.querySelector("#full");
                wrapElement(document, content, "ease-content");


                const level2Element = document.querySelectorAll(".tb-na16");
                wrapElements(document, level2Element, "level2");


                const level3Element = document.querySelectorAll(".t-12-9-sred");
                wrapElements(document, level3Element, "level3");


                var level4Element = Array.from(document.querySelectorAll(".t-11-9-sred"));
                var level3Element2 = level4Element.splice(13,1)
                wrapElements(document, level4Element, "level4");
                wrapElements(document, level3Element2, "level3");


                const level5Element = document.querySelectorAll(".t-10-9-sred");
                wrapElements(document, level5Element, "level5");


                const level6Element = document.querySelectorAll(".t-10-9-kurz-s");
                for(contentChild of level6Element){
                    if(contentChild.nextElementSibling.className.includes('clanak-')){
                    wrapElements(document, [contentChild, contentChild.nextElementSibling], "level6",group=true);
                    }
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