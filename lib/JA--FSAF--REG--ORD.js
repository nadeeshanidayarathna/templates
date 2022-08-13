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

            const delayDownload = {
                waitUntil: "networkidle2",
                timeout: 0
            }

            await base.downloadPage(page, url, sp, path, delayDownload);

            // 2.Identify
            // 3.Wrap
            await page.waitForSelector("#contentsLaw");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelector("#lawTitle")
                wrapElement(document, level1Element, "level1");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector("#contentsLaw");
                wrapElement(document, contentElement, "ease-content");

                const elements = document.querySelectorAll(".active.MainProvision")[0];
                for(const element of elements.childNodes){
                    if(element.className == "active Chapter"){
                        wrapElement(document, element, "level2");
                    } else if(element.className == "active Article"){
                        let arrlevel2 = [];
                        for(const childs of element.childNodes){
                            if(childs.className == "_div_ArticleCaption"){
                                arrlevel2.push(childs);
                            } else if(childs.className == "_div_ArticleTitle"){
                                for(const child of childs.childNodes){
                                    if(child.nodeName == "SPAN"){
                                        arrlevel2.push(child);
                                    }
                                }
                            }
                        }
                        wrapElements(document, arrlevel2, "level3", group = false);
                    }
                }

                const contentL2 = document.querySelectorAll("._div_AppdxTableTitle")[0];
                wrapElement(document, contentL2, "level2");

                // TODO:
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