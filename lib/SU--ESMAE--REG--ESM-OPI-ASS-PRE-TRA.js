const { group } = require("yargs");
const base = require("./common/base");

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
            await page.waitForSelector("body");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############

                // TODO:
                const rootTitle = document.querySelectorAll("h1")[0];
                wrapElement(document, rootTitle, "level1");
                wrapElementDate(document, "issue-date", "2022-03-23T00:00:00");

                // ################
                // # content:info #
                // ################

                var levelNo = 3;

                const content = document.querySelectorAll("body")[0];
                wrapElement(document, content, "ease-content");

                // const contents = document.querySelectorAll(".WordSection1")[0];
                // for(const childs of contents.childNodes){
                //     if(childs.localName = "h2"){
                //         wrapElement(document, childs, "level2");
                //     }
                // }

                const contentL2 = document.querySelectorAll("h2");
                wrapElements(document, contentL2, "level2", group = false);

                const contentL3 = document.querySelectorAll("h3");
                wrapElements(document, contentL3, "level3", group = false);

                const contentL4 = document.querySelectorAll("h4");
                wrapElements(document, contentL4, "level4", group = false);

                const contentL5 = document.querySelectorAll("h5");
                wrapElements(document, contentL5, "level5", group = false);

                const footnoteElement = document.querySelectorAll(".MsoFootnoteText");
                wrapElements(document, footnoteElement, "footnote", group = false);

                // removing unwanted content from ease-content
                //Array.prototype.forEach.call(document.querySelectorAll("h2")[3], function (node) { node.remove(); });

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