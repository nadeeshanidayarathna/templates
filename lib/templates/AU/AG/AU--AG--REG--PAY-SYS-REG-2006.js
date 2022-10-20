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
                
                const rootTitle = document.querySelector(".WordSection1 > .ShortT");
                wrapElement(document, rootTitle, "level1");

                const dateElementLines = document.querySelectorAll(".WordSection1 > .MsoNormal");
                for (const element of dateElementLines) {
                    if (element.textContent.match(/^Compilation\sdate:/)) {
                        let fullText = element.outerText;
                        const dateText = /\d{1,2}\s\w{3,}\s\d{4}/.exec(fullText);
                        const dateFormat = (new Date(dateText).toLocaleDateString('fr-CA'));
                        wrapElementDate(document, "effective-date", dateFormat + "T00:00:00");
                    }
                    else if (element.textContent.match(/^Registered:/)) {
                        let fullText = element.outerText;
                        const dateText = /\d{1,2}\s\w{3,}\s\d{4}/.exec(fullText);
                        const dateFormat = (new Date(dateText).toLocaleDateString('fr-CA'));
                        wrapElementDate(document, "issue-date", dateFormat + "T00:00:00");
                    }
                }

                // ################
                // # content:info #
                // ################

                const contentElement = document.querySelector('#MainContent_pnlHtmlControls');
                wrapElement(document, contentElement, "ease-content");

                const level2Elements = document.querySelectorAll(".WordSection3 > .ActHead5 > a");
                for (const level2Element of level2Elements) {
                    wrapElement(document, level2Element, "level2");
                }

                const level2Element = document.querySelector(".WordSection4 > .ENotesHeading1");
                wrapElement(document, level2Element, "level2");

                const level3Elements = document.querySelectorAll(".WordSection4 > .ENotesHeading2");
                for(const level3Element of level3Elements){
                    wrapElement(document, level3Element, "level3");
                }

                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll(".WordSection1 > .MsoNormal > span > img, .WordSection2"), function (node) { node.remove(); });

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