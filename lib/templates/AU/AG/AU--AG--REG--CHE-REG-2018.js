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
            await page.waitForSelector("#MainContent_pnlHtmlControls");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############

                // TODO:
                var images = document.querySelectorAll("img");
                images.forEach(e => {
                    e.src = e.src;
                })
                const level1Element = document.querySelector(".ShortT");
                wrapElement(document, level1Element, "level1");

                wrapElementDate(document, "issue-date", "2018-03-07" + "T00:00:00");
                wrapElementDate(document, "effective-date", "2018-03-08" + "T00:00:00");
                // ################
                // # content:info #
                // ################

                // TODO:
                const content = document.querySelectorAll("#MainContent_pnlHtmlControls")[0];
                wrapElement(document, content, "ease-content");
                Array.prototype.forEach.call(document.querySelectorAll("#MainContent_pnlHtmlControls>div > .WordSection1 >p img"), function (node) { node.remove(); });
                Array.prototype.forEach.call(document.querySelectorAll("#MainContent_pnlHtmlControls>div > .WordSection2"), function (node) { node.remove(); });


                const level2Elements = document.querySelectorAll('.ActHead2');
                wrapElements(document, level2Elements, 'level2');

                const level21Elements = document.querySelectorAll('.ActHead1');
                wrapElements(document, level21Elements, 'level2');

                const level22Elements = document.querySelectorAll('.ActHead6');
                wrapElements(document, level22Elements, 'level2');


                const level3Elements = document.querySelectorAll('.ActHead3');
                wrapElements(document, level3Elements, 'level3');

                const level4Elements = document.querySelectorAll('.ActHead5');
                wrapElements(document, level4Elements, 'level4');



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