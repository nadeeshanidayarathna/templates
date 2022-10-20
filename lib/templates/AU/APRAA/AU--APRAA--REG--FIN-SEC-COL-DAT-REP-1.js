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
            await page.waitForSelector('div[lang="EN-AU"]');
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                                                
                const mainTitles = document.querySelectorAll(".Section1 > .MsoTitle > span");
                for(const rootTitle of mainTitles){
                    if(rootTitle.textContent.match(/\sGRS 115.1 Premiums Liabilities – Insurance Risk Charge/)){
                        const rootTitleText = /\sGRS 115.1 Premiums Liabilities – Insurance Risk Charge/.exec(rootTitle.textContent);
                        wrapElementLevel1(document, rootTitleText);
                    }
                }

                const metadataAll = document.querySelectorAll(".Section1 > .MsoNormal > span");
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

                const contentElement = document.querySelector('div[lang="EN-AU"]');
                wrapElement(document, contentElement, "ease-content");
                
                const level2Elements = document.querySelectorAll("p > .CharSchNo");
                for (const level2Element of level2Elements) {
                    if (level2Element.textContent.trim().startsWith('Schedule')) {
                        wrapElement(document, level2Element, "level2");
                    }
                }

                // Remove unwanted elements
                Array.prototype.forEach.call(document.querySelectorAll(".Section1 > .MsoNormal:nth-child(1), .Section3 > .MsoNormal:nth-child(1)"), function (node) { node.remove(); });
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