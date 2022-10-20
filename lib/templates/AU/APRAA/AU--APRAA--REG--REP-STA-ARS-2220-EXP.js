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

                var images = document.querySelectorAll("img");
                images.forEach(e => {
                    e.src = e.src;
                })
                                                
                const section1Elements = document.querySelectorAll(".WordSection1 > .MsoTitle");
                for(const rootTitle of section1Elements){
                    if(rootTitle.textContent.match(/Financial Sector.*[(]reporting\sstandard.*No.\s11/)){
                        wrapElement(document, rootTitle, "level1");
                    }
                }

                const metadataAll = document.querySelectorAll(".WordSection1 > .MsoNormal > span");
                for (const DateElement of metadataAll) {
                    if (DateElement.outerText.trim().startsWith('Dated')) {
                        let fullText = DateElement.outerText;
                        let check = (fullText.indexOf(" ") + 1)
                        let part2 = fullText.substring(check, fullText.length);
                        const dateFormat = (new Date(part2).toLocaleDateString('fr-CA'));
                        wrapElementDate(document, "issue-date", dateFormat + "T00:00:00");
                    }
                }

                wrapElementDate(document, "effective-date", "2022-01-01" + "T00:00:00");


                // ################
                // # content:info #
                // ################

                const contentElement = document.querySelector('#MainContent_pnlHtmlControls');
                wrapElement(document, contentElement, "ease-content");
                
                // Section 01 & 02

                const level2ElementType1 = document.querySelector(".WordSection1 .CharSchNo");
                wrapElement(document, level2ElementType1, "level2");
                
                const level3ElementsType1 = document.querySelectorAll('.WordSection2 > h2');
                for(const level3Element of level3ElementsType1){
                    wrapElement(document, level3Element, "level3");
                }
                
                // Section 03

                const section3Elements = document.querySelectorAll(".WordSection3 p");
                for (const element of section3Elements) {
                    if (element.textContent.trim().startsWith('ARF_222_0:')) {
                        wrapElement(document, element, "level2");
                    }
                    else if (element.textContent.match(/^Section\s\w:/)) {
                        wrapElement(document, element, "level3");
                    }
                }

                // Section 04

                const section4Elements = document.querySelectorAll(".WordSection4 p");
                for (const element of section4Elements) {
                    if (element.textContent.trim().startsWith('ARF_222_1:')) {
                        wrapElement(document, element, "level2");
                    }
                }

                // Section 05

                const level2ElementsType4 = document.querySelectorAll(".WordSection5 > h1");
                var level2TitleType4SP = 0;
                var section5LineCounter = 0;
                for(const element of level2ElementsType4){
                    if(element.textContent.startsWith("Reporting Form ARF 222.0")){
                        level2TitleType4SP = section5LineCounter;
                    }
                    section5LineCounter++;
                }
                
                var level2Title1 = [];
                for(let i = level2TitleType4SP; i < level2TitleType4SP + 3 ; i++){
                    level2Title1.push(level2ElementsType4[i]);
                    Array.prototype.forEach.call(level2ElementsType4[i], function (node) { node.remove(); });
                    if(i != level2TitleType4SP + 2){
                        level2Title1.push(" ");
                    }
                }
                wrapElements(document, level2Title1, "level2", group = true);

                const level3ElementsType3 = document.querySelectorAll(".WordSection5 strong");
                for(const level3Element of level3ElementsType3){
                    wrapElement(document, level3Element, "level3");
                }

                const section5Elements = document.querySelectorAll(".WordSection5 h2");
                for(const element of section5Elements){
                    if(element.textContent.startsWith("Specific instructions")){
                        wrapElement(document, element, "level3");
                    }
                    else if(!(element.textContent.match(/^Memorandum\sItems/)) && !(element.textContent.match(/^Funding-only\ssecuritisations/))){
                        wrapElement(document, element, "level4");
                    }
                }

                // Section 06

                const level2ElementsType5 = document.querySelectorAll(".WordSection6 > h1");
                var level2TitleType5SP = 0;
                var section6LineCounter = 0;
                for(const element of level2ElementsType5){
                    if(element.textContent.startsWith("Reporting Form ARF 222.0")){
                        level2TitleType5SP = section6LineCounter;
                    }
                    section6LineCounter++;
                }

                var level2Title2 = [];
                for(let i = level2TitleType5SP; i < level2TitleType5SP + 3 ; i++){
                    level2Title2.push(level2ElementsType5[i]);
                    Array.prototype.forEach.call(level2ElementsType5[i], function (node) { node.remove(); });
                    if(i != level2TitleType5SP + 2){
                        level2Title2.push(" ");
                    }
                }
                wrapElements(document, level2Title2, "level2", group = true);

                const level3ElementsType4 = document.querySelectorAll(".WordSection6 strong");
                for(const level3Element of level3ElementsType4){
                    wrapElement(document, level3Element, "level3");
                }

                const section6Elements = document.querySelectorAll(".WordSection6 h2");
                for(const element of section6Elements){
                    if(element.textContent.startsWith("Specific instructions")){
                        wrapElement(document, element, "level3");
                    }
                    else{
                        wrapElement(document, element, "level4");
                    }
                }

                const level4ElementsType1 = document.querySelectorAll(".WordSection6 .MsoNormal");
                for(const element of level4ElementsType1){
                    if(element.textContent.startsWith("Definitions") || element.textContent.startsWith("Basis of preparation")){
                        wrapElement(document, element, "level4");
                    }
                }

                // Remove unwanted elements
                Array.prototype.forEach.call(document.querySelectorAll(".WordSection1 >.MsoNormal img, .WordSection2 >.MsoNormal img"), function (node) { node.remove(); });
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