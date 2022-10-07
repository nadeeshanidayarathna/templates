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
            await page.waitForSelector("#HTA2");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelectorAll("h2>strong")[0]
                const level1Text = "Nasdaq Futures, Inc. Rulebook - Reference Guides & Alerts - " + level1Element.textContent;
                wrapElementLevel1(document, level1Text, "level1");
                wrapElementDate(document, "issue-date", "2009-11-06" + "T00:00:00");
                // ################e
                // # content:info #
                // ################
                const content = document.querySelectorAll("#HTA2")[0];
                wrapElement(document, content, "ease-content");


                const level2Element = document.querySelectorAll("#HTA2>#NewsHeader>h2")[0].childNodes[4];
                wrapElement(document, level2Element, "level2");

                
                const level3Elements = document.querySelectorAll("h3");
                wrapElements(document, level3Elements, "level3");


                //fixing list items in the transform
                const listItems = document.querySelectorAll("li");
                for (const contentChild of listItems) {
                    contentChild.outerHTML = "<div>&bull; " + contentChild.outerHTML + "</div>";
                }


                // removing unwanted content from ease-content    
                Array.prototype.forEach.call(document.querySelectorAll(".newscontentbox,.footnote2"), function (node) { node.remove(); });


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