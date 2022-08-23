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
            await page.waitForSelector(".c43");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############

                const level1Element = document.querySelectorAll('h1')[0];
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2022-03-24" + "T00:00:00");

                // ################
                // # content:info #
                // ################

                const contentElement = document.querySelectorAll('.c43')[0];
                wrapElement(document, contentElement, "ease-content");

                const level2Element = document.querySelectorAll('h1')[1];
                wrapElement(document, level2Element, "level2");

                const h2Elements = document.querySelectorAll('h2');
                const h3Elements = document.querySelectorAll('h3');

                let level2Elements = [h2Elements[0], h2Elements[1]];
                wrapElements(document, level2Elements, "level2", group = false);

                let level3Elements = [h2Elements[2], h2Elements[3], h3Elements[0], h3Elements[1]];
                wrapElements(document, level3Elements, "level3", group = false);

                let level4Element = [h3Elements[2], h3Elements[3], h3Elements[4]];
                wrapElements(document, level4Element, "level4", group = false);

                const footNotes = document.querySelectorAll(".footer");
                wrapElements(document, footNotes, "footnote", group=false);

                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll(".c117"), function (node) { node.remove(); });
               
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