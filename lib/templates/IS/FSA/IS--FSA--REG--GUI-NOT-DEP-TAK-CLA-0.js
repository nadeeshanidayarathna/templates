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
            await base.downloadPage(page, url, sp, path, null, encoding = 'utf16le');

            // 2.Identify
            // 3.Wrap
            await page.waitForSelector("body");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############

                // TODO:
                const rootTitle = "GUIDANCE NOTE FOR DEPOSIT TAKERS (Class 1(1) and Class 1(2)) Large Exposures March 2017";
                wrapElementLevel1(document, rootTitle);
                wrapElementDate(document, "issue-date", "2017-03-01" + "T00:00:00");

                // ################
                // # content:info #
                // ################

                const content = document.querySelector("body");
                wrapElement(document, content, "ease-content");

                // Level2 automatically captured

                // Level3
                const level3Elements = document.querySelectorAll("h2");
                wrapElements(document, level3Elements, "level3");

                // level4

                const level4ElementsType1 = document.querySelectorAll(".WordSection1 > .MsoNormal");
                for(const element of level4ElementsType1){
                    if(element.textContent.match(/^\d{1,2}.\d{1,2}\s/)){
                        const level4ElementText = /^\d{1,2}.\d{1,2}/.exec(element.textContent);
                        element.outerHTML = element.outerHTML.replace(level4ElementText, "<div title=\"level4\" class=\"level4\">" + level4ElementText + "</div>");
                    }
                }

                const level4ElementsType2 = document.querySelectorAll(".WordSection1 > h3");
                for(const element of level4ElementsType2){
                    if(element.textContent.match(/^\d{1,2}.\d{1,2}\s/)){
                        const level4ElementText = /^\d{1,2}.\d{1,2}/.exec(element.textContent);
                        element.outerHTML = element.outerHTML.replace(level4ElementText, "<div title=\"level4\" class=\"level4\">" + level4ElementText + "</div>");
                    }
                }

                const level4ElementsType3 = document.querySelectorAll(".WordSection1 > h4");
                for(const element of level4ElementsType3){
                    if(element.textContent.match(/^\d{1,2}.\d{1,2}\s/)){
                        const level4ElementText = /^\d{1,2}.\d{1,2}/.exec(element.textContent);
                        element.outerHTML = element.outerHTML.replace(level4ElementText, "<div title=\"level4\" class=\"level4\">" + level4ElementText + "</div>");
                    }
                }

                // Footnotes
                const footnoteElemets = document.querySelectorAll('div[id*="ftn"] > .footnotedescription:nth-child(1)');
                wrapElements(document, footnoteElemets, "footnote");
                
                return Promise.resolve();
            });
            // 4.Write
            await base.writePage(page, url, sp, path, true, true,true);
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