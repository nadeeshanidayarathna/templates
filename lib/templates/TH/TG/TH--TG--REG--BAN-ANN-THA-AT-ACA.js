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
                var titleEndpoint = [];
                const contentRows = document.querySelectorAll('.Section1 > .MsoNormal');
                for(const lineElement of contentRows){
                    if(lineElement.textContent.match(/^[๑|๒|๓|๔|๕][.]\s/)){
                        if(level2TitleCount < 5){
                            wrapElement(document, lineElement, "level2");
                            Array.prototype.forEach.call(lineElement, function (node) { node.remove(); });
                        }
                        level2TitleCount++;
                    }
                    else if(lineElement.textContent.match(/^[๑|๒|๓|๔|๕].[๑|๒][\s|.][นิ|ห|๑].*/)){
                        const level3Text = /^[๑|๒|๓|๔|๕].[๑|๒][\s|.][นิ|ห|๑].*/.exec(lineElement.textContent);
                        lineElement.outerHTML = lineElement.outerHTML.replace(
                            level3Text,
                            '<div title="level3" class = "level3">' + level3Text + "</div>"
                        );
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
                for(let i = 2; i <= titleEndpoint[0] ; i++){
                    rootTitleText.push(titleLine[i-1]);
                    Array.prototype.forEach.call(titleLine[i-1], function (node) { node.remove(); });
                    if(i != titleEndpoint[0]){
                        rootTitleText.push(" ");
                    }
                }
                wrapElements(document, rootTitleText, "level1", group = true);

                wrapElementDate(document, "issue-date", "2018-04-16" + "T00:00:00");

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