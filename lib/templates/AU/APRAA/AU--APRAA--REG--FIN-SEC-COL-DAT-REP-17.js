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
                for(const element of section1Elements){
                    if(element.textContent.match(/Financial Sector.*[(]reporting\sstandard.*No.\s8/)){
                        wrapElement(document, element, "level1");
                    }
                    else if (element.outerText.trim().startsWith('Dated')) {
                        let fullText = element.outerText;
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
                    if(level3Element.firstChild.nodeName == "B" && level3Element.nextElementSibling.tagName == "P" && !(level3Element.textContent.match(/^Reporting/))){
                        wrapElement(document, level3Element, "level3");
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