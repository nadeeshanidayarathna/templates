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
            await page.waitForSelector(".WordSection1");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############

                // TODO:
                const level1Element = document.querySelector(".shorttitle");
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2021-11-29" + "T00:00:00");
                // ################
                // # content:info #
                // ################

                // TODO:
                const content = document.querySelector(".WordSection1");
                wrapElement(document, content, "ease-content");

                const level2Elements = document.querySelectorAll("h2");
                wrapElements(document, level2Elements, "level2");
     
                let levelNo = 3;
                const elements = document.querySelectorAll(".WordSection1");
                    for(const element of elements){
                        for(const childs of element.childNodes){
                            if(childs.nodeName == "H4" && childs.nextElementSibling.className == "section"){
                                let arrElement = []
                                    const level3 = childs.nextElementSibling.childNodes[1]
                                        arrElement.push(level3)
                                        arrElement.push(childs)
                                            wrapElements(document, arrElement, "level"+levelNo, group = true);
                            } else if(childs.nodeName == "H3"){
                                wrapElement(document, childs, "level3");
                                levelNo = 4;
                            } else if(childs.className == "section" && childs.childNodes[1].textContent.startsWith("Omitted")){
                                wrapElement(document, childs, "level4");
                            }
                        }
                    }
                Array.prototype.forEach.call(document.querySelectorAll(".MsoNormalTable, .chapter, .MsoNormal > a, .line, .ConsolidationPeriod, .comment, .toc"), function (node) { node.remove(); });
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