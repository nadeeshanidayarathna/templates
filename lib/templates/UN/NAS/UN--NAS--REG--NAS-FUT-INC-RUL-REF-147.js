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
            await page.waitForSelector("#HTA2");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const rootTitle = "Nasdaq Futures, Inc. Rulebook - Reference Guides & Alerts - Futures Regulatory Alerts #2015 - 15";
                wrapElementLevel1(document, rootTitle);
                const issueDates = document.querySelector('#NewsHeader > p > strong');
                const issueDate = (new Date(issueDates.textContent).getFullYear()) + "-" + ("0" + (new Date(issueDates.textContent).getMonth() + 1)).slice(-2) + "-" + ("0" + (new Date(issueDates.textContent).getDate())).slice(-2) 
                wrapElementDate(document, "issue-date", issueDate + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('#HTA2');
                wrapElement(document, contentElement, "ease-content");

                const level2Elements = document.querySelector("#NewsHeader > h2");
                wrapElement(document, level2Elements.childNodes[4], "level2");

                const level3Elements = document.querySelectorAll('.newscontentbox2 > p > font > strong');
                for(const element of level3Elements){
                    if(element.nextSibling == null && element.previousSibling == null){
                        wrapElement(document, element, "level3");
                    }
                }

                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll(".footnote2, hr, th"), function (node) { node.remove(); });
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