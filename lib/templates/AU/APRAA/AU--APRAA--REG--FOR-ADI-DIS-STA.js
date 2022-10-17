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
            await page.waitForSelector(".WordSection1");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Elements = document.querySelectorAll(".MsoNormal>b");
                const level1Text = level1Elements[0].textContent + " " + level1Elements[1].textContent
                wrapElementLevel1(document, level1Text);
                wrapElementDate(document, "issue-date", "2019-11-06" + "T00:00:00");
                wrapElementDate(document, "effective-date", "2020-03-01" + "T00:00:00");
                // ################
                // # content:info #
                // ################
                const content = document.querySelector(".WordSection1");
                wrapElement(document, content, "ease-content");


                const level2Element = document.querySelectorAll(".IH,.AS");
                wrapElements(document, level2Element, "level2");


                // removing unwanted content from ease-content    
                Array.prototype.forEach.call(document.querySelectorAll("img,.MsoNormal>b"), function (node) { node.remove(); });


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