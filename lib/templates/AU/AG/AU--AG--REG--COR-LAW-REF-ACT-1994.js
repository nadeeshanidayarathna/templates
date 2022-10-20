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
            await page.waitForSelector("#MainContent_pnlHtmlControls");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const rootTitle = document.querySelector(".WordSection3 > .MsoNormal:nth-child(2)");
                wrapElement(document, rootTitle, "level1");

                const spanElementLines = document.querySelectorAll(".WordSection3 > .MsoNormal > span > i");
                for (const element of spanElementLines) {
                    if (element.textContent.match(/\d{1,2}\s\w{3,}\s\d{4}/)) {
                        let fullText = element.outerText;
                        const dateText = /\d{1,2}\s\w{3,}\s\d{4}/.exec(fullText);
                        const dateFormat = (new Date(dateText).toLocaleDateString('fr-CA'));
                        wrapElementDate(document, "issue-date", dateFormat + "T00:00:00");
                        wrapElementDate(document, "effective-date", dateFormat + "T00:00:00");
                    }
                }

                // ################
                // # content:info #
                // ################

                const contentElement = document.querySelector('#MainContent_pnlHtmlControls');
                wrapElement(document, contentElement, "ease-content");

                const titleElements = document.querySelectorAll(".WordSection3 > .MsoNormal");
                for (const titleElement of titleElements) {
                    if (titleElement.textContent.match(/^PART\s\d—.*/) && !(titleElement.textContent.match(/^PART\s\d—GENERAL/))) {
                        wrapElement(document, titleElement, "level2");
                    }
                    else if (titleElement.textContent.match(/^SCHEDULE\s\d{1,}/) && !(titleElement.textContent.match(/^SCHEDULE\s\d{1,}—/))) {
                        wrapElement(document, titleElement.children[0], "level2");
                    }
                }

                const level3ElementsType1 = document.querySelectorAll(".WordSection3 > .MsoNormal > b");
                for(const level3Element of level3ElementsType1){
                    if(level3Element.textContent.match(/^PART\s1—GENERAL/)){
                        wrapElement(document, level3Element, "level3");
                    }
                    else if(level3Element.textContent.match(/^PART\s\d$/)){
                        wrapElement(document, level3Element, "level3");
                    }
                }

                const section3Elements = document.querySelectorAll(".WordSection3 > .MsoNormal");
                var section3ElementCount = 0;
                var section3ElementSP = [];
                for(const section3Element of section3Elements){
                    if(section3Element.textContent.match(/^\d{1,3}.\s{1,}\w/) && (section3Element.children[0].tagName == "B") ){
                        section3ElementSP.push(section3ElementCount);
                        if(section3ElementCount > section3ElementSP[7]){
                            wrapElement(document, section3Element, "level4");
                        }
                    }
                    else if(section3Element.textContent.match(/^Short\stitle/)){
                        wrapElement(document, section3Element, "level3");
                    }
                    else if(section3Element.textContent.match(/^Commencement/)){
                        wrapElement(document, section3Element, "level3");
                    }
                    else if(section3Element.textContent.match(/^Corporations\sLaw/)){
                        wrapElement(document, section3Element, "level3");
                    }
                    else if(section3Element.textContent.match(/^Schedule\s[1|2|3|4|5|6]—amendment/)){
                        wrapElement(document, section3Element, "level3");
                    }

                    section3ElementCount++;
                }
                
                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll(".WordSection1, .WordSection2, .WordSection3 > .MsoNormal > img, #MainContent_pnlHtmlControls img"), function (node) { node.remove(); });

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