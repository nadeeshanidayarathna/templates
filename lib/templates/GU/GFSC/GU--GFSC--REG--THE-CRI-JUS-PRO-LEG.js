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
                const level1Element = document.querySelector("h6");
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2008-10-08" + "T00:00:00");
                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('body');
                wrapElement(document, contentElement, "ease-content");

                const level2Element = document.querySelectorAll('h2');
                for(const child of level2Element){
                    if(child.nextElementSibling !== null){
                        if(child.nextElementSibling.nodeName == "H2"){
                            let arrList = [];
                            arrList.push(child);
                            arrList.push(child.nextElementSibling);
                            wrapElements(document, arrList, "level2", group=true);
                        } else {
                            wrapElement(document, child, "level2");
                        }
                    }
                }
                

                const level3Element = document.querySelectorAll('h3');
                wrapElements(document, level3Element, "level3");

                const level4Element = document.querySelectorAll('.MsoNormalnote');
                wrapElements(document, level4Element, "footnote");

                const footnoteElement = document.querySelectorAll('div');
                for(const child of footnoteElement){
                    if(child.id.match(/^ftn/)){
                        wrapElement(document, child, "footnote");
                    }
                }
                        
                // removing unwanted content from ease-content    
                Array.prototype.forEach.call(document.querySelectorAll("img"), function (node) { node.remove(); });
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