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
            await page.waitForSelector(".fragview");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############

                //remove visibility hidden
                document.body.removeAttribute("style");
                document.body.setAttribute("style", "visibility:visible; position: relative;")

                const level1Element = document.querySelectorAll(".slTitle")[0];
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2002-05-20" + "T00:00:00");
                // ################e
                // # content:info #
                // ################
                const content = document.querySelectorAll(".fragview")[0];
                wrapElement(document, content, "ease-content");

                
                const level2Element = document.querySelectorAll(".prov1Hdr");
                wrapElements(document, level2Element, "level2");


                const level3Elements = document.querySelectorAll(".prov1Txt>strong");
                wrapElements(document, level3Elements, "level3");


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