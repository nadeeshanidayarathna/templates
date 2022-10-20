
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
                const rootTitle = document.querySelector(".LI-Title");
                wrapElement(document, rootTitle, "level1");
                
                wrapElementDate(document, "issue-date", "2020-12-12" + "T00:00:00");
                wrapElementDate(document, "effective-date", "2020-12-12" + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('#MainContent_pnlHtmlControls');
                wrapElement(document, contentElement, "ease-content");

                const level2Elements = document.querySelectorAll('.LI-Heading1');
                wrapElements(document, level2Elements, "level2");

                const level3Elements = document.querySelectorAll(".LI-Heading2");
                wrapElements(document, level3Elements, "level3");

                // Section 4
                const section4ElementsType1 = document.querySelectorAll(".WordSection4 > .LI-BodyTextNumbered");
                for(const element of section4ElementsType1){
                    if(element.textContent.match(/^Schedule\s{1,}\d{1,}/)){
                        wrapElement(document, element, "level4");
                    }
                    else if(element.textContent.match(/^Part\s{1,}\d—/)){
                        wrapElement(document, element, "level5");
                    }
                    else if(element.textContent.match(/^Division\s{1,}\d—/)){
                        wrapElement(document, element, "level6");
                    }
                    else if(element.textContent.match(/^\d\d\d\s{1,}/)){
                        wrapElement(document, element, "level7");
                    }
                }

                const section4ElementsType2 = document.querySelectorAll(".WordSection4 > .MsoNormal");
                for(const element of section4ElementsType2){
                    if(element.textContent.match(/^\d\d\d\s{1,}/)){
                        wrapElement(document, element, "level7");
                    }
                }

                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll(".WordSection2, .WordSection1 img"), function (node) { node.remove(); });

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