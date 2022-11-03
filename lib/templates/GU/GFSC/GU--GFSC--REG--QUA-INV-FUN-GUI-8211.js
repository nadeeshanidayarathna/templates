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
            await page.waitForSelector(".WordSection1");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############

                const level1Element = document.querySelector('h6');
                wrapElement(document, level1Element, "level1");

                // ################
                // # content:info #
                // ################

                const content = document.querySelector(".WordSection1");
                wrapElement(document, content, "ease-content");

                const contentL2 = document.querySelectorAll("h2");
                wrapElements(document, contentL2, "level2");

                const contentL3 = document.querySelectorAll("h3");
                wrapElements(document, contentL3, "level3");

                const contentL4 = document.querySelectorAll(".cc8");
                wrapElements(document, contentL4, "level4");

                const contentL4N = document.querySelectorAll("h4");
                wrapElements(document, contentL4N, "level4");

                const contentL5 = document.querySelectorAll(".cc81");
                wrapElements(document, contentL5, "level5");


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