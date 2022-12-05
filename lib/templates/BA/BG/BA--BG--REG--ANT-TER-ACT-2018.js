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
            await page.waitForSelector(".doc-content");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############

                const rootTitle = "Anti- Terrorism Act 2018";
                wrapElementLevel1(document, rootTitle);
                wrapElementDate(document, "issue-date", "2018-08-10T00:00:00");
                wrapElementDate(document, "effective-date", "2018-08-10T00:00:00");

                // ################
                // # content:info #
                // ################

                const content = document.querySelector("body");
                wrapElement(document, content, "ease-content");

                // const level2Element = document.querySelectorAll(".c4");
                // for(const child of level2Element){
                //     if(child.textContent.match(/^PART /) || child.textContent.match(/^SCHEDULE/)){
                //         wrapElement(document, child, "level2");
                //     }
                // }

                const level3Element = document.querySelectorAll(".c0, .c33, .c4");
                let lvlNo;
                for(const child of level3Element){
                    if(child.textContent.match(/^PART /) || child.textContent.match(/^SCHEDULE/)){
                        wrapElement(document, child, "level2");
                        lvlNo = 3;
                    }
                    else if(child.className == "c33"){
                        wrapElement(document, child, "level3");
                        lvlNo = 4;
                    } else if(child.textContent.match(/^\d\d. /) || child.textContent.match(/^\d. /)){
                        wrapElement(document, child, "level"+ lvlNo);
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