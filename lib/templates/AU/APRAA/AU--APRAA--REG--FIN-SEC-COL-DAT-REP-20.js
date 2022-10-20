const { group, wrap } = require("yargs");
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
                    if(rootTitle.textContent.match(/Financial Sector.*[(]reporting\sstandard.*No.\s4/)){
                        wrapElement(document, rootTitle, "level1");
                    }
                }

                const metadataAll = document.querySelectorAll(".WordSection1 > .MsoNormal");
                for (const DateElement of metadataAll) {
                    if (DateElement.outerText.trim().startsWith('Dated')) {
                        let fullText = DateElement.outerText;
                        let check = (fullText.indexOf(" ") + 1)
                        let part2 = fullText.substring(check, fullText.length);
                        const dateFormat = (new Date(part2).toLocaleDateString('fr-CA'));
                        wrapElementDate(document, "issue-date", dateFormat + "T00:00:00");
                    }
                }


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
                
                const level3ElementsType1 = document.querySelectorAll('.WordSection2 > .MsoNormal');
                for(const level3Element of level3ElementsType1){
                    if(level3Element.firstChild.nodeName == "B" && level3Element.nextElementSibling.textContent.match(/^\d{1,}./) && !(level3Element.textContent.startsWith("US commercial"))){
                        wrapElement(document, level3Element, "level3");
                    }
                }
                
                // Section 03

                const section3Elements = document.querySelectorAll(".WordSection3 .MsoNormal > b");
                for (const element of section3Elements) {
                    if (element.textContent.trim().startsWith('ARF_210_1A:')) {
                        wrapElement(document, element, "level2");
                    }
                    else if (element.textContent.match(/^Section\s{1,}\w:\s{1,}/)) {
                        wrapElement(document, element, "level3");
                    }
                } 

                // Section 04

                const section4Elements = document.querySelectorAll(".WordSection4 .MsoNormal > b");
                for (const element of section4Elements) {
                    if (element.textContent.trim().startsWith('ARF_210_1B:')) {
                        wrapElement(document, element, "level2");
                    }
                    else if (element.textContent.match(/^Section\s{1,}\w:\s{1,}/)) {
                        wrapElement(document, element, "level3");
                    }
                }

                // Section 05

                const section5ElementsType1 = document.querySelectorAll(".WordSection5 > .MsoNormal > b");
                var level2TitleType4SP = 0;
                var section6LineCounter = 0;
                for(const element of section5ElementsType1){
                    if(element.textContent.startsWith("Reporting Forms ARF 210.1A")){
                        level2TitleType4SP = section6LineCounter;
                    }
                    else if(element.textContent.match(/^Reporting/) || element.textContent.match(/Specific\sinstructions/)){
                        wrapElement(document, element, "level3");
                    }
                    else if(element.textContent.match(/^Liquidity\scoverage/) || element.textContent.match(/Column\sdescription/)){
                        wrapElement(document, element, "level4");
                    }
                    else if(element.textContent.match(/^Section\s{1,}\w:\s{1,}/)){
                        wrapElement(document, element, "level4");
                    }
                    section6LineCounter++;
                }
                
                var level2TitleText = [];
                for(let i = level2TitleType4SP; i < level2TitleType4SP + 3 ; i++){
                    level2TitleText.push(section5ElementsType1[i]);
                    Array.prototype.forEach.call(section5ElementsType1[i], function (node) { node.remove(); });
                    if(i != level2TitleType4SP + 2){
                        level2TitleText.push(" ");
                    }
                }
                wrapElements(document, level2TitleText, "level2", group = true);

                const section5ElementsType2 = document.querySelectorAll(".WordSection5 .MsoNormalTable .MsoNormal > b");
                for(const element of section5ElementsType2){
                    if(element.textContent.startsWith("ARF_210_2:")){
                        wrapElement(document, element, "level2");
                    }
                    else if(element.textContent.match(/^Section\s{1,}\w:\s{1,}/)){
                        wrapElement(document, element, "level3");
                    }
                }

                // Section 06

                const level2ElementsType4 = document.querySelectorAll(".WordSection6 > .MsoNormal > b");
                var level2TitleType4SP = 0;
                var section6LineCounter = 0;
                for(const element of level2ElementsType4){
                    if(element.textContent.startsWith("Reporting Form ARF 210.2")){
                        level2TitleType4SP = section6LineCounter;
                    }
                    else if(element.textContent.match(/^Reporting/) || element.textContent.match(/Specific\sinstructions/)){
                        wrapElement(document, element, "level3");
                    }
                    else if(element.textContent.match(/^Section\s{1,}\w:\s{1,}/)){
                        wrapElement(document, element, "level4");
                    }
                    else if(element.textContent.match(/^Minimum\sliquidity/)){
                        wrapElement(document, element, "level4");
                    }
                    section6LineCounter++;
                }
                
                var level2TitleText = [];
                for(let i = level2TitleType4SP; i < level2TitleType4SP + 3 ; i++){
                    level2TitleText.push(level2ElementsType4[i]);
                    Array.prototype.forEach.call(level2ElementsType4[i], function (node) { node.remove(); });
                    if(i != level2TitleType4SP + 2){
                        level2TitleText.push(" ");
                    }
                }
                wrapElements(document, level2TitleText, "level2", group = true);

                // Section 07

                const section7Elements = document.querySelectorAll(".WordSection7 .MsoNormal > b");
                for(const level2Element of section7Elements){
                    if(level2Element.textContent.startsWith("ARF_210_3_1:")){
                        wrapElement(document, level2Element, "level2");
                    }
                }

                // Section 08

                const level2ElementsType5 = document.querySelectorAll(".WordSection8 > .MsoNormal > b");
                var level2TitleType4SP = 0;
                var section6LineCounter = 0;
                for(const element of level2ElementsType5){
                    if(element.textContent.startsWith("Reporting Form ARF 210.3.1")){
                        level2TitleType4SP = section6LineCounter;
                    }
                    else if(element.textContent.match(/^Reporting/) || element.textContent.match(/Specific\sinstructions/)){
                        wrapElement(document, element, "level3");
                    }
                    else if(element.textContent.match(/^Column\sand\srow/)){
                        wrapElement(document, element, "level4");
                    }
                    section6LineCounter++;
                }
                
                var level2TitleText = [];
                for(let i = level2TitleType4SP; i < level2TitleType4SP + 3 ; i++){
                    level2TitleText.push(level2ElementsType5[i]);
                    Array.prototype.forEach.call(level2ElementsType5[i], function (node) { node.remove(); });
                    if(i != level2TitleType4SP + 2){
                        level2TitleText.push(" ");
                    }
                }
                wrapElements(document, level2TitleText, "level2", group = true);

                // Section 09

                const section9Elements = document.querySelectorAll(".WordSection9 > .MsoNormalTable");
                for(const level2Element of section9Elements){
                    if(level2Element.textContent.match(/ARF_210_3_2:/)){
                        wrapElement(document, level2Element, "level2");
                    }
                }

                // Section 10

                const level2ElementsType6 = document.querySelectorAll(".WordSection10 > .MsoNormal > b");
                var level2TitleType4SP = 0;
                var section6LineCounter = 0;
                for(const element of level2ElementsType6){
                    if(element.textContent.startsWith("Reporting Form ARF 210.3.2")){
                        level2TitleType4SP = section6LineCounter;
                    }
                    else if(element.textContent.match(/^Reporting/) || element.textContent.match(/Specific\sinstructions/)){
                        wrapElement(document, element, "level3");
                    }
                    else if(element.textContent.match(/^Column\sand\srow/)){
                        wrapElement(document, element, "level4");
                    }
                    section6LineCounter++;
                }
                
                var level2TitleText = [];
                for(let i = level2TitleType4SP; i < level2TitleType4SP + 3 ; i++){
                    level2TitleText.push(level2ElementsType6[i]);
                    Array.prototype.forEach.call(level2ElementsType6[i], function (node) { node.remove(); });
                    if(i != level2TitleType4SP + 2){
                        level2TitleText.push(" ");
                    }
                }
                wrapElements(document, level2TitleText, "level2", group = true);

                // Section 11

                const section11Elements = document.querySelectorAll(".WordSection11 > .MsoNormalTable");
                for(const element of section11Elements){
                    if(element.textContent.match(/ARF_210_4:/)){
                        wrapElement(document, element, "level2");
                    }
                    else if(element.textContent.match(/Section\s{1,}\w:\s{1,}/)){
                        wrapElement(document, element, "level3");
                    }
                }

                // Section 12

                const level2ElementsType7 = document.querySelectorAll(".WordSection12 > .MsoNormal > b");
                var level2TitleType4SP = 0;
                var section6LineCounter = 0;
                for(const element of level2ElementsType7){
                    if(element.textContent.startsWith("Reporting Form ARF 210.4")){
                        level2TitleType4SP = section6LineCounter;
                    }
                    else if(element.textContent.match(/^Reporting/) || element.textContent.match(/Specific\sinstructions/)){
                        wrapElement(document, element, "level3");
                    }
                    else if(element.textContent.match(/^Section\s{1,}\w:\s{1,}/)){
                        wrapElement(document, element, "level4");
                    }
                    section6LineCounter++;
                }
                
                var level2TitleText = [];
                for(let i = level2TitleType4SP; i < level2TitleType4SP + 3 ; i++){
                    level2TitleText.push(level2ElementsType7[i]);
                    Array.prototype.forEach.call(level2ElementsType7[i], function (node) { node.remove(); });
                    if(i != level2TitleType4SP + 2){
                        level2TitleText.push(" ");
                    }
                }
                wrapElements(document, level2TitleText, "level2", group = true);

                // Section 13

                const section13Elements = document.querySelectorAll(".WordSection13 > .MsoNormalTable");
                for(const level2Element of section13Elements){
                    if(level2Element.textContent.match(/ARF_210_5:/)){
                        wrapElement(document, level2Element, "level2");
                    }
                }

                // Section 14

                const level2ElementsType8 = document.querySelectorAll(".WordSection14 > .MsoNormal > b");
                var level2TitleType4SP = 0;
                var section6LineCounter = 0;
                for(const element of level2ElementsType8){
                    if(element.textContent.startsWith("Reporting Form ARF 210.5")){
                        level2TitleType4SP = section6LineCounter;
                    }
                    else if(element.textContent.match(/^Reporting/) || element.textContent.match(/Specific\sinstructions/)){
                        wrapElement(document, element, "level3");
                    }
                    section6LineCounter++;
                }
                
                var level2TitleText = [];
                for(let i = level2TitleType4SP; i < level2TitleType4SP + 3 ; i++){
                    level2TitleText.push(level2ElementsType8[i]);
                    Array.prototype.forEach.call(level2ElementsType8[i], function (node) { node.remove(); });
                    if(i != level2TitleType4SP + 2){
                        level2TitleText.push(" ");
                    }
                }
                wrapElements(document, level2TitleText, "level2", group = true);

                const level4ElementsType1 = document.querySelectorAll(".WordSection14 > h3");
                for(const level4Element of level4ElementsType1){
                    wrapElement(document, level4Element, "level4");
                }

                // Section 15

                const section15Elements = document.querySelectorAll(".WordSection15 .D2Aform > b");
                for (const element of section15Elements) {
                    if (element.textContent.trim().startsWith('ARF_210_6:')) {
                        wrapElement(document, element, "level2");
                    }
                    else if (element.textContent.match(/^Section\s{1,}\w:\s{1,}/)) {
                        wrapElement(document, element, "level3");
                    }
                }

                // Section 16

                const level2ElementsType9 = document.querySelectorAll(".WordSection16 > .MsoNormal > b");
                var level2TitleType4SP = 0;
                var section6LineCounter = 0;
                for(const element of level2ElementsType9){
                    if(element.textContent.startsWith("Reporting Form ARF 210.6")){
                        level2TitleType4SP = section6LineCounter;
                    }
                    else if(element.textContent.match(/^Reporting/) || element.textContent.match(/Specific\sinstructions/)){
                        wrapElement(document, element, "level3");
                    }
                    else if(element.textContent.match(/^Column\sdescription/) || element.textContent.match(/^Section\s{1,}\w:\s{1,}/)){
                        wrapElement(document, element, "level4");
                    }
                    section6LineCounter++;
                }
                
                var level2TitleText = [];
                for(let i = level2TitleType4SP; i < level2TitleType4SP + 3 ; i++){
                    level2TitleText.push(level2ElementsType9[i]);
                    Array.prototype.forEach.call(level2ElementsType9[i], function (node) { node.remove(); });
                    if(i != level2TitleType4SP + 2){
                        level2TitleText.push(" ");
                    }
                }
                wrapElements(document, level2TitleText, "level2", group = true);

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