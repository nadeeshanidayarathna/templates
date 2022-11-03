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
                const level1Element = document.querySelector('h6');
                wrapElement(document, level1Element, "level1");

                wrapElementDate(document, "issue-date", "2022-10-06" + "T00:00:00");
                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('body');
                wrapElement(document, contentElement, "ease-content");

                const level4Element = document.querySelectorAll('span, h1, h2, h3, h4');
                let lvlNo;
                for(const child of level4Element){
                    if(child.nodeName == "H1"){
                        wrapElement(document, child, "level2");
                    }else if(child.nodeName == "H2"){
                        wrapElement(document, child, "level3");
                        lvlNo = 4;
                    }else if(child.nodeName == "H3" && !child.textContent.includes("Key points")){
                        wrapElement(document, child, "level4");
                        lvlNo = 5;
                    } else if(child.nodeName == "H4"){
                        wrapElement(document, child, "level5");
                        lvlNo = 6;
                    }
                    else if(child.outerText.match(/^RG \d\d\d./)){
                        wrapElement(document, child, "level"+lvlNo);
                    }
                }
                

        
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