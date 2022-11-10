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

                const rootTitle = document.querySelector("h6");
                wrapElement(document, rootTitle, "level1");
                wrapElementDate(document, "issue-date", "2017-04-12T00:00:00");

                // ################
                // # content:info #
                // ################

                const content = document.querySelector("body");
                wrapElement(document, content, "ease-content");

                const level2Element = document.querySelectorAll("p");
                for(const child of level2Element){
                    if(child.textContent.match(/^PART/)){
                        let arrList = [];
                        arrList.push(child);
                        arrList.push(child.nextElementSibling);
                        wrapElements(document, arrList, "level2", group=true);
                    }
                }

                
                const level3Element = document.querySelectorAll(".MsoListParagraph");
                for(const child of level3Element){
                    for(const bchild of child.childNodes){
                        if(bchild.nodeName == "B"){
                            
                        if(child.nextSibling !== null){
                            let arrList = [];
                        arrList.push(child);
                        arrList.push(child.nextSibling);
                        wrapElements(document, arrList, "level3", group=true);
                        }
                        
                        }
                    }
                }
                

                // const level3Element = document.querySelectorAll(".MsoSubtitle");
                // wrapElements(document, level3Element, "level3");

                //Array.prototype.forEach.call(document.querySelectorAll("img"), function (node) { node.remove(); });
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