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
                    if(rootTitle.textContent.match(/Financial Sector.*[(]reporting\sstandard.*No.\s9/)){
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
                    if(level3Element.firstChild.nodeName == "B" && level3Element.nextElementSibling.tagName == "P" && !(level3Element.textContent.startsWith("Reporting Standard"))){
                        wrapElement(document, level3Element, "level3");
                    }
                }
                
                // Section 03

                const section3Elements = document.querySelectorAll(".WordSection3 .MsoNormalTable .D2Aform");
                for (const element of section3Elements) {
                    if (element.textContent.trim().startsWith('ARF_720_1A:')) {
                        wrapElement(document, element, "level2");
                    }
                    else if (element.textContent.match(/^\d.\s{1,}/)) {
                        wrapElement(document, element, "level3");
                    }
                }

                // Section 04

                const level2ElementsType3 = document.querySelectorAll(".WordSection4 > .MsoNormal > b");
                var level2TitleType3SP = 0;
                var section4LineCounter = 0;
                for(const element of level2ElementsType3){
                    if(element.textContent.startsWith("Reporting Form ARF 720.1A")){
                        level2TitleType3SP = section4LineCounter;
                    }
                    else if(element.textContent.match(/^Instructions/) || element.textContent.match(/Specific\sinstructions/)){
                        wrapElement(document, element, "level3");
                    }
                    section4LineCounter++;
                }
                
                var level2TitleText = [];
                for(let i = level2TitleType3SP; i < level2TitleType3SP + 2 ; i++){
                    level2TitleText.push(level2ElementsType3[i]);
                    Array.prototype.forEach.call(level2ElementsType3[i], function (node) { node.remove(); });
                    if(i != level2TitleType3SP + 2){
                        level2TitleText.push(" ");
                    }
                }
                wrapElements(document, level2TitleText, "level2", group = true);

                const section4Elements = document.querySelectorAll(".WordSection4 > .MsoNormal");
                for(const level4Element of section4Elements){
                    if(level4Element.hasChildNodes() && level4Element.firstChild.tagName == "B" && (level4Element.textContent.match(/Reporting/) || level4Element.textContent.match(/^Counterparties/) || level4Element.textContent.match(/^Loans\sand\sfinance\sleases/) || level4Element.textContent.match(/^Values/))){
                        wrapElement(document, level4Element, "level4");
                    }
                    else if(level4Element.hasChildNodes() && level4Element.firstChild.tagName == "B" && level4Element.textContent.match(/^\d.\s{1,}/)){
                        wrapElement(document, level4Element, "level4");
                    }
                }

                // Section 05

                const section5Elements = document.querySelectorAll(".WordSection5 .MsoNormalTable .D2Aform");
                for (const element of section5Elements) {
                    if (element.textContent.trim().startsWith('ARF_720_1B:')) {
                        wrapElement(document, element, "level2");
                    }
                    else if (element.textContent.match(/^\d.\s{1,}/)) {
                        wrapElement(document, element, "level3");
                    }
                }

                // Section 06

                const level2ElementsType4 = document.querySelectorAll(".WordSection6 > .MsoNormal > b");
                var level2TitleType4SP = 0;
                var section6LineCounter = 0;
                for(const element of level2ElementsType4){
                    if(element.textContent.startsWith("Reporting Form ARF 720.1B")){
                        level2TitleType4SP = section6LineCounter;
                    }
                    else if(element.textContent.match(/^Instructions/) || element.textContent.match(/Specific\sinstructions/)){
                        wrapElement(document, element, "level3");
                    }
                    section6LineCounter++;
                }
                
                var level2TitleText = [];
                for(let i = level2TitleType4SP; i < level2TitleType4SP + 2 ; i++){
                    level2TitleText.push(level2ElementsType4[i]);
                    Array.prototype.forEach.call(level2ElementsType4[i], function (node) { node.remove(); });
                    if(i != level2TitleType4SP + 2){
                        level2TitleText.push(" ");
                    }
                }
                wrapElements(document, level2TitleText, "level2", group = true);

                const section6Elements = document.querySelectorAll(".WordSection6 > .MsoNormal");
                for(const level4Element of section6Elements){
                    if(level4Element.hasChildNodes() && level4Element.firstChild.tagName == "B" && (level4Element.textContent.match(/Reporting/) || level4Element.textContent.match(/^Counterparties/) || level4Element.textContent.match(/^Loans\sand\sfinance\sleases/) || level4Element.textContent.match(/^Values/))){
                        wrapElement(document, level4Element, "level4");
                    }
                    else if(level4Element.hasChildNodes() && level4Element.firstChild.tagName == "B" && level4Element.textContent.match(/^\d.\s{1,}/)){
                        wrapElement(document, level4Element, "level4");
                    }
                }

                const footnoteElements = document.querySelectorAll('div[id*="ftn"]');
                for(const footnoteElement of footnoteElements){
                    wrapElement(document, footnoteElement, "footnote");
                }

                // Remove empty cell contents
                const section4FirstCells = document.querySelectorAll(".WordSection4 td:nth-child(1) > .MsoNormal");
                for(const element of section4FirstCells){
                    if(!element.textContent.match(/\w.*/)){
                        element.remove();
                    }
                }

                // Remove unwanted elements
                Array.prototype.forEach.call(document.querySelectorAll(".WordSection1 img, .WordSection2 img, .WordSection4 td > .MsoListParagraph"), function (node) { node.remove(); });
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