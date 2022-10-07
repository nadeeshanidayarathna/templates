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
            await page.waitForSelector(".act-content");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelectorAll("td[valign=top]>p")[1];
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2007-11-01" + "T00:00:00");
                // ################e
                // # content:info #
                // ################
                const content = document.querySelectorAll(".act-content")[0];
                wrapElement(document, content, "ease-content");


                var level2Elements = Array.from(document.querySelectorAll("p>i"));
                level2Elements = level2Elements.slice(3,5);
                wrapElements(document, level2Elements, "level2");

                const level2Elements2 = document.querySelectorAll("td>p");
                for(const contentChild of level2Elements2){
                    if(contentChild.textContent.startsWith("\nEXPLANATORY")){
                    wrapElement(document, contentChild, "level2");
                }
                }


                const forFootnoteElements = Array.from(level2Elements2);
                wrapElement(document, forFootnoteElements[forFootnoteElements.length-1], "footnote");


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