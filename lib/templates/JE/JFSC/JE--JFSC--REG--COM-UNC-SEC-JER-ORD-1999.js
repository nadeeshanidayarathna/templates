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

                const rootTitle = document.querySelectorAll("h1");
                wrapElements(document, rootTitle, "level1");
                wrapElementDate(document, "issue-date", "2019-01-01T00:00:00");

                // ################
                // # content:info #
                // ################

                const content = document.querySelector("body");
                wrapElement(document, content, "ease-content");

                const level2Element = document.querySelectorAll("h2");               
                for(const child of level2Element){
                    if(child.nextElementSibling !== null){
                        if(child.nextElementSibling.nodeName == "H2"){
                            let arrList = [];
                            arrList.push(child);
                            arrList.push(child.nextElementSibling);
                            wrapElements(document, arrList, "level2", group=true);
                        }
                    }

                }
                const level2ElementN = document.querySelectorAll("h6");
                wrapElements(document, level2ElementN, "level2");

                const level3Elements = document.querySelectorAll("h3");
                wrapElements(document, level3Elements, "level3");

                const footnoteElements = document.querySelectorAll(".MsoEndnoteText");
                wrapElements(document, footnoteElements, "footnote");

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