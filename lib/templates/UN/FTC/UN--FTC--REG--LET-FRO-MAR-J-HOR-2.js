const { group } = require("yargs");
const base = require("../../../common/base");
const scraper = async function download(url, sp, path) {
    try {
        console.log("callings scraper url:" + url + " sp:" + sp + " path:" + path);
        const browser = await base.puppeteer().launch({
            headless: false,
            devtools: false,
        });
        {
            // 1.Download
            console.log("getting url:" + url);
            const page = await browser.newPage();
            await base.downloadPage(page, url, sp, path, null, 'utf16le');
            // 2.Identify
            // 3.Wrap
            await page.waitForSelector(".WordSection1");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Text = "Letter from Mark J. Horoshak to Martin J. Thompson, dated 06/20/91";
                wrapElementLevel1(document, level1Text);
                wrapElementDate(document, "issue-date", "1991-06-20" + "T00:00:00");
                // ################
                // # content:info #
                // ################
                const content = document.querySelector(".WordSection1");
                wrapElement(document, content, "ease-content");


                const forFootnoteElements = document.querySelectorAll(".fn");
                wrapElements(document, forFootnoteElements, "footnote");


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