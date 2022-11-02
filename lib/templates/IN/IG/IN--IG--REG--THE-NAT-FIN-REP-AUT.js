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
            await base.downloadPage(page, url, sp, path, null, 'utf16le');
            // 2.Identify
            // 3.Wrap
            await page.waitForSelector("body");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = "The National Financial Reporting Authority (Manner of Appointment and other Terms and Conditions of Service of Chairperson and Members) Rules, 2018 dated 21.03.2018.";
                wrapElementLevel1(document, level1Element);
                wrapElementDate(document, "issue-date", "2018-03-21" + "T00:00:00");
                // ################     
                // # content:info #
                // ################
                const content = document.querySelector("body");
                wrapElement(document, content, "ease-content");


                const level2Elements = document.querySelectorAll("h1");
                wrapElements(document, level2Elements, "level2");


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