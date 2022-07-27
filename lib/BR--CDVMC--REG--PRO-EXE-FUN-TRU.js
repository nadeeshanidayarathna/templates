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
            await page.waitForSelector(".WordSection1");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############

                // TODO:
                const rootTitle = document.querySelectorAll(".c110")[0];
                wrapElement(document, rootTitle, "level1");
                wrapElementDate(document, "issue-date", "2016-12-20T00:00:00");

                // ################
                // # content:info #
                // ################

                var levelNo = 3;

                const content = document.querySelectorAll(".WordSection1")[0];
                wrapElement(document, content, "ease-content");

                const contents = document.querySelectorAll(".WordSection1")[0];
                for(const contentChild of contents.childNodes){
                    if(contentChild.localName == "h1"){
                        wrapElement(document, contentChild, "level2");
                        levelNo = 3;
                    } else if(contentChild.localName == "h2"){
                        wrapElement(document, contentChild, "level3");
                        levelNo = 4;
                    } else if(contentChild.localName == "p"){
                        for(const childs of contentChild.childNodes){
                            if(childs.className == "Heading3Char"){
                                wrapElement(document, childs, "level" + levelNo);
                            }
                        }
                    }
                }

                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll("img"), function (node) { node.remove(); });
                Array.prototype.forEach.call(document.querySelectorAll(".c27"), function (node) { node.remove(); });
                Array.prototype.forEach.call(document.querySelectorAll(".c0"), function (node) { node.remove(); });

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