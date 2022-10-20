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
            await page.waitForSelector("body");
            await page.evaluate(function process() {
                                
                // ################
                // # content:info #
                // ################

                const contentElement = document.querySelector('body');
                wrapElement(document, contentElement, "ease-content");
                                
                var level2TitleCount = 0;
                var lineElementCount = 0;
                var level2TitleType2TextSP = [];
                var titleEndpoint = [];
                const contentRows = document.querySelectorAll('.Section1 > .MsoNormal');
                for(const lineElement of contentRows){
                    if(lineElement.textContent.match(/^ข้อ\s.\s\s.*/)){
                        if(level2TitleCount < 5){
                            const level2Text = /^ข้อ\s./.exec(lineElement.textContent);
                            lineElement.outerHTML = lineElement.outerHTML.replace(
                                level2Text,
                                '<div title="level2" class = "level2">' + level2Text + "</div>"
                            );
                        }else{
                            const level3Text = /^ข้อ\s./.exec(lineElement.textContent);
                            lineElement.outerHTML = lineElement.outerHTML.replace(
                                level3Text,
                                '<div title="level3" class = "level3">' + level3Text + "</div>"
                            ); 
                        }
                        level2TitleCount++;
                        
                    }
                    else if(lineElement.textContent.match(/^หมวด\s./)){
                        level2TitleType2TextSP.push(lineElementCount+1);

                    }
                    else if(lineElement.querySelector(".Section1 > .MsoNormal > u") != null){
                        titleEndpoint.push(lineElementCount);
                    }
                    lineElementCount++;
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

                wrapElementDate(document, "issue-date", "2017-04-25" + "T00:00:00");

                for(var j = 0; j < level2TitleType2TextSP.length; j++){
                    var level2TitleType2Text = [];
                    for(var i = level2TitleType2TextSP[j]; i <= titleEndpoint[j+1]; i++){
                        level2TitleType2Text.push(titleLine[i-1]);
                        Array.prototype.forEach.call(titleLine[i-1], function (node) { node.remove(); });
                        if(i != titleEndpoint[j+1]){
                            level2TitleType2Text.push(" ");
                        }
                    }
                    wrapElements(document, level2TitleType2Text, "level2", group = true);
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