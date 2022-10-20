const { group, count } = require("yargs");
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
            await page.waitForSelector("body");
            await page.evaluate(function process() {
                                
                // ################
                // # content:info #
                // ################

                const contentElement = document.querySelector('body');
                wrapElement(document, contentElement, "ease-content");
                                
                var lineElementCount = 0;
                var titleStartpoint = [];
                var titleEndpoint = [];
                const contentRows = document.querySelectorAll('.Section1 > .MsoNormal');
                for(const lineElement of contentRows){
                    if(lineElement.querySelector(".Section1 > .MsoNormal > u:first-of-type")){
                        titleEndpoint.push(lineElementCount);
                    }
                    else if(lineElement.textContent.startsWith("หมวด")){
                        titleStartpoint.push(lineElementCount);
                    }
                    else if(lineElement.textContent.startsWith("บทเฉพาะกาล")){
                        titleStartpoint.push(lineElementCount);
                    }
                    lineElementCount++;
                }
                console.log(titleStartpoint.length);
                console.log(titleEndpoint.length);

                const level3Elements = document.querySelectorAll('.Section1 > .MsoNormal > a[name^="S"]');
                for(const level3Element of level3Elements){
                    wrapElement(document, level3Element, "level3")
                }

                // #############
                // # root:info #
                // #############
                    
                const titleLine = document.querySelectorAll(".Section1 > .MsoNormal");
                var rootTitleText = [];
                for(let i = 1; i <= titleEndpoint[0] ; i++){
                    rootTitleText.push(titleLine[i-1]);
                    Array.prototype.forEach.call(titleLine[i-1], function (node) { node.remove(); });
                    if(i != titleEndpoint[0]){
                        rootTitleText.push(" ");
                    }
                }
                wrapElements(document, rootTitleText, "level1", group = true);

                wrapElementDate(document, "issue-date", "2018-05-10" + "T00:00:00");

                for(var j = 0; j < titleStartpoint.length; j++){
                    var level2TitleText = [];
                    for(var i = titleStartpoint[j]; i <= titleEndpoint[j+1]; i++){
                        level2TitleText.push(titleLine[i-1]);
                        Array.prototype.forEach.call(titleLine[i-1], function (node) { node.remove(); });
                        if(i != titleEndpoint[j+1]){
                            level2TitleText.push(" ");
                        }
                    }
                    wrapElements(document, level2TitleText, "level2", group = true);
                }

                const footnoteElement = document.querySelector('.MsoFootnoteText');
                wrapElement(document, footnoteElement, "footnote");
                
                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll(".Section1 > .MsoNormal > u"), function (node) { node.remove(); });

                return Promise.resolve();
            });

            // 4.Write
            await base.writePage(page, url, sp, path, true);
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