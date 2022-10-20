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
          

            await page.waitForSelector(".rptrTd");
            
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
             
                const section1Elements = document.querySelectorAll(".WordSection1 > .MsoNormal");
                for(const element of section1Elements){
                    if(element.textContent.match(/^Exposure\s{1,}draft/)){
                        wrapElement(document, element, "level1");
                    }
                }

                wrapElementDate(document, "issue-date", "2022-08-23" + "T00:00:00"); 

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('.notetext');
                wrapElement(document, contentElement, "ease-content");

                const level2Elements = document.querySelectorAll("h4");
                var level2TitleSP = 0;
                var lineCounter = 0;
                for(const element of level2Elements){
                    if(element.textContent.startsWith("INSURANCE REGULATORY")){
                        level2TitleSP = lineCounter;
                    }
                    else if(element.textContent.startsWith("Insurance Regulatory")){
                        wrapElement(document, element, "level3");
                    }
                    lineCounter++;
                }
                
                var level2Title = [];
                for(let i = level2TitleSP; i < level2TitleSP + 2 ; i++){
                    level2Title.push(level2Elements[i]);
                    Array.prototype.forEach.call(level2Elements[i], function (node) { node.remove(); });
                    if(i != level2TitleSP + 2){
                        level2Title.push(" ");
                    }
                }
                wrapElements(document, level2Title, "level2", group = true);

                const section1ElementsType2 = document.querySelectorAll(".WordSection1 > h1 > span:nth-child(1)");
                for(const element of section1ElementsType2){
                    wrapElement(document, element, "level4");
                }

                const section2Elements = document.querySelectorAll(".WordSection2 > .MsoNormal");
                for(const element of section2Elements){
                    if(element.textContent.startsWith("Schedule")){
                        wrapElement(document, element, "level3");
                    }
                    else if(element.textContent.match(/^Table\s/)){
                        wrapElement(document, element, "level4");
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