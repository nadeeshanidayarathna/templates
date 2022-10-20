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
            await page.waitForSelector('#MainContent_pnlHtmlControls');
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                                                
                const section1Elements = document.querySelectorAll(".WordSection1 > .MsoNormal");
                for(const rootTitle of section1Elements){
                    if(rootTitle.textContent.match(/Financial Sector.*[(]reporting\sstandard.*No.\s27/)){
                        wrapElement(document, rootTitle, "level1");
                    }
                }

                wrapElementDate(document, "issue-date", "2019-06-17" + "T00:00:00");
                wrapElementDate(document, "effective-date", "2019-07-01" + "T00:00:00");


                // ################
                // # content:info #
                // ################

                const contentElement = document.querySelector('#MainContent_pnlHtmlControls');
                wrapElement(document, contentElement, "ease-content");
                
                // Section 01 & 02

                const level2ElementsType1 = document.querySelectorAll(".WordSection1 > .MsoNormal");
                for (const level2Element of level2ElementsType1) {
                    if (level2Element.textContent.trim().startsWith('Schedule')) {
                        wrapElement(document, level2Element, "level2");
                    }
                }
                
                const level3ElementsType1 = document.querySelectorAll('.WordSection2 > h1');
                for(const level3Element of level3ElementsType1){
                    wrapElement(document, level3Element, "level3");
                }
                
                // Section 03

                const section3Elements = document.querySelectorAll(".WordSection3 .MsoNormalTable .D2Aform");
                for (const element of section3Elements) {
                    if (element.textContent.trim().startsWith('ARF_323_0:')) {
                        wrapElement(document, element, "level2");
                    }
                    else if (element.textContent.match(/^Section\s{1,}\w:\s{1,}.*/)) {
                        wrapElement(document, element, "level3");
                    }
                    else if (element.textContent.match(/^\d{1,}.\s{1,}/)) {
                        wrapElement(document, element, "level4");
                    }
                }

                // Section 04

                const level2ElementsType3 = document.querySelectorAll(".WordSection4 > .MsoTitle");
                var level2TitleType3SP = 0;
                var section4LineCounter = 0;
                for(const element of level2ElementsType3){
                    if(element.textContent.startsWith("Reporting Form ARF 323.0")){
                        level2TitleType3SP = section4LineCounter;
                    }
                    else if(element.textContent.match(/^Specific\sinstructions/)){
                        wrapElement(document, element, "level3");
                    }
                    section4LineCounter++;
                }
                
                var level2TitleText = [];
                for(let i = level2TitleType3SP; i < level2TitleType3SP + 3 ; i++){
                    level2TitleText.push(level2ElementsType3[i]);
                    Array.prototype.forEach.call(level2ElementsType3[i], function (node) { node.remove(); });
                    if(i != level2TitleType3SP + 2){
                        level2TitleText.push(" ");
                    }
                }
                wrapElements(document, level2TitleText, "level2", group = true);

                const section4Titles = document.querySelectorAll(".WordSection4 > h1");
                for(const element of section4Titles){
                    if(element.textContent.startsWith("General directions")){
                        wrapElement(document, element, "level3");
                    }
                    else{
                        wrapElement(document, element, "level4");
                    }
                }

                const level5Elements = document.querySelectorAll(".WordSection4 > .MsoNormal > b");
                for(const level5Element of level5Elements){
                    if(level5Element.textContent.match(/^\d{1,}.\s{1,}/)){
                        wrapElement(document, level5Element, "level5");
                    }
                }

                const footnoteElements = document.querySelectorAll('div[id*="ftn"]');
                for(const footnoteElement of footnoteElements){
                    wrapElement(document, footnoteElement, "footnote");
                }

                // Remove unwanted elements
                Array.prototype.forEach.call(document.querySelectorAll(".WordSection1 img, .WordSection2 img"), function (node) { node.remove(); });
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